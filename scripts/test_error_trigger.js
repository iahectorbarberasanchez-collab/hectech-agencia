
async function runTest() {
    const url = 'https://n8n.hectechai.com/webhook/formulario-web';
    console.log(`Sending flawed payload to: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // ERROR SIMULATION: Missing email field
            // This should cause the workflow to fail when it tries to send email or create Notion page without email
            body: JSON.stringify({
                name: 'Stress Test Bot',
                message: 'This is a simulated error test. Email is missing to trigger expected failure in n8n.',
                business: 'HecTech Testing Inc.'
            }),
        });

        if (response.ok) {
            console.log(`✅ Webhook Accepted (Status: ${response.status})`);
            console.log('NOTE: The error will happen asynchronously in n8n. Check Telegram/Gmail for alerts.');
        } else {
            console.error(`❌ Webhook Failed (Status: ${response.status})`);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('💥 Network Error:', error);
    }
}

runTest();
