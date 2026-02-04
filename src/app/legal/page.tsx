import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, FileText } from 'lucide-react';
import { Footer } from '../../components/Footer';

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00FF94] transition-colors mb-8">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Scale size={200} />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#00FF94]/10 rounded-xl flex items-center justify-center text-[#00FF94]">
                            <FileText size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-display">Aviso Legal</h1>
                    </div>

                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">1. Datos Identificativos</h2>
                            <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Titular:</strong> Hector Barbera Sanchez (HecTechAi)</li>
                                <li><strong>Email:</strong> <a href="mailto:hectechia@gmail.com" className="text-[#00FF94] hover:underline">hectechia@gmail.com</a></li>
                                <li><strong>Sitio Web:</strong> hectechai.com</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">2. Propiedad Intelectual</h2>
                            <p>El diseño de la web, su código fuente, logos, marcas y demás signos distintivos que aparecen en el mismo pertenecen a HecTechAi y están protegidos por los correspondientes derechos de propiedad intelectual e industrial.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">3. Exclusión de Responsabilidad</h2>
                            <p>HecTechAi no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">4. Jurisdicción</h2>
                            <p>Para la resolución de cualquier controversia derivada del uso de este sitio web, las partes se someten expresamente a los Juzgados y Tribunales de <strong>Sitges, Barcelona</strong>.</p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 text-center">
                        <p className="text-sm text-gray-500">HecTechAi Automation Agency</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
