/**
 * AI Model Provider Factory
 *
 * Priority / selection order:
 *  1. AI_PROVIDER=ollama        → Ollama (local / self-hosted, truly unlimited)
 *  2. OPENROUTER_API_KEY set    → OpenRouter (cloud, free-tier models, 128k ctx)
 *  3. GROQ_API_KEY set          → Groq (existing fallback, 12k-20k TPM)
 *  4. GOOGLE_GENERATIVE_AI_API_KEY → Google Gemini (last resort)
 *
 * Configure in .env.local:
 *   AI_PROVIDER=openrouter       # force a specific provider
 *   OPENROUTER_API_KEY=sk-or-...
 *   OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
 *   OLLAMA_BASE_URL=http://localhost:11434
 *   OLLAMA_MODEL=qwen3:14b
 */

import type { LanguageModel } from 'ai';

// ─── Provider imports (loaded lazily to avoid breaking when not installed) ───

function getOpenRouterModel(modelId?: string): LanguageModel {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createOpenRouter } = require('@openrouter/ai-sdk-provider');
  const or = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    extraHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Asesor Financiero Premium',
    },
  });
  // Default: DeepSeek V3 (free tier) — best tool-calling + financial analysis
  return or(modelId ?? process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free');
}

function getOllamaModel(modelId?: string): LanguageModel {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createOllama } = require('ollama-ai-provider');
  const ol = createOllama({
    baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
  });
  // Default: qwen3:14b — best tool-calling on Ollama (~10GB VRAM / RAM)
  // Smaller alternatives: qwen3:8b, qwen3:4b, deepseek-r1:14b
  return ol(modelId ?? process.env.OLLAMA_MODEL ?? 'qwen3:14b');
}

function getGroqModel(fast = false): LanguageModel {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createGroq } = require('@ai-sdk/groq');
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  return fast
    ? groq('llama-3.1-8b-instant')   // 20k TPM
    : groq('llama-3.3-70b-versatile'); // 12k TPM (quality)
}

function getGoogleModel(): LanguageModel {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createGoogleGenerativeAI } = require('@ai-sdk/google');
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  return google('gemini-2.0-flash');
}

// ─── Provider metadata (for UI badge) ────────────────────────────────────────

export type ProviderInfo = {
  provider: 'openrouter' | 'ollama' | 'groq' | 'google';
  model: string;
  label: string;
  unlimited: boolean;
  local: boolean;
};

export function getProviderInfo(): ProviderInfo {
  const forced = process.env.AI_PROVIDER?.toLowerCase();

  if (forced === 'ollama' || (!forced && !process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY && process.env.OLLAMA_BASE_URL)) {
    const model = process.env.OLLAMA_MODEL ?? 'qwen3:14b';
    return { provider: 'ollama', model, label: `Ollama · ${model}`, unlimited: true, local: true };
  }
  if (forced === 'openrouter' || (!forced && !!process.env.OPENROUTER_API_KEY)) {
    const model = process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free';
    const shortName = model.split('/').pop()?.replace(':free', '') ?? model;
    return { provider: 'openrouter', model, label: `OpenRouter · ${shortName}`, unlimited: true, local: false };
  }
  if (forced === 'groq' || (!forced && !!process.env.GROQ_API_KEY)) {
    return { provider: 'groq', model: 'llama-3.3-70b-versatile', label: 'Groq · Llama 3.3 70B', unlimited: false, local: false };
  }
  return { provider: 'google', model: 'gemini-2.0-flash', label: 'Google · Gemini 2.0 Flash', unlimited: false, local: false };
}

// ─── Main factory ─────────────────────────────────────────────────────────────

/**
 * Returns the primary model to use for the chat.
 * `fast` only matters for Groq (TPM fallback); ignored by other providers.
 */
export function getModel(fast = false): LanguageModel {
  const forced = process.env.AI_PROVIDER?.toLowerCase();

  // Explicit override
  if (forced === 'ollama') return getOllamaModel();
  if (forced === 'openrouter') return getOpenRouterModel();
  if (forced === 'groq') return getGroqModel(fast);
  if (forced === 'google') return getGoogleModel();

  // Auto-detect by available keys
  if (process.env.OPENROUTER_API_KEY) return getOpenRouterModel();
  if (process.env.OLLAMA_BASE_URL) return getOllamaModel();
  if (process.env.GROQ_API_KEY) return getGroqModel(fast);
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return getGoogleModel();

  // Last resort: Ollama on localhost (user may have it running)
  return getOllamaModel();
}

/**
 * Returns true when the current provider has NO token-per-minute limits
 * (OpenRouter free tier and Ollama don't throttle by TPM).
 */
export function isUnlimitedProvider(): boolean {
  const info = getProviderInfo();
  return info.unlimited;
}

/**
 * Returns a user-facing model description for the chat UI header.
 */
export function getModelLabel(): string {
  return getProviderInfo().label;
}
