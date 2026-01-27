
import fetch from 'node-fetch';

async function simulateWebhook() {
    const url = 'http://localhost:3000/api/webhooks/stripe';

    // Payload simulado de Stripe (simplificado)
    const payload = {
        id: 'evt_test_webhook',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_123456',
                object: 'checkout.session',
                amount_total: 99700,
                currency: 'eur',
                customer_details: {
                    email: 'test@cliente.com',
                    name: 'Cliente Prueba',
                    address: {
                        country: 'ES'
                    }
                },
                metadata: {
                    payment_type: 'agency_service'
                },
                invoice: 'in_test_invoice_123'
            }
        }
    };

    console.log('🚀 Enviando webhook simulado a:', url);

    try {
        // Nota: Esto fallará si la firma es requerida y no válida, 
        // pero nos sirve para ver si el endpoint responde.
        // Para probar la lógica interna, necesitaríamos mockear la validación de firma o usar Stripe CLI.
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': 't=123,v1=fake_signature'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);

        if (response.status === 400 && text.includes('Webhook Error')) {
            console.log('⚠️  El error 400 es ESPERADO porque la firma es falsa.');
            console.log('✅  Esto confirma que el endpoint es accesible y está intentando validar Stripe.');
            console.log('ℹ️  Para una prueba real E2E, usa: stripe trigger checkout.session.completed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

simulateWebhook();
