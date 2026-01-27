import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF94] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

            <div className="max-w-md w-full text-center space-y-8 p-10 glass-card rounded-3xl border border-white/10 relative z-10 shadow-2xl">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-[#00FF94]/10 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-12 h-12 text-[#00FF94]" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tighter font-display">¡Todo listo!</h1>
                    <p className="text-gray-400 leading-relaxed">
                        Tu suscripción se ha activado correctamente. Bienvenido a la revolución de la automatización.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300">
                        📧 Revisa tu correo: te hemos enviado tus credenciales de acceso.
                    </div>
                </div>

                <div className="pt-4 space-y-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#00FF94] text-black font-bold hover:bg-[#00cc76] transition-all shadow-[0_0_20px_rgba(0,255,148,0.2)] hover:scale-[1.02]"
                    >
                        Ir al Dashboard <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-4 text-gray-500 hover:text-white transition-colors text-sm"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
