'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
    {
        name: 'Setup Inicial',
        price: '1.500',
        description: 'Ideal para lanzar tu infraestructura IA base.',
        features: [
            'Configuración de n8n vps',
            '2 Automatizaciones base',
            'Integración con CRM/Notion',
            'Soporte 1 mes',
        ],
        priceId: 'price_initial_setup_id', // Reemplazar con ID real de Stripe
        type: 'payment',
    },
    {
        name: 'Mantenimiento PRO',
        price: '300',
        description: 'Optimización continua y soporte prioritario.',
        features: [
            'Mantenimiento de flujos',
            'Optimización de prompts',
            'Nuevas integraciones mensuales',
            'Soporte 24/7',
        ],
        priceId: 'price_maintenance_pro_id', // Reemplazar con ID real de Stripe
        type: 'subscription',
    },
];

export default function Pricing() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (priceId: string) => {
        setLoading(priceId);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error al iniciar el pago: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error en el servidor');
        } finally {
            setLoading(null);
        }
    };

    return (
        <section id="pricing" className="py-24 bg-black/50 backdrop-blur-sm border-t border-red-900/20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tighter">Inversión en <span className="text-red-600">Eficiencia</span></h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Selecciona el plan que mejor se adapte a tu fase de crecimiento.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-red-600/50 transition-colors group flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-zinc-400 mb-6 text-sm">{plan.description}</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-bold text-white">{plan.price}€</span>
                                    <span className="text-zinc-500">{plan.type === 'subscription' ? '/mes' : ''}</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-zinc-300">
                                            <Check className="w-5 h-5 text-red-600 shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleCheckout(plan.priceId)}
                                disabled={loading !== null}
                                className="w-full py-4 rounded-lg bg-white text-black font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                            >
                                {loading === plan.priceId ? 'Procesando...' : 'Empezar ahora'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
