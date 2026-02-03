import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full glass-card p-10 rounded-3xl border border-red-500/20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8">
                    <XCircle size={48} />
                </div>

                <h1 className="text-3xl font-bold mb-4 font-display">Pago Cancelado</h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Parece que hubo un problema o decidiste cancelar el proceso. No te preocupes, no se ha realizado ningún cargo.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/#precios"
                        className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                    >
                        <ArrowLeft size={18} /> Volver a Precios
                    </Link>

                    <Link
                        href="/#contacto"
                        className="flex items-center justify-center gap-2 w-full bg-white/5 text-white font-bold py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <MessageSquare size={18} /> Resolver dudas por chat
                    </Link>
                </div>

                <p className="mt-8 text-xs text-gray-600">
                    ¿Problemas técnicos? Contacta con <a href="mailto:hectechia@gmail.com" className="text-gray-400 underline">hectechia@gmail.com</a>
                </p>
            </div>
        </div>
    );
}
