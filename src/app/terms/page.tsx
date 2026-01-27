import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-purple-500/30">
            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors mb-8 inline-block">
                        ← Volver al inicio
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Términos y Condiciones
                    </h1>
                    <p className="text-gray-400">
                        Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>

                <div className="space-y-12 prose prose-invert prose-purple max-w-none">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Introducción</h2>
                        <p className="leading-relaxed">
                            Bienvenido a HecTechAI. Al contratar nuestros servicios de automatización e inteligencia artificial,
                            aceptas estos términos y condiciones. Nos dedicamos a transformar negocios mediante soluciones tecnológicas
                            avanzadas, y estos términos rigen nuestra relación profesional.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Servicios</h2>
                        <p className="leading-relaxed mb-4">
                            HecTechAI ofrece servicios de implementación de chatbots, automatización de flujos de trabajo (n8n, Zapier)
                            y consultoría de IA. El alcance específico de cada proyecto se define en la propuesta aceptada o en la descripción
                            del servicio contratado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Pagos y Suscripciones</h2>
                        <p className="leading-relaxed mb-4">
                            Los servicios pueden facturarse como pago único o suscripción recurrente. Al proporcionar tus datos de pago,
                            autorizas a HecTechAI a realizar los cargos correspondientes. Las suscripciones pueden cancelarse en cualquier
                            momento con efecto al finalizar el periodo de facturación actual.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Propiedad Intelectual</h2>
                        <p className="leading-relaxed mb-4">
                            El cliente conserva la propiedad de sus datos. HecTechAI conserva la propiedad intelectual de los componentes
                            preexistentes, metodologías y código base reutilizable utilizado en la implementación, otorgando al cliente
                            una licencia de uso perpetua para la solución entregada.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Confidencialidad</h2>
                        <p className="leading-relaxed mb-4">
                            Nos comprometemos a mantener la estricta confidencialidad de toda la información comercial y técnica a la que
                            tengamos acceso durante la prestación del servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Limitación de Responsabilidad</h2>
                        <p className="leading-relaxed mb-4">
                            HecTechAI no se hace responsable de pérdidas indirectas o consecuentes. Nuestra responsabilidad máxima se limita
                            al importe pagado por el cliente por el servicio específico que originó la reclamación.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-gray-800 mt-12">
                        <p className="text-sm text-gray-500">
                            HecTechAI - Agencia de Automatización e IA
                            <br />
                            Contacto: contacto@hectechai.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
