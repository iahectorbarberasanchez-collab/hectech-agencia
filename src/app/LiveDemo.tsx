'use client';

import { useState } from 'react';

export default function LiveDemo() {
    const [activeTab, setActiveTab] = useState('inmobiliaria');

    const tabs = [
        { id: 'inmobiliaria', icon: 'apartment', title: 'Inmobiliaria', desc: 'Agendamiento de visitas 24/7' },
        { id: 'ecommerce', icon: 'shopping_cart', title: 'E-commerce', desc: 'Soporte pedidos y rastreo' },
        { id: 'salud', icon: 'cardiology', title: 'Clínicas / Salud', desc: 'Triaje básico y citas' },
        { id: 'restaurantes', icon: 'restaurant', title: 'Restaurantes', desc: 'Reservas y menú inteligente' }
    ];

    return (
        <section id="demo" className="relative py-12 lg:py-20 overflow-hidden">
            <div className="absolute inset-0 bg-circuit-pattern opacity-30 pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-primary tracking-widest uppercase mb-4 font-medium text-lg">Demostración en Vivo</h2>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                        Mira lo que la IA puede <br />
                        <span className="text-gradient">hacer por tu sector</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400">
                        Nuestros agentes de IA no duermen, no descansan y responden al instante.
                    </p>
                </div>

                <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden neon-glow-box">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                        {/* Sidebar */}
                        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0f0f0f] p-6">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6 ml-2">Sectores</h3>
                            <div className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-4 rounded-xl flex items-center gap-4 transition-all duration-300 border-l-4 group
                        ${activeTab === tab.id
                                                ? 'bg-surface shadow-md border-primary'
                                                : 'hover:bg-white/5 border-transparent'}`}
                                    >
                                        <span className={`p-2 rounded-lg transition-colors 
                        ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-800 text-gray-400'}`}>
                                            <span className="material-symbols-outlined">{tab.icon}</span>
                                        </span>
                                        <div>
                                            <span className={`block font-bold ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                                                {tab.title}
                                            </span>
                                            <span className="text-xs text-gray-500">{tab.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary">psychology</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">¿No ves tu sector?</p>
                                        <p className="text-xs text-gray-400 mt-1">Adaptamos el modelo en 48 horas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="lg:col-span-8 bg-surface relative flex flex-col">
                            {/* Render content based on activeTab */}
                            {activeTab === 'inmobiliaria' && (
                                <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img alt="Avatar Agente" className="w-10 h-10 rounded-full object-cover border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-U7EaROV4OPsXAzuurdij-wy7gQqEy5l9czWEleSJVxWuUHeOXKSZMZgEqxarOGcoZ-Whjz6smLUTIIOVueCL1WAkd0KgDBUXV5-ZajdhMyKSIvn2NnCZtDv5N9aa8GxKlg_Z_GJQCXucNkWom4BdgLc6ltin17yCZQyRR-N_teqqkFGuh3X6A_u5SrPS2v0mm7gceg74d2aMla6uarD-bDEg88KuHXJSAY35xRjo9NXcfCr0cO282mLR0qgSWjEk9Z7rvJ5LoIcq" />
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface rounded-full"></span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Laura - Agente Inmobiliaria</h4>
                                                <p className="text-xs text-primary font-medium">En línea ahora</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto bg-[#0c0c0c] space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0"><span className="material-symbols-outlined text-sm">smart_toy</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">¡Hola! Bienvenido a Luxury Homes. 👋 Soy Laura, tu asistente virtual. ¿Buscas comprar o alquilar?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 flex-shrink-0"><span className="material-symbols-outlined text-sm">person</span></div>
                                            <div className="bg-primary text-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                                                <p className="text-sm font-medium">Busco alquilar 2 habitaciones en el centro.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0"><span className="material-symbols-outlined text-sm">smart_toy</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">Tengo esta opción disponible:</p>
                                                <div className="relative group cursor-pointer overflow-hidden rounded-lg mt-2 mb-2">
                                                    <img alt="Apartment" className="w-full h-32 object-cover transition-transform group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy30TK20YTGauAORjMEHK5vxoq1h8EYsf8f5pvrTberwMapYrlgMqJiNaQlBZvAyfj1_FZq8b5f8s6nfkiU42XJzaDwYRlKf2JmnNsA6uK_bPqw-2Wgx3R1HJ7ULxCUDtjvv3c3Zbba4wbSSdt0fWqXJ2tIdMxYIGmzK0236VtelTWueFnbCP95EF-HLEq9tLwK4qh0LqO66ca-MBi2J59AvfbxR1JATq4HnBvsEAGxBN5NVmQnK70qSeo-B_-rHpXnjKTyjzsieVi" />
                                                    <div className="absolute bottom-0 w-full bg-black/60 p-2"><p className="text-white text-xs font-bold">Edificio Skyline - $1,200/mes</p></div>
                                                </div>
                                                <p className="text-sm text-gray-200">¿Agendamos visita para el jueves?</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ecommerce' && (
                                <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface z-10">
                                        <div className="flex items-center gap-3">
                                            <img alt="Support Bot" className="w-10 h-10 rounded-full object-cover border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2BUNj5MUEF7mc57eBwNCgtI4Hy9mS3_ou1dUgEdEdD7LZvXMe4XcKZpYHFYg5S86JoqR_IvXurSHTaZgMNrZc2NwZVE2ak41h1KAo0UWWXQ0hhEd5rk3bF_wAcaXFT_ckOryNrPxNChkbAVe2KKmU3g4oXyADtO-CYjnbWwHOikKcYRXb_g_CrWsKbiGWL3T4S8Q7bt9gNxc8Q2uhA5HRQLR5-qhjVnWvNPF9EhT2WXftZlfT18k7CNWh1lCGt_OGdqne236Og6V1" />
                                            <div>
                                                <h4 className="font-bold text-white">Soporte TiendaFit</h4>
                                                <p className="text-xs text-primary font-medium">Responde en &lt; 1s</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto bg-[#0c0c0c] space-y-4">
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-sm text-white">person</span></div>
                                            <div className="bg-primary text-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                                                <p className="text-sm font-medium">¿Dónde está mi pedido? #MX-9921</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0"><span className="material-symbols-outlined text-sm">inventory_2</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">Localizado. Tu pedido #MX-9921 está en reparto.</p>
                                                <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700 flex items-center gap-3">
                                                    <div className="bg-green-100 text-green-600 p-2 rounded"><span className="material-symbols-outlined">local_shipping</span></div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">Llega hoy antes de las 6:00 PM</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'salud' && (
                                <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white border-2 border-gray-800"><span className="material-symbols-outlined">medical_services</span></div>
                                            <div>
                                                <h4 className="font-bold text-white">Clínica Sanitas</h4>
                                                <p className="text-xs text-teal-400 font-medium">Asistente de Citas</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto bg-[#0c0c0c] space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 flex-shrink-0"><span className="material-symbols-outlined text-sm">support_agent</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">Buenas tardes. ¿En qué especialidad necesitas tu cita?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-sm text-white">person</span></div>
                                            <div className="bg-primary text-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                                                <p className="text-sm font-medium">Dermatólogo, tengo una alergia.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 flex-shrink-0"><span className="material-symbols-outlined text-sm">calendar_month</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">La Dra. Martínez tiene disponibilidad:</p>
                                                <div className="flex gap-2 mt-3">
                                                    <button className="px-3 py-1 bg-teal-500 text-white text-xs rounded-full hover:bg-teal-600 transition">Mañana 10:00 AM</button>
                                                    <button className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full hover:bg-gray-600 transition">Viernes 4:00 PM</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'restaurantes' && (
                                <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface z-10">
                                        <div className="flex items-center gap-3">
                                            <img alt="Restaurant Bot" className="w-10 h-10 rounded-full object-cover border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClKIidRlBRKjgzZgHvAUdUt62uKXL043heUu2on_6VTdjinUqp5FHO2ozHaur0EZMDqZ8IScbgRSkZ7OtsEyZhnKZZwCZVvyEFSorVxiCu0ZnVCfVcqhG4nFYMCMM8OsKklZQLYGC6TcxFQvkXJUANGbd9BOgpcnfJ-Gmp3CWs_5XZxyflMkEHHKq3jJQYN14K0VwJhUZtpmK-e1FEs82A1COn8YxXzCtwDwJPRpQKvenzZf1B0OxVUCgKhwrwpaFhoqRAfk0XIPyQ" />
                                            <div>
                                                <h4 className="font-bold text-white">Bistro Central</h4>
                                                <p className="text-xs text-orange-400 font-medium">Reservas &amp; Menú</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto bg-[#0c0c0c] space-y-4">
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-sm text-white">person</span></div>
                                            <div className="bg-primary text-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                                                <p className="text-sm font-medium">Reserva para 4, sábado.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0"><span className="material-symbols-outlined text-sm">restaurant_menu</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">¡Claro! 🍷 Tengo mesa en Terraza a las 8:00 PM. Este finde hay 2x1 en cócteles. 🍹</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-sm text-white">person</span></div>
                                            <div className="bg-primary text-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                                                <p className="text-sm font-medium">Terraza a las 8 está bien.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0"><span className="material-symbols-outlined text-sm">check_circle</span></div>
                                            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-gray-700">
                                                <p className="text-sm text-gray-200">¡Confirmado! ✅ Sábado 8:00 PM.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Input Area (Shared) */}
                            <div className="p-4 border-t border-white/10 bg-surface mt-auto">
                                <div className="relative">
                                    <input
                                        className="w-full bg-gray-900 border-none rounded-full py-3 px-5 text-sm focus:ring-2 focus:ring-primary text-white"
                                        disabled
                                        placeholder="Escribe tu respuesta..."
                                        type="text"
                                    />
                                    <button className="absolute right-2 top-1.5 bg-primary text-black p-1.5 rounded-full hover:bg-primary-dim transition-colors">
                                        <span className="material-symbols-outlined text-sm">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
