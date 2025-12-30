'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js'; // Assuming createClient is from here

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function submitLead(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    if (!name || !email) {
        return { success: false, error: 'Nombre y email son obligatorios.' };
    }

    const { error } = await supabase
        .from('leads')
        .insert([{ name, email, phone, message }]);

    if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: 'Hubo un error al guardar tus datos. Inténtalo de nuevo.' };
    }

    return { success: '¡Mensaje enviado! Te contactaremos pronto.' };
}

export async function generateAuditAction(business: string, painPoint: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'Clave de API no configurada en el servidor.' };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Eres un consultor experto en automatización con IA para la agencia HECTECH. 
      El usuario tiene un negocio de: "${business}" y su principal problema es: "${painPoint}".
      
      Genera una estrategia de automatización concisa de 3 puntos en Español.
      IMPORTANTE: Tu agencia solo usa **n8n** para automatizaciones. NO menciones Zapier ni Make.
      
      Para cada punto:
      - Usa un emoji.
      - Sugiere un flujo de trabajo específico usando n8n (ej: "Usar n8n para conectar Gmail con Trello").
      - Sé profesional pero entusiasta. Enfócate en el ahorro de tiempo.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { success: true, data: text };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return { success: false, error: `Error detalle: ${(error as Error).message}` };
    }
}
