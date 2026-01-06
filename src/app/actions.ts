'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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

    // --- Enviar a n8n (No bloqueante para mayor velocidad) ---
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
        console.log('Intentando enviar lead a n8n...');
        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lead_source: 'web_contact_form',
                name,
                email,
                phone: phone || 'No proporcionado',
                message: message || 'Sin mensaje',
                timestamp: new Date().toISOString(),
                url_origen: process.env.NEXT_PUBLIC_SITE_URL || 'hectechai.com'
            }),
        })
            .then(() => console.log('✅ Lead enviado a n8n correctamente'))
            .catch(n8nError => console.error('💥 Error enviando a n8n:', n8nError));
    }


    // --- Enviar Email ---
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'hectechia@gmail.com',
            subject: `🚀 Nuevo Lead: ${name}`,
            text: `
                Has recibido un nuevo mensaje desde la web:
                
                Nombre: ${name}
                Email: ${email}
                Teléfono: ${phone || 'No proporcionado'}
                Mensaje: ${message || 'Sin mensaje'}
                
                ¡Contacta con él lo antes posible!
            `,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #00FF94;">🚀 Nuevo Lead Recibido</h2>
                    <p>Has recibido un nuevo mensaje desde la web <strong>HecTechAi</strong>:</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                    <p><strong>Mensaje:</strong></p>
                    <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #00FF94;">
                        ${message || 'Sin mensaje'}
                    </blockquote>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email enviado con éxito');
    } catch (emailError) {
        console.error('Error enviando email:', emailError);
        // No bloqueamos el éxito porque los datos ya están en Supabase
    }

    return { success: '¡Mensaje enviado! Te contactaremos pronto.' };
}

export async function generateAuditAction(business: string, painPoint: string, email?: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'Clave de API no configurada en el servidor.' };
    }

    // --- Enviar Lead de Auditoría a n8n ---
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && email) {
        try {
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_source: 'ia_audit',
                    business,
                    pain_point: painPoint,
                    email,
                    timestamp: new Date().toISOString(),
                    url_origen: process.env.NEXT_PUBLIC_SITE_URL || 'hectechai.com'
                }),
            }).catch(e => console.error('Error enviando auditoría a n8n:', e));
        } catch (e) {
            console.error('Error intentando enviar auditoría:', e);
        }
    }

    // --- Guardar en Supabase ---
    if (email) {
        try {
            await supabase
                .from('leads')
                .insert([{
                    name: `Auditoría: ${business}`,
                    email,
                    message: `Punto de dolor: ${painPoint}`,
                    phone: 'Lead de Auditoría IA'
                }]);
        } catch (supaError) {
            console.error('Error guardando auditoría en supabase:', supaError);
        }
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Eres un vendedor experto de HecTechAi que ayuda a negocios a crecer con automatización.
      
      El cliente tiene un negocio de: "${business}" y su problema principal es: "${painPoint}".
      
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

export async function generateVisualAuditAction(url: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'Clave de API no configurada en el servidor.' };
    }

    // Validar URL básica
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    try {
        // 1. Obtener Screenshot vía API de proximidad (usamos un servicio de preview gratuito por ahora)
        // Nota: Para producción real se recomienda una API como ScreenshotOne
        const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;

        const response = await fetch(screenshotUrl);
        const data = await response.json();
        const imageUrl = data.data.screenshot.url;

        if (!imageUrl) {
            throw new Error("No se pudo capturar la imagen del sitio.");
        }

        // Descargar la imagen para enviarla a Gemini
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        // 2. Analizar con Gemini Vision
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Actúa como un Diseñador UX/UI Senior y Estratega Digital de HecTechAi. 
            Analiza esta captura de pantalla de la web: ${url}
            
            1. ANÁLISIS PERSUASIVO: Proporciona 3 párrafos cortos con emojis sobre Diseño Visual, Conversión y UX.
            
            2. MOCKUP PROMPT: Crea un prompt detallado para un generador de imágenes (DALL-E) que represente un rediseño moderno, futurista y profesional de esta web específica. Debe incluir elementos de IA, interfaces de cristal (glassmorphism), colores corporativos optimizados y una estética de alta gama.
            
            Formato de respuesta:
            [ANALISIS]
            (Texto del análisis)
            
            [PROMPT]
            (Texto del prompt para la imagen)
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/png"
                }
            }
        ]);

        const fullResponse = await result.response.text();
        const analysis = fullResponse.split('[PROMPT]')[0].replace('[ANALISIS]', '').trim();
        const mockupPrompt = fullResponse.split('[PROMPT]')[1]?.trim() || '';

        return {
            success: true,
            data: analysis,
            mockupPrompt: mockupPrompt,
            screenshot: imageUrl
        };

    } catch (error) {
        console.error("Visual Audit Error:", error);
        return { success: false, error: `No pudimos analizar visualmente tu web: ${(error as Error).message}` };
    }
}
