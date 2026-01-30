import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00FF94] transition-colors mb-8">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <FileText size={200} />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#00FF94]/10 rounded-xl flex items-center justify-center text-[#00FF94]">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-display">Términos y Condiciones</h1>
                    </div>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">1. Introducción</h2>
                            <p>Bienvenido a HecTechAi. Al contratar nuestros servicios de automatización e inteligencia artificial, aceptas los siguientes términos y condiciones. Nos comprometemos a ofrecer soluciones tecnológicas de alta calidad para optimizar tu negocio.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">2. Servicios</h2>
                            <p>HecTechAi provee servicios de desarrollo de chatbots, automatización de flujos de trabajo (n8n/Make) y consultoría de IA. Los detalles específicos de cada implementación se acordarán en la propuesta comercial.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">3. Pagos y Suscripciones</h2>
                            <p>Los servicios se abonan mediante pago único o suscripción recurrente a través de nuestra pasarela segura (Stripe). Las suscripciones se pueden cancelar en cualquier momento con un preaviso de 30 días, salvo que se especifique lo contrario en el contrato particular.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">4. Propiedad Intelectual</h2>
                            <p>El cliente mantiene la propiedad de sus datos. HecTechAi retiene los derechos sobre los componentes de software reutilizables y la metodología empleada, otorgando al cliente una licencia de uso perpetua sobre la solución implementada.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">5. Responsabilidad</h2>
                            <p>HecTechAi implementa las mejores prácticas de seguridad, pero no se hace responsable de fallos derivados de servicios de terceros (OpenAI, Google, servidores externos) fuera de nuestro control directo.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">6. Contacto</h2>
                            <p>Para cualquier duda legal o administrativa, contáctanos en <a href="mailto:hectechia@gmail.com" className="text-[#00FF94] hover:underline">hectechia@gmail.com</a>.</p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 text-center">
                        <p className="text-sm text-gray-500">HecTechAi Automation Agency</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
