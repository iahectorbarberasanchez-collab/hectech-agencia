import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_BASE_URL || !N8N_API_KEY) {
    console.error('❌ Error: N8N_BASE_URL y N8N_API_KEY deben estar configurados en .env.local');
    process.exit(1);
}

async function importWorkflow() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📥 IMPORTAR WORKFLOW A N8N                              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Leer el archivo del workflow
    const workflowPath = path.join(
        __dirname,
        '..',
        '..',
        'Automatizaciones para la propia agencia',
        'Formulario web a Borrador Gmail (1).json'
    );

    console.log(`📂 Leyendo workflow desde: ${workflowPath}`);

    if (!fs.existsSync(workflowPath)) {
        console.error(`❌ Error: No se encontró el archivo del workflow en ${workflowPath}`);
        process.exit(1);
    }

    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));

    // Preparar el workflow para importación
    const workflowToImport = {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: true, // Activar automáticamente
        settings: workflowData.settings || {},
        tags: workflowData.tags || []
    };

    console.log(`📋 Workflow: ${workflowToImport.name}`);
    console.log(`🔧 Nodos: ${workflowToImport.nodes.length}`);
    console.log(`⏳ Importando a n8n...\n`);

    try {
        const response = await fetch(`${N8N_BASE_URL}/workflows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': N8N_API_KEY,
            },
            body: JSON.stringify(workflowToImport),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error al importar workflow: ${response.status} ${response.statusText}`);
            console.error(`Detalles: ${errorText}`);
            process.exit(1);
        }

        const result = await response.json();
        console.log('✅ Workflow importado exitosamente!');
        console.log(`   ID: ${result.id}`);
        console.log(`   Nombre: ${result.name}`);
        console.log(`   Estado: ${result.active ? '🟢 ACTIVO' : '🔴 INACTIVO'}`);
        console.log(`\n🔗 Webhook URL: ${process.env.N8N_WEBHOOK_URL}`);
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║  ✅ LISTO PARA PROBAR                                    ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('\n💡 Próximo paso: Ejecuta el script de simulación:');
        console.log('   npx tsx scripts/simulate_step1_lead_capture.ts\n');

    } catch (error) {
        console.error('❌ Error al conectar con n8n:', error);
        process.exit(1);
    }
}

importWorkflow();
