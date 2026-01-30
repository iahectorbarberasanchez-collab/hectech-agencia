import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Webhook signature verification failed: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name || 'Cliente';
        const amountTotal = (session.amount_total || 0) / 100;

        // Datos para el "Contrato"
        const contractData = {
            version: "1.0",
            accepted_at: new Date().toISOString(),
            ip_address: session.customer_details?.address || 'IP_NOT_AVAILABLE', // Stripe a veces no da la IP directa aquí, pero usamos la dirección como proxy de ubicación
            stripe_invoice_id: session.invoice,
        };

        console.log(`Payment completed for ${customerEmail}: ${amountTotal}€`);

        // Enviar a n8n: DESACTIVADO
        // Motivo: Usamos el workflow "HecTechAi - Client Onboarding (Advanced)" que escucha directamente a Stripe.
        // Esto evita conflictos con la variable N8N_WEBHOOK_URL que se usa para el formulario de contacto.
        /*
        if (process.env.N8N_WEBHOOK_URL) {
            try {
                await fetch(process.env.N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'payment_completed',
                        type: 'new_client_onboarding',
                        data: {
                            email: customerEmail,
                            name: customerName,
                            amount: amountTotal,
                            currency: session.currency,
                            contract: contractData,
                            stripe_session_id: session.id,
                            metadata: session.metadata // Pasamos metadata extra si la hay (ej: tipo de servicio)
                        },
                        source: 'stripe_webhook'
                    })
                });
                console.log('✅ Webhook enviado a n8n con datos de contrato');
            } catch (error) {
                console.error('❌ Error enviando a n8n:', error);
            }
        }
        */
    }

    return NextResponse.json({ received: true });
}
