/**
 * SCRIPT DE SIMULACIÓN DE PAGO (STRIPE -> N8N)
 * Úsalo para activar tu flujo de onboarding sin pagar de verdad.
 */

const N8N_WEBHOOK_URL = 'https://n8n.hectechai.com/webhook/stripe-webhook-production'; // URL de producción

const mockStripePayload = {
    type: "checkout.session.completed",
    data: {
        object: {
            id: "cs_test_" + Math.random().toString(36).substring(7),
            customer_details: {
                email: "carlos@logistica-rapido.com", // Email del cliente simulado
                name: "Carlos Ruiz"
            },
            amount_total: 50000, // 500.00€
            currency: "eur",
            payment_status: "paid"
        }
    }
};

async function simulatePayment() {
    console.log('🚀 Iniciando simulación de pago en Stripe...');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockStripePayload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            console.log('✅ Webhook enviado con éxito a n8n.');
            console.log('Ahora revisa tu n8n para ver si se ha creado la carpeta en Drive y enviado el contrato.');
        } else {
            console.error('❌ Error enviando al webhook:', response.statusText);
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('❌ Tiempo de espera agotado (¿está n8n encendido en el puerto 5678?)');
        } else {
            console.error('💥 Error de conexión:', error.message);
        }
    }
}

simulatePayment();
