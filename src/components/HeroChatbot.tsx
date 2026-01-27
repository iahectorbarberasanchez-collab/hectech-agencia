'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, ArrowRight, Sparkles, Clock, Target, Zap } from 'lucide-react';

interface Message {
    id: number;
    type: 'bot' | 'user';
    text: string;
    options?: string[];
    action?: string;
}

export const HeroChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const script: Message[] = [
        {
            id: 1,
            type: 'bot',
            text: '¡Hola! Soy Hector-AI, tu Concierge de Automatización. 👋',
        },
        {
            id: 2,
            type: 'bot',
            text: 'Déjame hacerte una pregunta: ¿Cuántas horas a la semana pierdes respondiendo mensajes repetitivos, agendando citas o persiguiendo leads?',
            options: ['Muchas...', 'Demasiadas', 'No llevo la cuenta'],
        },
        {
            id: 3,
            type: 'bot',
            text: 'Lo entiendo perfectamente. La mayoría de negocios pierden entre 15-20 horas semanales en tareas que una IA podría hacer automáticamente.',
        },
        {
            id: 4,
            type: 'bot',
            text: 'Aquí está el problema: Si un cliente potencial te escribe a las 11 de la noche o un domingo, ¿quién le responde?',
            options: ['Nadie, hasta el lunes', 'Yo... desde mi móvil', 'Perdemos ese lead'],
        },
        {
            id: 5,
            type: 'bot',
            text: 'Exacto. Y ahí es donde pierdes dinero. Los estudios muestran que si no respondes en los primeros 5 minutos, la probabilidad de conversión cae un 80%.',
        },
        {
            id: 6,
            type: 'bot',
            text: 'Ahora imagina esto: Un agente de IA que trabaja 24/7, responde al instante, califica leads, agenda citas en tu calendario y hace seguimiento automático.',
            options: ['Suena bien, ¿cómo funciona?', 'Necesito esto ya', '¿Es complicado de configurar?'],
        },
        {
            id: 7,
            type: 'bot',
            text: 'Es más simple de lo que piensas. Analizamos tu negocio, identificamos qué tareas te quitan más tiempo, y diseñamos agentes IA específicos para tu sector.',
        },
        {
            id: 8,
            type: 'bot',
            text: 'Por ejemplo: Si tienes una inmobiliaria, el agente responde preguntas sobre propiedades, envía fotos, agenda visitas y sincroniza todo con tu CRM. Sin que muevas un dedo.',
        },
        {
            id: 9,
            type: 'bot',
            text: 'Lo mejor: La mayoría de nuestros clientes recuperan la inversión en menos de 2 meses gracias al tiempo ahorrado y los leads que ya no se pierden.',
            options: ['¿Cuánto cuesta?', 'Quiero una demo', '¿Funciona para mi sector?'],
        },
        {
            id: 10,
            type: 'bot',
            text: 'Cada negocio es diferente, por eso ofrecemos una auditoría gratuita donde analizamos tu caso específico y te mostramos exactamente cuánto podrías ahorrar.',
        },
        {
            id: 11,
            type: 'bot',
            text: '¿Listo para recuperar tu tiempo y dejar de perder clientes? Agenda una consultoría gratuita de 30 minutos y te muestro cómo funciona en tu negocio. 🚀',
            action: 'show_cta'
        }
    ];

    const [scriptIndex, setScriptIndex] = useState(0);

    useEffect(() => {
        if (scriptIndex === 0) {
            addNextMessage();
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const addNextMessage = () => {
        if (scriptIndex < script.length) {
            setIsTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, script[scriptIndex]]);
                setIsTyping(false);
                setScriptIndex(prev => prev + 1);
            }, 1500);
        }
    };

    const handleOptionClick = (option: string) => {
        const userMsg: Message = {
            id: Date.now(),
            type: 'user',
            text: option
        };
        setMessages(prev => [...prev, userMsg]);

        // Si el bot tiene un mensaje pendiente que no es de opciones, lo mostramos
        // Pero en este script simple, cada interacción del usuario dispara el siguiente paso del script
        addNextMessage();
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl premium-border bg-black/40 backdrop-blur-xl">
                {/* Header */}
                <div className="bg-white/5 p-4 flex items-center gap-3 border-b border-white/10">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00FF94] to-blue-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <Bot size={20} className="text-[#00FF94]" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                    </div>
                    <div>
                        <div className="font-bold text-sm text-white">Hector-AI</div>
                        <div className="text-[10px] text-[#00FF94] font-medium tracking-wider uppercase">Concierge de Automatización</div>
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="h-[450px] overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar"
                >
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-[#00C2FF]/20 text-white rounded-tr-sm border border-[#00C2FF]/20'
                                    : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/10'
                                    }`}>
                                    {msg.text}

                                    {msg.options && msg.type === 'bot' && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleOptionClick(opt)}
                                                    className="px-3 py-2 bg-[#00FF94]/10 hover:bg-[#00FF94]/20 border border-[#00FF94]/30 rounded-lg text-xs font-bold text-[#00FF94] transition-all"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.action === 'show_cta' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1 }}
                                            className="mt-4"
                                        >
                                            <a
                                                href="#contacto"
                                                className="flex items-center justify-center gap-2 w-full bg-[#00FF94] text-black font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                                            >
                                                Agendar Consultoría
                                                <ArrowRight size={16} />
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm border border-white/10 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer Input placeholder */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                    <div className="flex-1 bg-black/40 rounded-full h-10 px-4 flex items-center text-gray-500 text-xs italic">
                        Selecciona una opción arriba...
                    </div>
                    <div className="w-10 h-10 bg-[#00FF94]/20 rounded-full flex items-center justify-center text-[#00FF94]/50">
                        <Send size={18} />
                    </div>
                </div>
            </div>

            {/* Trust Badges under chatbot */}
            <div className="mt-6 grid grid-cols-3 gap-2 opacity-50">
                <div className="flex flex-col items-center gap-1">
                    <Clock size={14} className="text-[#00FF94]" />
                    <span className="text-[8px] uppercase font-bold tracking-tighter">Instalación 24h</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Target size={14} className="text-[#00C2FF]" />
                    <span className="text-[8px] uppercase font-bold tracking-tighter">Precisión 99%</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Zap size={14} className="text-purple-400" />
                    <span className="text-[8px] uppercase font-bold tracking-tighter">ROI Inmediato</span>
                </div>
            </div>
        </div>
    );
};
