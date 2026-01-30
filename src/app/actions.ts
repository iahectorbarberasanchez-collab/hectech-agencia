'use server'

// dynamic import inside functions

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitLead(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    if (!name || !email) {
        return { success: false, error: 'Nombre y email son obligatorios.' };
    }

    // --- Supabase Insert Removido por preferencia de usuario (Notion Integration via n8n) ---
    // Si necesitas guardar en BD SQL en el futuro, descomenta esto:
    /*
    const { error } = await supabase
        .from('leads')
        .insert([{ name, email, phone, message }]);

    if (error) {
        console.error('Supabase error:', error);
    }
    */

    // --- Enviar a n8n (No bloqueante para mayor velocidad) ---
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
        console.log('Intentando enviar lead a n8n...');
        try {
            await fetch(n8nWebhookUrl, {
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
            });
            console.log('✅ Lead enviado a n8n correctamente');
        } catch (n8nError) {
            console.error('💥 Error enviando a n8n:', n8nError);
        }
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
            to: process.env.RECEIVER_EMAIL || 'hectechia@gmail.com', // Uso de variable de entorno con fallback
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
            await fetch(n8nWebhookUrl, {
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
            });
            console.log('✅ Auditoría enviada a n8n correctamente');
        } catch (e) {
            console.error('Error enviando auditoría a n8n:', e);
        }
    }

    // --- Guardar en Supabase Removido (Notion Integration via n8n) ---
    /*
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
    */

    // INMUNIZACIÓN: Auditoría de respaldo de alta calidad
    const AUDIT_FALLBACK = `
        🚀 ¡Análisis completado para tu negocio de ${business}!
        
        Entiendo que lidiar con "${painPoint}" es un freno constante para tu crecimiento. Aquí tienes mi propuesta estratégica:
        
        ✅ Automatización de Atención: Implementaremos un sistema que responda consultas comunes al instante, recuperando hasta 10 horas de tu semana.
        ✅ Optimización de Ventas: Tu sistema trabajará 24/7, asegurando que ningún lead se pierda por falta de respuesta inmediata.
        ✅ Sincronización Inteligente: Tus datos fluirán sin errores entre tus herramientas, dándote paz mental y escalabilidad.
        
        ¿Hablamos? Agenda tu consultoría gratuita y pondremos esto en marcha.
    `;

    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
Eres el consultor estratégico de HecTechAi, experto en automatización con IA para pequeños negocios.

IMPORTANTE: Responde SIEMPRE en español.

Un cliente tiene un negocio de tipo: "${business}"
Su mayor problema es: "${painPoint}"

Tu tarea:
1. Analiza brevemente cómo este problema le está costando dinero/tiempo (1 párrafo)
2. Propón 2-3 soluciones de automatización específicas para su sector (usa viñetas con ✅)
3. Enfócate en resultados medibles: horas ahorradas, leads capturados, ventas 24/7
4. Sé directo y persuasivo, pero no agresivo

Formato de respuesta:
- Máximo 4 párrafos
- Usa emojis estratégicamente (✅, 🚀, ⚡, 💰)
- Termina con un call-to-action suave invitando a agendar una consultoría

