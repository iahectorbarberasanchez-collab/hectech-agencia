import 'dotenv/config';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  🎯 SIMULACIÓN PASO 1.2: RADAR DE LEADS 2.0              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Verificar que las credenciales necesarias estén configuradas
const SERPER_API_KEY = '7233220d5758b9c4377d4905c3bff4043d91e161'; // Key actualizada del workflow
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Importar cliente de Supabase
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📋 Configuración del Radar:');
console.log(`   Tipo de negocio: INMOBILIARIAS`);
console.log(`   Ciudad: sitges`);
console.log(`   SerpAPI Key: ${SERPER_API_KEY.substring(0, 10)}...`);
console.log('');

console.log('⏳ PASO 1/4: Verificando workflow en n8n...');

async function checkWorkflowStatus() {
    if (!N8N_BASE_URL || !N8N_API_KEY) {
        console.log('⚠️  N8N_BASE_URL o N8N_API_KEY no configurados en .env.local');
        console.log('   El workflow debe ejecutarse manualmente desde n8n\n');
        return null;
    }

    try {
        const response = await fetch(`${N8N_BASE_URL}/workflows`, {
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY
            }
        });

        if (!response.ok) {
            console.log(`❌ Error consultando n8n API: ${response.status}`);
            return null;
        }

        const workflows = (await response.json()) as { data: any[] };
        const radarWorkflow = workflows.data?.find((w: any) =>
            w.name.includes('Radar de Leads 2.0') || w.name.includes('Radar de Leads')
        );

        if (radarWorkflow) {
            console.log(`✅ Workflow encontrado: "${radarWorkflow.name}"`);
            console.log(`   ID: ${radarWorkflow.id}`);
            console.log(`   Estado: ${radarWorkflow.active ? '✅ ACTIVO' : '❌ INACTIVO'}`);
            return radarWorkflow;
        } else {
            console.log('⚠️  Workflow "Radar de Leads 2.0" no encontrado en n8n');
            return null;
        }
    } catch (error) {
        console.log(`❌ Error conectando con n8n: ${error}`);
        return null;
    }
}

async function testSerpAPI() {
    console.log('\n⏳ PASO 2/4: Probando SerpAPI (Google Places)...');

    try {
        const response = await fetch('https://google.serper.dev/places', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: 'INMOBILIARIAS en sitges'
            })
        });

        if (!response.ok) {
            console.log(`❌ Error en SerpAPI: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        const placesCount = data.places?.length || 0;

        console.log(`✅ SerpAPI respondió correctamente`);
        console.log(`   Resultados encontrados: ${placesCount} negocios`);

        if (placesCount > 0) {
            console.log(`\n   📍 Ejemplo de resultado:`);
            const example = data.places[0];
            console.log(`      Nombre: ${example.title}`);
            console.log(`      Web: ${example.website || 'No disponible'}`);
            console.log(`      Teléfono: ${example.phoneNumber || 'No disponible'}`);
        }

        return true;
    } catch (error) {
        console.log(`❌ Error probando SerpAPI: ${error}`);
        return false;
    }
}

async function checkSupabaseIntegration() {
    console.log('\n⏳ PASO 3/4: Verificando integración con Supabase (Tabla radar_leads)...');

    // Contar registros antes de la ejecución
    const { count: countBefore, error } = await supabase
        .from('radar_leads')
        .select('*', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') { // table_undefined
            console.log('❌ Error: La tabla radar_leads no existe en Supabase.');
            return { initialCount: 0, error: true };
        }
        console.log(`❌ Error conectando con Supabase: ${error.message}`);
        return { initialCount: 0, error: true };
    }

    console.log(`   Registros actuales en 'radar_leads': ${countBefore}`);
    return { initialCount: countBefore || 0, error: false };
}

async function executeWorkflow(workflowId: string) {
    console.log('\n⏳ PASO 4/4: Ejecutando workflow...');

    try {
        const response = await fetch(`${N8N_BASE_URL}/workflows/${workflowId}/execute`, {
            method: 'POST',
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY!,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(`❌ Error ejecutando workflow: ${response.status}`);
            return false;
        }

        const execution = await response.json();
        console.log(`✅ Workflow ejecutado`);
        console.log(`   Execution ID: ${execution.data?.id || 'N/A'}`);
        return true;
    } catch (error) {
        console.log(`❌ Error: ${error}`);
        return false;
    }
}

async function main() {
    const workflow = await checkWorkflowStatus();
    const serpApiOk = await testSerpAPI();
    const dbStatus = await checkSupabaseIntegration();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📊 RESUMEN DE LA SIMULACIÓN                             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    if (workflow && workflow.active && serpApiOk && !dbStatus.error) {
        console.log('✅ Puntos de verificación completados:');
        console.log('   1. Workflow encontrado y activo en n8n');
        console.log('   2. SerpAPI funcionando correctamente');
        console.log('   3. Conexión con Supabase correcta');
        console.log('');

        if (N8N_API_KEY && N8N_BASE_URL) {
            const executed = await executeWorkflow(workflow.id);
            if (executed) {
                console.log('✅ Workflow ejecutado exitosamente');
                console.log('⏳ Esperando 10 segundos para procesar resultados...');
                await new Promise(resolve => setTimeout(resolve, 10000));

                // Verificar si hay nuevos registros
                const { count: countAfter } = await supabase
                    .from('radar_leads')
                    .select('*', { count: 'exact', head: true });

                const newLeads = (countAfter || 0) - dbStatus.initialCount;

                if (newLeads > 0) {
                    console.log(`✅ ÉXITO TOTAL: Se han creado ${newLeads} nuevos leads en la tabla 'radar_leads'.`);
                } else {
                    console.log('⚠️  El workflow se ejecutó pero no se detectaron nuevos registros en Supabase aún.');
                    console.log('   Verifica la pestaña Executions en n8n para ver posibles errores lógicos.');
                }
            }
        } else {
            console.log('⚠️  Para ejecutar el workflow automáticamente:');
            console.log('   1. Configura N8N_API_KEY en .env.local');
            console.log('   2. O ejecuta el workflow manualmente desde n8n');
        }
    } else {
        console.log('⚠️ Verificaciones manuales requeridas:');
        if (!workflow) {
            console.log('   ❌ Workflow no encontrado - importar desde archivo JSON');
        } else if (!workflow.active) {
            console.log('   ❌ Workflow inactivo - activar en n8n');
        }
        if (!serpApiOk) {
            console.log('   ❌ SerpAPI no responde - verificar API key');
        }
        if (dbStatus.error) {
            console.log('   ❌ Error conectando con base de datos');
        }
        console.log('');
        console.log('📝 Pasos para activar el Radar de Leads:');
        console.log('   1. Accede a n8n: https://n8n.hectechai.com/');
        console.log('   2. Importa el workflow "HecTechAi - Radar de Leads 2.0.json"');
        console.log('   3. Activa el workflow');
        console.log('   4. Ejecuta manualmente para probar');
        console.log('   5. Verifica resultados en Supabase (Tabla radar_leads)');
    }

    console.log('\n🎯 Próximo paso:');
    console.log('   Una vez verificado el Radar de Leads, proceder con el Paso 2:');
    console.log('   "Cualificación y Propuesta"\n');
}

main();
