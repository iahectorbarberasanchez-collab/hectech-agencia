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
      Eres un vendedor experto de HecTechAi que ayuda a negocios a crecer con automatización.
      
      El cliente tiene: "${business}" y su problema es: "${painPoint}".
      
      Genera una respuesta PERSUASIVA y COMERCIAL de máximo 200 palabras que:
      
      1. Empatiza con su dolor ("Entiendo perfectamente lo frustrante que es...")
      2. Presenta 3 soluciones CONCRETAS con emojis (sin jerga técnica, enfócate en RESULTADOS):
         - Qué problema específico resuelve
         - Qué beneficio TANGIBLE obtiene (ej: "recupera 10 horas semanales", "aumenta ventas un 30%")
         - Menciona que usamos IA y automatización (sin detalles técnicos)
      3. Termina con un CALL TO ACTION potente que invite a agendar una consultoría gratuita
      
      TONO: Cercano, entusiasta, enfocado en RESULTADOS DE NEGOCIO (no en tecnología).
      EVITA: Palabras como "n8n", "API", "flujo de trabajo", "integración". 
      USA: "automatización inteligente", "IA que trabaja 24/7", "sistema que nunca falla".
      
      Formato: Párrafos cortos, fáciles de leer, con emojis estratégicos.
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