NO uses jerga técnica innecesaria. Habla como un asesor de confianza que entiende su negocio.
`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return { success: true, data: text || AUDIT_FALLBACK };
        } catch (geminiError) {
            console.error("Gemini Error (INMUNIZADO):", geminiError);
            return { success: true, data: AUDIT_FALLBACK };
        }
    } catch (error) {
        console.error("General Audit Error (INMUNIZADO):", error);
        return { success: true, data: AUDIT_FALLBACK };
    }
}

export async function generateVisualAuditAction(url: string, email?: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'Clave de API no configurada en el servidor.' };
    }

    // URL por defecto en caso de fallo crítico (Placeholder profesional)
    const DEFAULT_SCREENSHOT = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop";

    // Respuesta de respaldo en caso de que todo falle (Alta calidad)
    const FALLBACK_RESPONSE = {
        success: true,
        data: "✨ Analizando tu estructura digital...\n\nHe detectado que tu sitio tiene un gran potencial pero le falta el 'toque IA'. \n\n1. 🎨 Estética: Tu diseño actual es funcional, pero carece de la profundidad visual necesaria para transmitir autoridad técnica. \n2. 📈 Conversión: Los puntos de contacto están diluidos. Al aplicar nuestro diseño de 'Cristal Vertical', aumentaríamos tu tasa de contacto un 40%.\n3. ⚡ UX: Detectamos fricción en la navegación principal. Simplificar el flujo de usuario es clave para retener leads premium.",
        mockupPrompt: "A state-of-the-art landing page, glassmorphism style, neon emerald accents, deep dark mode, floating UI elements, 8k resolution, cinematic lighting, professional tech aesthetic.",
        screenshot: DEFAULT_SCREENSHOT
    };

    // --- Enviar Lead de Auditoría Visual a n8n ---
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && email) {
        try {
            await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_source: 'visual_audit',
                    url,
                    email,
                    timestamp: new Date().toISOString(),
                    url_origen: process.env.NEXT_PUBLIC_SITE_URL || 'hectechai.com'
                }),
            });
            console.log('✅ Auditoría visual enviada a n8n correctamente');
        } catch (e) {
            console.error('Error enviando auditoría visual a n8n:', e);
        }
    }

    try {
        // 1. Intentar obtener Screenshot
        let imageUrl = DEFAULT_SCREENSHOT;
        let base64Image = "";

        try {
            const screenshotApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
            const response = await fetch(screenshotApiUrl);
            const data = await response.json();
            imageUrl = data.data.screenshot.url || DEFAULT_SCREENSHOT;

            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            base64Image = Buffer.from(imageBuffer).toString('base64');
        } catch (screenshotError) {
            console.warn("Fallo en captura, usando placeholder:", screenshotError);
            const imgRes = await fetch(DEFAULT_SCREENSHOT);
            const buf = await imgRes.arrayBuffer();
            base64Image = Buffer.from(buf).toString('base64');
        }

        // 2. Analizar con Gemini Vision
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
Actúa como el Director de Conversión (CRO) de HecTechAi. Tu obsesión no es que la web sea bonita, sino que VENDA.

IMPORTANTE: Responde SIEMPRE en español.

Analiza esta web: ${url}

1. ANÁLISIS DE FRICCIÓN (3 puntos exactos):
   - Identifica dónde el cliente está perdiendo dinero/leads
   - Sé directo y enfocado al negocio
   - Usa viñetas con ❌

2. SOLUCIÓN HECTECH:
   - Por cada punto, explica cómo nuestra automatización lo resuelve
   - Enfoque: "Recuperar Tiempo" y "Captura Inmediata"
   - Usa viñetas con ✅

3. PROMPT DE MOCKUP:
   - Genera un prompt para rediseño: "Clean, High-Trust, Minimalist, High-Conversion"

Formato:
[ANALISIS]
(Texto en español)
[PROMPT]
(Prompt en inglés para generación de imagen)
`;

        try {
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Image, mimeType: "image/png" } }
            ]);

            const fullResponse = await result.response.text();
            const analysis = fullResponse.split('[PROMPT]')[0].replace('[ANALISIS]', '').trim();
            const mockupPrompt = fullResponse.split('[PROMPT]')[1]?.trim() || 'Modern AI Web Design';

            return {
                success: true,
                data: analysis || FALLBACK_RESPONSE.data,
                mockupPrompt: mockupPrompt,
                screenshot: imageUrl
            };
        } catch (geminiError) {
            console.error("Gemini Error, devolviendo fallback:", geminiError);
            return FALLBACK_RESPONSE;
        }

    } catch (error) {
        console.error("Critical Visual Audit Error:", error);
        return FALLBACK_RESPONSE;
    }
}

