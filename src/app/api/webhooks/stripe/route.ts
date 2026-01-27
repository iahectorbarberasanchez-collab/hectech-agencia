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
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const customerEmail = session.customer_details?.email;
        const amountTotal = (session.amount_total || 0) / 100;

        console.log(`Payment completed for ${customerEmail}: ${amountTotal}€`);

        // Ejemplo: Guardar en Supabase (requiere tener la tabla configurada)
        /*
        await supabase.from('payments').insert({
          email: customerEmail,
          amount: amountTotal,
          stripe_session_id: session.id,
          status: 'completed'
        });
        */

        // Enviar a n8n para avisar a Héctor
        if (process.env.N8N_WEBHOOK_URL) {
            await fetch(process.env.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'payment_completed',
                    email: customerEmail,
                    amount: amountTotal,
                    source: 'stripe_webhook'
                })
            });
        }
    }

    return NextResponse.json({ received: true });
}
