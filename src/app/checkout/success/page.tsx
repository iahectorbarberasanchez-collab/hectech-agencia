import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-8 p-12 glass-card rounded-3xl border border-red-900/20">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-20 h-20 text-red-600" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tighter font-display">¡Pago Completado!</h1>
                    <p className="text-zinc-400">
                        Gracias por confiar en HecTechAi. Hemos recibido tu pago y estamos preparando todo para empezar.
                    </p>
                    <p className="text-zinc-500 text-sm">
                        Recibirás un email de confirmación y acceso a tu portal de cliente en breves momentos.
                    </p>
                </div>
                <div className="pt-8">
                    <Link
                        href="/dashboard"
                        className="block w-full py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                        Ir al Dashboard
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
