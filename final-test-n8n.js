const fetch = require('node-fetch');

async function testWebForm() {
    const url = 'https://hectechai.app.n8n.cloud/webhook/formulario-web';

    console.log('--- Probando Lead desde Formulario de Contacto ---');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lead_source: 'web_contact_form',
                name: 'Carlos Martínez',
                email: 'carlos.abogado.test@gmail.com',
                phone: '655998877',
                message: 'Hola, soy abogado matrimonialista y mi secretaria pasa el 60% del día filtrando llamadas de gente que solo quiere preguntar precios o que no tiene los papeles listos. ¿Se puede crear un sistema que recoja los datos antes de la cita y solo me agende a los que realmente cumplen los requisitos?',
                timestamp: new Date().toISOString(),
                url_origen: 'hectechai.com'
            })
        });
        console.log('Respuesta n8n (Contacto):', response.status, response.statusText);
    } catch (error) {
        console.error('Error en Contacto:', error.message);
    }
}

async function testAuditForm() {
    const url = 'https://hectechai.app.n8n.cloud/webhook/formulario-web';

    console.log('\n--- Probando Lead desde Auditoría IA ---');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lead_source: 'ia_audit',
                name: 'Laura Méndez',
                business: 'Inmobiliaria Fast',
                pain_point: 'Tardo mucho en responder a los portales inmobiliarios y los leads se enfrían',
                email: 'laura.mendez.test@gmail.com',
                timestamp: new Date().toISOString(),
                url_origen: 'hectechai.com'
            })
        });
        console.log('Respuesta n8n (Auditoría):', response.status, response.statusText);
    } catch (error) {
        console.error('Error en Auditoría:', error.message);
    }
}

async function runTests() {
    await testWebForm();
    await testAuditForm();
    console.log('\n✅ Pruebas finalizadas. Revisa las ejecuciones en tu n8n.');
}

runTests();
