const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            // Try .env
            const envPath2 = path.resolve(process.cwd(), '.env');
            if (!fs.existsSync(envPath2)) return {};
            return parseFile(envPath2);
        }
        return parseFile(envPath);
    } catch (e) {
        return {};
    }
}

function parseFile(path) {
    const content = fs.readFileSync(path, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        if (!line || line.startsWith('#')) return;
        const [key, ...valParts] = line.split('=');
        if (key) {
            let val = valParts.join('=');
            if (val) env[key.trim()] = val.trim().replace(/^"/, '').replace(/"$/, '');
        }
    });
    return env;
}

async function main() {
    const env = loadEnv();
    const key = env.STRIPE_SECRET_KEY;

    if (!key) {
        console.error('❌ Error: STRIPE_SECRET_KEY not found in .env or .env.local');
        process.exit(1);
    }

    const stripe = new Stripe(key);

    console.log('Creating test session...');

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Suscripción HecTechAi (DEMO)',
                            description: 'Prueba de diseño y términos.',
                        },
                        unit_amount: 5000, // 50.00 EUR
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: (env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: (env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/checkout/cancel',
            consent_collection: {
                terms_of_service: 'required',
            },
        });

        console.log('\n\n🚀 ENLACE DE PAGO GENERADO:');
        console.log('---------------------------------------------------');
        console.log(session.url);
        console.log('---------------------------------------------------');
        console.log('\n Abre este enlace para verificar:');
        console.log(' 1. Tu Logo (si está configurado)');
        console.log(' 2. Colores de marca');
        console.log(' 3. Checkbox de Términos y Condiciones obligatorio');

    } catch (err) {
        console.error('Error creating session:', err.message);
    }
}

main();
