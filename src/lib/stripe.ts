import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Durante el build, si no hay key, inicializamos con un string vacío pero no usamos el cliente
export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});