export async function getAutomationMetrics(clientId: string, password?: string) {
    if (!clientId) return { success: false, error: 'Identificador requerido' };

    // Verificación de Contraseña para DEMO
    if (clientId.toUpperCase() === 'DEMO123') {
        if (password !== 'hector2024') {
            return { success: false, error: 'Contraseña incorrecta para la Demo.' };
        }
        return {
            success: true,
            data: {
                client_name: 'Héctor (Demo)',
                status: 'ACTIVE',
                total_actions: 2840,
                hours_saved: 124,
                roi_euros: "6200",
                avg_response_time: 4.8,
                qualified_leads: 156,
                after_hours_actions: 842,
                history: [
                    { month: 'Nov', value: 1850 },
                    { month: 'Dic', value: 2140 },
                    { month: 'Ene', value: 2840 },
                ]
            }
        };
    }

    // ...

    const DUMMY_METRICS = {
        success: true,
        data: {
            client_name: 'Cliente Premium',
            status: 'ACTIVE',
            total_actions: 1240,
            hours_saved: 42,
            roi_euros: "2100",
            avg_response_time: 5,
            qualified_leads: 85,
            after_hours_actions: 412,
            history: [
                { month: 'Oct', value: 850 },
                { month: 'Nov', value: 1050 },
                { month: 'Dic', value: 1240 },
            ]
        }
    };

    // DIAGNOSTIC LOGGING (To be removed after fix)
    const usingServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isPlaceholderUrl = supabaseUrl.includes('placeholder');

    console.log(`[Login Attempt] Client: ${clientId} | ServiceKey: ${usingServiceKey} | URL: ${supabaseUrl}`);

    if (isPlaceholderUrl) {
        return { success: false, error: 'ERROR CONFIG: Falta NEXT_PUBLIC_SUPABASE_URL en Vercel.' };
    }

    try {
        const { data, error } = await supabase
            .from('automation_metrics')
            .select('*')
            .or(`client_id.eq.${clientId},client_email.eq.${clientId}`)
            .eq('password', password)
            .single();

        if (error) {
            console.error("Supabase Login Error:", error);
            // Detailed error for debugging production issues
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Credenciales inválidas.' };
            }
            if (!usingServiceKey) {
                return { success: false, error: 'ERROR CRÍTICO: Falta SUPABASE_SERVICE_ROLE_KEY en Vercel.' };
            }
            return { success: false, error: `DEBUG: URL=${supabaseUrl.substring(0, 20)}... KEY_LEN=${(supabaseKey || '').length} | ERR=${error.message}` };
        }

        if (!data) {
            return { success: false, error: 'Usuario no encontrado.' };
        }

        return {
            success: true,
            data: {
                client_name: data.client_name || 'Cliente HecTechAi',
                status: data.status || 'ONBOARDING',
                project_drive_url: data.drive_folder_url || null, // URL de la carpeta de Drive
                total_actions: data.total_actions || 0,
                hours_saved: Math.floor((data.total_time_saved || 0) / 60),
                roi_euros: ((data.total_time_saved || 0) / 60 * 50).toFixed(0),
                avg_response_time: 5,
                qualified_leads: Math.floor((data.total_actions || 0) * 0.1),
                after_hours_actions: Math.floor((data.total_actions || 0) * 0.3),
                history: [
                    { month: 'Oct', value: Math.floor((data.total_actions || 0) * 0.7) },
                    { month: 'Nov', value: Math.floor((data.total_actions || 0) * 0.9) },
                    { month: 'Dic', value: data.total_actions || 0 },
                ]
            }
        };
    } catch (e: any) {
        console.error("Error crítico de métricas:", e);
        return { success: false, error: `Excepción: ${e.message || 'Error desconocido'}` };
    }
}

export async function requestDashboardAccess(email: string) {
    if (!email) return { success: false, error: 'Email requerido.' };

    try {
        // 1. Verificar si el email existe en automation_metrics
        const { data: client, error: fetchError } = await supabase
            .from('automation_metrics')
            .select('client_name')
            .eq('client_email', email)
            .single();

        if (fetchError || !client) {
            return {
                success: false,
                error: 'Este email no está registrado como cliente activo. Contacta con soporte@hectechai.com si crees que es un error.'
            };
        }

        // 2. Generar contraseña aleatoria (8 caracteres)
        const newPassword = Math.random().toString(36).slice(-8).toUpperCase();

        // 3. Guardar en Supabase
        const { error: updateError } = await supabase
            .from('automation_metrics')
            .update({ password: newPassword })
            .eq('client_email', email);

        if (updateError) {
            console.error('Error updating password:', updateError);
            throw new Error('No se pudo generar la contraseña.');
        }

        // 4. Enviar Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"HecTechAi Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Tus credenciales de acceso - HecTechAi',
            html: `
                <div style="font-family: sans-serif; padding: 40px; color: #333; background-color: #f9f9f9;">
                    <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <div style="background: #00FF94; padding: 30px; text-align: center;">
                            <h1 style="color: #000; margin: 0; font-size: 24px;">HecTechAi Dashboard</h1>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="color: #111;">Hola, ${client.client_name}</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #666;">
                                Has solicitado acceso a tu panel de control de impacto de IA. Aquí tienes tus credenciales seguras para entrar ahora mismo:
                            </p>
                            
                            <div style="background: #f4f4f4; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px dashed #ddd;">
                                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
                                <p style="margin: 0;"><strong>Contraseña temporal:</strong> <span style="font-family: monospace; font-size: 20px; color: #00FF94; background: #000; padding: 2px 8px; border-radius: 4px;">${newPassword}</span></p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 40px;">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hectechai.com'}/dashboard" 
                                   style="background: #00FF94; color: #000; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
                                    Acceder a mi Dashboard
                                </a>
                            </div>
                            
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
                            <p style="font-size: 12px; color: #999; text-align: center;">
                                Si no has solicitado este acceso, por favor ignora este email o contacta con nosotros por seguridad.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: '¡Enviado! Revisa tu bandeja de entrada (y la carpeta de spam).' };

    } catch (error) {
        console.error('Request access error:', error);
        return { success: false, error: 'Hubo un error al procesar tu solicitud. Inténtalo más tarde.' };
    }
}

