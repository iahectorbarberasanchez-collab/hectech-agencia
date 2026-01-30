import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">

            <div className="max-w-md w-full text-center space-y-8 p-10 glass-card rounded-3xl border border-white/10 relative z-10">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white tracking-tighter font-display">Pago Cancelado</h1>
                    <p className="text-gray-400 leading-relaxed">
                        El proceso de pago no se ha completado. No se ha realizado ningún cargo en tu cuenta.
                    </p>
                </div>

                <div className="pt-4 space-y-3">
                    <Link
                        href="/#pricing"
                        className="block w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-lg hover:scale-[1.02]"
                    >
                        Intentar de nuevo
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-4 text-gray-500 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Volver al sitio
                    </Link>
                </div>
            </div>
        </div>
    );
}
