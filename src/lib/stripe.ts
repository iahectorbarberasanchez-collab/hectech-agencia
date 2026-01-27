import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(stripeSecretKey || '', {
    apiVersion: '2025-12-15.clover', // Latest or stable version
    typescript: true,
});
