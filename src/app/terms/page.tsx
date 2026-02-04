import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { Footer } from '../../components/Footer';

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
                            <h2 className="text-xl font-bold text-white mb-2">1. Introducción y Servicios</h2>
                            <p>Bienvenido a HecTechAi. Al contratar nuestros servicios de automatización e inteligencia artificial, aceptas los siguientes términos. HecTechAi provee desarrollo de chatbots, automatización de procesos (n8n/Make) y consultoría estratégica de IA.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">2. Modelo de Pagos (50/50)</h2>
                            <p>Para proyectos de implementación única, se establece un pago del 50% por adelantado para iniciar los trabajos y el 50% restante antes del paso a producción y entrega final. Los pagos se procesan de forma segura a través de Stripe.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">3. Suscripción de Mantenimiento</h2>
                            <p>El servicio de mantenimiento mensual garantiza la operatividad de los flujos, monitorización de errores y actualizaciones de API. Este cargo es recurrente y se abona el día 1 de cada mes. <strong>El impago de la suscripción resultará en la suspensión automática de los flujos y servicios hospedados en la infraestructura de HecTechAi.</strong></p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">4. Limitación de Responsabilidad (IA)</h2>
                            <p>El cliente reconoce que la Inteligencia Artificial (LLMs) puede generar errores, imprecisiones o "alucinaciones". HecTechAi implementa filtros de seguridad, pero el cliente es responsable de la supervisión final del contenido generado. HecTechAi no se hace responsable de daños derivados de errores lógicos de la IA o fallos en servicios de terceros (OpenAI, Anthropic, Google, etc.).</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">5. Propiedad Intelectual y Hosting</h2>
                            <p>HecTechAi hospeda las automatizaciones en servidores propios para garantizar el mantenimiento. El cliente recibe una licencia de uso sobre los flujos implementados. La propiedad de los datos procesados pertenece íntegramente al cliente.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">6. Limitación de Responsabilidad Económica</h2>
                            <p>En ningún caso la responsabilidad total de HecTechAi excederá el importe total pagado por el cliente en los últimos tres (3) meses anteriores al evento que origine la reclamación. Esta limitación no aplicará en casos de dolo o negligencia grave debidamente probada.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">7. Disponibilidad del Servicio (SLA)</h2>
                            <p>HecTechAi no garantiza un tiempo de actividad (uptime) del 100% debido a la dependencia de servicios de terceros (OpenAI, Anthropic, Google, etc.). Los tiempos de respuesta y disponibilidad están sujetos a la operatividad de dichos proveedores externos.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">8. Cancelación y Reembolsos</h2>
                            <p>El servicio de mantenimiento mensual puede cancelarse con quince (15) días de preaviso antes de la renovación. No existen reembolsos por periodos no disfrutados. El impago resultará en la suspensión automática tras 7 días de mora.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">9. Jurisdicción y Ley Aplicable</h2>
                            <p>Este acuerdo se rige por la legislación española. Para cualquier controversia, las partes se someten expresamente a los Juzgados y Tribunales de <strong>Valencia, España</strong>, renunciando a cualquier otro fuero.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-2">10. Contacto</h2>
                            <p>Para dudas legales o administrativas: <a href="mailto:hectechia@gmail.com" className="text-[#00FF94] hover:underline">hectechia@gmail.com</a>.</p>
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
