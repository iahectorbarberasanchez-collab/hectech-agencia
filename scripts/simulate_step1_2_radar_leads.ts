import 'dotenv/config';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  🎯 SIMULACIÓN PASO 1.2: RADAR DE LEADS 2.0              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Verificar que las credenciales necesarias estén configuradas
const SERPER_API_KEY = '770b7aec4d634fe103d835122bb1629073efdd71'; // Del workflow
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

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

        const workflows = await response.json();
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

async function checkGoogleSheetsIntegration() {
    console.log('\n⏳ PASO 3/4: Verificando integración con Google Sheets...');
    console.log('   Documento ID: 1DfBdKutQISGYh-IIZOyXkrHyGoTidKc4SseUbHD1mn4');
    console.log('   Hoja: INMOBILIARIAS');
    console.log('');
    console.log('   ⚠️  Esta verificación debe hacerse manualmente:');
    console.log('   1. Abre el Google Sheet en tu navegador');
    console.log('   2. Verifica que la hoja "INMOBILIARIAS" existe');
    console.log('   3. Ejecuta el workflow manualmente desde n8n');
    console.log('   4. Verifica que se agreguen nuevas filas al sheet');
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
    await checkGoogleSheetsIntegration();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📊 RESUMEN DE LA SIMULACIÓN                             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    if (workflow && workflow.active && serpApiOk) {
        console.log('✅ Puntos de verificación completados:');
        console.log('   1. Workflow encontrado y activo en n8n');
        console.log('   2. SerpAPI funcionando correctamente');
        console.log('');

        if (N8N_API_KEY && N8N_BASE_URL) {
            const executed = await executeWorkflow(workflow.id);
            if (executed) {
                console.log('✅ Workflow ejecutado exitosamente');
                console.log('');
                console.log('🔍 Verificaciones manuales pendientes:');
                console.log('   1. Ve a n8n → Executions y verifica que se ejecutó sin errores');
                console.log('   2. Abre el Google Sheet y verifica que se agregaron nuevos leads');
                console.log('   3. Verifica que los datos incluyen: nombre, web, redes sociales, análisis tech');
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
        console.log('');
        console.log('📝 Pasos para activar el Radar de Leads:');
        console.log('   1. Accede a n8n: https://mis-automatizaciones-n8n.ucbepc.easypanel.host/');
        console.log('   2. Importa el workflow "HecTechAi - Radar de Leads 2.0.json"');
        console.log('   3. Activa el workflow');
        console.log('   4. Ejecuta manualmente para probar');
        console.log('   5. Verifica resultados en Google Sheets');
    }

    console.log('\n🎯 Próximo paso:');
    console.log('   Una vez verificado el Radar de Leads, proceder con el Paso 2:');
    console.log('   "Cualificación y Propuesta"\n');
}

main();
