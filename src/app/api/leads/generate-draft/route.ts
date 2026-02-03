import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { leadId } = await req.json();

        // 1. Get lead data from Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (leadError || !lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // 2. Prepare AI Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Eres un experto en ventas de automatizaciones de IA y fundado de HecTechAi. 
        Debes redactar una propuesta de venta IRRESISTIBLE y pragmática (estilo "Pareto") para el siguiente lead:

        NOMBRE/NEGOCIO: ${lead.name}
        DEUDA TECH: ${lead.tech_debt}
        TIENE CHATBOT: ${lead.has_chatbot ? 'SÍ' : 'NO'}
        MENSAJE ORIGINAL: ${lead.message || 'Sin mensaje previo'}

        Contexto: HecTechAi soluciona inestabilidad operativa y falta de escalabilidad con el Stack AAA (n8n, Supabase, Next.js).
        
        Instrucciones:
        1. Sé directo y profesional.
        2. Menciona específicamente su ${lead.tech_debt === 'ALTA' ? 'alta deuda técnica' : 'situación tecnológica'} como un riesgo para su escalabilidad.
        3. Si NO tiene chatbot, resalta la pérdida de leads 24/7.
        4. Propón una auditoría gratuita o una solución rápida de "impacto inmediato".
        5. Máximo 150 palabras.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ draft: text });
    } catch (error: any) {
        console.error('Error generating draft:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
