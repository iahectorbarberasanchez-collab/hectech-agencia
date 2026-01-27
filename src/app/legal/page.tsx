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

export default function AvisoLegal() {
    return (
        <LegalLayout title="Aviso Legal">
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">1. Datos del Titular</h2>
                    <p className="text-gray-400">
                        En cumplimiento de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular del sitio web:
                    </p>
                    <ul className="text-gray-400 list-disc pl-6 mt-4 space-y-2">
                        <li><strong>Titular:</strong> Hector Barbera Sanchez</li>
                        <li><strong>Email:</strong> hectechia@gmail.com</li>
                        <li><strong>Actividad:</strong> Consultoría y Desarrollo de Soluciones de Automatización con IA</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">2. Propiedad Intelectual</h2>
                    <p className="text-gray-400">
                        Todo el contenido de este sitio web (textos, imágenes, logotipos, diseño) es propiedad de HecTechAi o de sus licenciantes y está protegido por las leyes de propiedad intelectual e industrial.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">3. Exención de Responsabilidad</h2>
                    <p className="text-gray-400">
                        HecTechAi no se hace responsable de los daños o perjuicios que pudieran derivarse del uso de los contenidos o servicios ofrecidos en este sitio, ni de la información contenida en páginas web de terceros a las que se pueda acceder mediante enlaces.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
