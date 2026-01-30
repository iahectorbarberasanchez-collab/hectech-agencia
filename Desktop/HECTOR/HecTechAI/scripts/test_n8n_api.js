const fetch = require('node-fetch');
require('dotenv').config({ path: './hectech-agency/.env.local' });

async function testN8nConnection() {
    const apiKey = process.env.N8N_API_KEY;
    const baseUrl = process.env.N8N_BASE_URL || 'https://n8n.hectechai.com/api/v1';

    console.log('--- Probando Conexión API n8n ---');
    console.log(`URL: ${baseUrl}`);

    if (!apiKey) {
        console.error('❌ Error: N8N_API_KEY no encontrada en .env.local');
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/workflows?limit=5`, {
            method: 'GET',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa!');
            console.log(`Número de workflows encontrados (limit 5): ${data.data.length}`);
            data.data.forEach(wf => {
                console.log(` - [${wf.id}] ${wf.name} (${wf.active ? 'Activo' : 'Inactivo'})`);
            });
        } else {
            console.error(`❌ Error en la respuesta: ${response.status} ${response.statusText}`);
            const errorData = await response.text();
            console.error('Detalles:', errorData);
        }
    } catch (error) {
        console.error('❌ Error crítico al conectar:', error.message);
    }
}

testN8nConnection();
