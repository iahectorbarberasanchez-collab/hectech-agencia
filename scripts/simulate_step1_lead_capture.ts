/**
 * 🎯 SIMULACIÓN PASO 1: PROSPECCIÓN Y CUALIFICACIÓN - CAPTACIÓN
 * 
 * Este script simula la captación de un lead a través del formulario de contacto
 * y verifica que todo el flujo funcione correctamente:
 * 
 * 1. Envío de datos al webhook de n8n
 * 2. Registro en Supabase (tabla leads)
 * 3. Notificación por email
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

// Configuración
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.hectechai.com/webhook/formulario-web';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Datos de prueba para la simulación
const TEST_LEAD = {
    name: 'Dr. Carlos Martínez - Simulación',
    email: 'test.simulacion@hectechai.com',
    phone: '+34 600 123 456',
    message: 'Tengo una clínica dental y necesito automatizar las citas. Perdemos muchos pacientes por no-shows.',
    timestamp: new Date().toISOString(),
};

console.log(`${COLORS.cyan}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
console.log(`${COLORS.cyan}║  🎯 SIMULACIÓN PASO 1: CAPTACIÓN DE LEAD                 ║${COLORS.reset}`);
console.log(`${COLORS.cyan}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

async function simulateLeadCapture() {
    console.log(`${COLORS.blue}📋 Datos del Lead de Prueba:${COLORS.reset}`);
    console.log(`   Nombre: ${TEST_LEAD.name}`);
    console.log(`   Email: ${TEST_LEAD.email}`);
    console.log(`   Teléfono: ${TEST_LEAD.phone}`);
    console.log(`   Mensaje: ${TEST_LEAD.message}\n`);

    // PASO 1: Enviar al webhook de n8n
    console.log(`${COLORS.yellow}⏳ PASO 1/3: Enviando lead al webhook de n8n...${COLORS.reset}`);
    console.log(`   URL: ${N8N_WEBHOOK_URL}\n`);

    try {
        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lead_source: 'web_contact_form',
                name: TEST_LEAD.name,
                email: TEST_LEAD.email,
                phone: TEST_LEAD.phone,
                message: TEST_LEAD.message,
                timestamp: TEST_LEAD.timestamp,
                url_origen: 'hectechai.com',
                simulation: true, // Flag para identificar que es una simulación
            }),
        });

        if (webhookResponse.ok) {
            console.log(`${COLORS.green}✅ Webhook n8n respondió correctamente${COLORS.reset}`);
            console.log(`   Status: ${webhookResponse.status} ${webhookResponse.statusText}\n`);
        } else {
            console.log(`${COLORS.red}❌ Error en webhook n8n${COLORS.reset}`);
            console.log(`   Status: ${webhookResponse.status} ${webhookResponse.statusText}\n`);
        }
    } catch (error: any) {
        console.log(`${COLORS.red}❌ Error conectando con n8n:${COLORS.reset}`);
        console.log(`   ${error.message}\n`);
    }

    // PASO 2: Verificar en Supabase
    console.log(`${COLORS.yellow}⏳ PASO 2/3: Verificando registro en Supabase...${COLORS.reset}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // Esperar 2 segundos para que n8n procese
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('email', TEST_LEAD.email)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.log(`${COLORS.red}❌ Error consultando Supabase:${COLORS.reset}`);
            console.log(`   ${error.message}\n`);
        } else if (data && data.length > 0) {
            console.log(`${COLORS.green}✅ Lead encontrado en Supabase${COLORS.reset}`);
            console.log(`   ID: ${data[0].id}`);
            console.log(`   Nombre: ${data[0].name}`);
            console.log(`   Email: ${data[0].email}`);
            console.log(`   Creado: ${new Date(data[0].created_at).toLocaleString('es-ES')}\n`);
        } else {
            console.log(`${COLORS.yellow}⚠️ Lead no encontrado en Supabase${COLORS.reset}`);
            console.log(`   Esto puede significar que:${COLORS.reset}`);
            console.log(`   - n8n no está guardando en Supabase (revisar workflow)`);
            console.log(`   - El webhook no se ejecutó correctamente\n`);
        }
    } catch (error: any) {
        console.log(`${COLORS.red}❌ Error verificando Supabase:${COLORS.reset}`);
        console.log(`   ${error.message}\n`);
    }

    // PASO 3: Instrucciones de verificación manual
    console.log(`${COLORS.yellow}⏳ PASO 3/3: Verificación manual requerida${COLORS.reset}`);
    console.log(`${COLORS.cyan}📧 Verifica tu email (hectechia@gmail.com):${COLORS.reset}`);
    console.log(`   - Deberías haber recibido una notificación con los datos del lead`);
    console.log(`   - Asunto: "🚀 Nuevo Lead: ${TEST_LEAD.name}"\n`);

    console.log(`${COLORS.cyan}🔍 Verifica en n8n (https://n8n.hectechai.com):${COLORS.reset}`);
    console.log(`   - Ve a "Executions" (Ejecuciones)`);
    console.log(`   - Busca la ejecución más reciente del workflow de formulario web`);
    console.log(`   - Verifica que se haya ejecutado sin errores\n`);

    // Resumen final
    console.log(`${COLORS.cyan}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}║  📊 RESUMEN DE LA SIMULACIÓN                             ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    console.log(`${COLORS.green}✅ Puntos de verificación completados:${COLORS.reset}`);
    console.log(`   1. Webhook n8n enviado`);
    console.log(`   2. Consulta a Supabase realizada\n`);

    console.log(`${COLORS.yellow}⚠️ Verificaciones manuales pendientes:${COLORS.reset}`);
    console.log(`   1. Email de notificación recibido`);
    console.log(`   2. Ejecución en n8n sin errores`);
    console.log(`   3. Lead registrado en Notion CRM (si está configurado)\n`);

    console.log(`${COLORS.magenta}🎯 Próximo paso:${COLORS.reset}`);
    console.log(`   Una vez verificado todo, proceder con el Paso 2:`);
    console.log(`   "Cualificación y Propuesta"\n`);
}

// Ejecutar simulación
simulateLeadCapture().catch(console.error);
