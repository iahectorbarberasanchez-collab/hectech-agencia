import Link from 'next/link';

const LegalLayout = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00FF94] selection:text-black pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-12 text-gradient">{title}</h1>
            <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 prose prose-invert max-w-none">
                {children}
            </div>
            <div className="mt-12">
                <Link href="/" className="text-[#00FF94] hover:underline flex items-center gap-2">
                    ← Volver al inicio
                </Link>
            </div>
        </div>
    </div>
);

export default function PoliticaPrivacidad() {
    return (
        <LegalLayout title="Política de Privacidad">
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">1. Información al Usuario</h2>
                    <p className="text-gray-400">
                        HecTechAi (Hector Barbera Sanchez) es el responsable del tratamiento de los datos personales del Usuario. Estos datos serán tratados de conformidad con lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">2. Finalidad del Tratamiento</h2>
                    <p className="text-gray-400">
                        Los datos facilitados a través del formulario de contacto se utilizarán exclusivamente para:
                    </p>
                    <ul className="text-gray-400 list-disc pl-6 mt-2 space-y-1">
                        <li>Responder a consultas o solicitudes de información.</li>
                        <li>Gestionar la prestación de servicios solicitados.</li>
                        <li>Enviar información comercial relacionada con nuestros servicios (solo si se ha solicitado).</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">3. Legitimación y Conservación</h2>
                    <p className="text-gray-400">
                        La base legal para el tratamiento es el consentimiento del interesado al enviar el formulario. Los datos se conservarán mientras exista un interés mutuo para mantener el fin del tratamiento.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">4. Derechos del Usuario</h2>
                    <p className="text-gray-400">
                        El usuario puede ejercer en cualquier momento sus derechos de acceso, rectificación, portabilidad, supresión, limitación y oposición dirigiéndose a <a href="mailto:hectechia@gmail.com" className="text-[#00FF94]">hectechia@gmail.com</a>.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
