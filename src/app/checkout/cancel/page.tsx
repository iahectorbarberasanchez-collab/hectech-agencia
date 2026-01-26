import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-8 p-12 glass-card rounded-3xl border border-red-900/20">
                <div className="flex justify-center">
                    <XCircle className="w-20 h-20 text-zinc-600" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tighter font-display">Pago Cancelado</h1>
                    <p className="text-zinc-400">
                        No se ha realizado ningún cargo. Si has tenido algún problema técnico, por favor contacta con nosotros.
                    </p>
                </div>
                <div className="pt-8">
                    <Link
                        href="/#pricing"
                        className="block w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
                    >
                        Reintentar Pago
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-4 mt-4 text-zinc-500 hover:text-white transition-colors"
                    >
                        Volver a la Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
