import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { SYSTEM_PROMPT, buildContextMessages } from '@/lib/ai-prompts';
import { buildAITools } from '@/lib/ai-tools';
import { getMacroMarketData, formatMacroForAI } from '@/lib/macro-data';
import { getMacroSummaryText } from '@/lib/macro-snapshot';

// Cache macro data for 5 minutes to avoid hammering Yahoo Finance on every message
let macroCacheData: { text: string; ts: number } | null = null;
const MACRO_CACHE_TTL = 5 * 60 * 1000;

// Allow responses of up to 60 seconds
export const maxDuration = 60;

// Primary: Groq llama-3.1-8b-instant (20k TPM free — avoids the 12k limit of llama-3.3-70b)
// Secondary: Groq llama-3.3-70b-versatile (better quality but only 12k TPM — used for short/simple queries)
// Fallback: Google Gemini (if GOOGLE_GENERATIVE_AI_API_KEY is set and has quota)
const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

function getModel() {
  if (process.env.GROQ_API_KEY) {
    // llama-3.3-70b-versatile: best quality for complex financial analysis.
    // Context has been trimmed to ~4k tokens base so it stays within 12k TPM free tier.
    return groqProvider('llama-3.3-70b-versatile');
  }
  // Fallback to Gemini if no Groq key
  return googleProvider('gemini-2.0-flash');
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { messages, userId, financialData, financialSummary, documentText } = await req.json();

    if (!userId) {
      console.error("No userId provided in chat request");
      return new Response("Unauthorized: No userId provided", { status: 401 });
    }

    const [
      { data: profile },
      { data: portfolio },
      { data: incomeHistory },
      { data: transactions },
    ] = await Promise.all([
      supabase
        .from('user_financial_profile')
        .select('occupation,monthly_income_range,monthly_income_exact,financial_goal,knowledge_level,risk_tolerance,other_notes')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('user_portfolio')
        .select('asset_name,asset_type,value_eur,target_percent,ticker,quantity,purchase_price')
        .eq('user_id', userId)
        .order('value_eur', { ascending: false })
        .limit(25), // Top 25 by value to keep context compact
      supabase
        .from('user_income_history')
        .select('month,year,amount,source,description')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(6),
      supabase
        .from('user_transactions')
        .select('date,description,type,amount,category')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10), // Reduced from 20 to 10
    ]);

    // Fetch macro context (cached 5 min) — injected as first system message.
    // Keep compact: only live prices + key snapshot lines to stay within Groq 12k TPM.
    let macroContextText = '';
    try {
      if (!macroCacheData || Date.now() - macroCacheData.ts > MACRO_CACHE_TTL) {
        const liveData = await getMacroMarketData();
        // Use live prices only (compact) — full snapshot available on demand via get_macro_context tool
        const liveCompact = formatMacroForAI(liveData);
        // Add a very short snapshot summary (key rates only, not the full notes)
        const snap = getMacroSummaryText();
        const snapLines = snap.split('\n').filter(l => l.startsWith('•')).slice(0, 8).join('\n');
        macroContextText = `${liveCompact}\n\nCLAVES MACRO (resumen):\n${snapLines}`;
        macroCacheData = { text: macroContextText, ts: Date.now() };
      } else {
        macroContextText = macroCacheData.text;
      }
    } catch (macroErr) {
      // Non-fatal: if macro fetch fails, AI still works without macro context
      console.warn('Macro market data fetch failed:', macroErr);
    }

    // Build context messages from user data (extracted to lib/ai-prompts.ts)
    const contextMessages = buildContextMessages({
      profile: profile as Record<string, unknown> | null,
      portfolio: portfolio as Record<string, unknown>[] | null,
      incomeHistory: incomeHistory as Record<string, unknown>[] | null,
      transactions: transactions as Record<string, unknown>[] | null,
      financialData: financialData as Record<string, unknown> | null,
      documentText: documentText as string | null,
    });

    // Build tools with injected dependencies (extracted to lib/ai-tools.ts)
    const tools = buildAITools({
      supabase,
      userId,
      financialData: financialData as Record<string, unknown> | null,
      financialSummary: financialSummary as Record<string, unknown> | null,
      documentText: documentText as string | null,
      portfolio: portfolio as Record<string, unknown>[] | null,
      profile: profile as Record<string, unknown> | null,
      incomeHistory: incomeHistory as Record<string, unknown>[] | null,
      transactions: transactions as Record<string, unknown>[] | null,
    });

    // Convert UIMessages (from client) to ModelMessages for streamText
    const modelMessages = await convertToModelMessages(messages, { tools });

    // Build macro system message (prepend before user context)
    const macroMessage = macroContextText
      ? [{ role: 'system', content: macroContextText }]
      : [];

    // Prepend context system messages to conversation
    const enrichedMessages = [...macroMessage, ...contextMessages, ...modelMessages];

    const result = await streamText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: enrichedMessages as any,
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Error in chat AI route:", message);

    return new Response(JSON.stringify({
      error: "Error procesando la solicitud a la IA",
      details: message,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
