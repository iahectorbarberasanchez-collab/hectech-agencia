'use client';

import React, { useState } from 'react';
import {
    Loader2,
    Lock,
    AlertCircle,
    ArrowLeft,
    Mail
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase Cliente (Client-side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: unknown) {
            console.error('Login error:', err);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center justify-center mb-10 gap-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-white/5 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,255,148,0.1)] mb-2">
                        <Image
                            src="/logo.png"
                            alt="HecTechAi Logo"
                            width={56}
                            height={56}
                            className="object-contain"
                            style={{ mixBlendMode: 'screen' }}
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white tracking-tighter font-display">
                            Hec<span className="text-[#00FF94]">TechAi</span>
                        </h1>
                        <p className="text-gray-400 mt-2">Acceso exclusivo para clientes</p>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF94] to-[#00C2FF]"></div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Mail size={14} className="text-[#00FF94]" />
                                Email Corporativo
                            </label>
                            <input
                                type="email"
                                placeholder="tu@empresa.com"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Lock size={14} className="text-[#00FF94]" />
                                Contraseña
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00FF94] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-effect disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Ver mi Impacto'}
                        </button>
                    </form>
                </div>

                <Link href="/" className="flex items-center justify-center gap-2 text-gray-500 hover:text-[#00FF94] transition-colors mt-8 text-sm">
                    <ArrowLeft size={16} /> Volver a la web
                </Link>
            </div>
        </main >
    );
}
