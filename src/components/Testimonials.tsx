'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Clock } from 'lucide-react';

const testimonials = [
    {
        name: "Carlos Ruiz",
        role: "Director Inmobiliaria",
        content: "Antes de HecTechAi, perdíamos el 40% de los leads que entraban por la noche. Ahora el bot responde y agenda visitas 24/7. Mi equipo solo va a las visitas ya confirmadas.",
        metric: "40%",
        metricLabel: "Más Citas Agendadas",
        icon: <TrendingUp className="text-[#00FF94]" size={20} />
    },
    {
        name: "Dra. Elena Martínez",
        role: "Clínica Dental",
        content: "La automatización del seguimiento post-tratamiento ha sido un cambio radical. Los pacientes se sienten mucho más cuidados y hemos reducido las faltas un 50%.",
        metric: "50%",
        metricLabel: "Menos Ausencias",
        icon: <Users className="text-[#00C2FF]" size={20} />
    },
    {
        name: "Jordi S.",
        role: "Dueño de Restaurante",
        content: "Teníamos a una persona dedicada solo a gestionar reservas de grupos. Con la IA, el proceso es autónomo y no hemos tenido ni un solo error en 3 meses.",
        metric: "+15h/sem",
        metricLabel: "Tiempo Ahorrado",
        icon: <Clock className="text-purple-400" size={20} />
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                        Resultados que <span className="text-gradient">hablan por sí solos</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        No solo instalamos tecnología, resolvemos problemas de negocio con métricas reales.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col h-full premium-border relative group"
                        >
                            <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Quote size={40} className="text-white" />
                            </div>

                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className="fill-[#00FF94] text-[#00FF94]" />
                                ))}
                            </div>

                            <p className="text-gray-300 mb-8 leading-relaxed italic flex-grow">
                                "{t.content}"
                            </p>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                                    <span className="font-bold text-lg">{t.name[0]}</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{t.name}</h4>
                                    <p className="text-gray-500 text-xs">{t.role}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-black text-white">{t.metric}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t.metricLabel}</div>
                                </div>
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    {t.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
