import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00FF94] transition-colors mb-8">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Lock size={200} />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#00FF94]/10 rounded-xl flex items-center justify-center text-[#00FF94]">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-display">Política de Privacidad</h1>
                    </div>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">1. Responsable del Tratamiento</h2>
                            <p>HecTechAi, con email de contacto <a href="mailto:hectechia@gmail.com" className="text-[#00FF94] hover:underline">hectechia@gmail.com</a>, es el responsable del tratamiento de los datos personales que nos proporciones a través de esta web.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">2. Finalidad</h2>
                            <p>Los datos recogidos (nombre, email, teléfono y descripción del negocio) se utilizan exclusivamente para:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Responder a tus solicitudes de información.</li>
                                <li>Realizar la Auditoría IA solicitada.</li>
                                <li>Gestionar la relación comercial en caso de contratación.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">3. Conservación</h2>
                            <p>Tus datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados y para determinar las posibles responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento de los datos.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">4. Derechos</h2>
                            <p>Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad de tus datos, de limitación y oposición a su tratamiento, enviando un correo a <a href="mailto:hectechia@gmail.com" className="text-[#00FF94] hover:underline">hectechia@gmail.com</a>.</p>
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
