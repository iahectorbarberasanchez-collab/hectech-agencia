'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Activity,
    ShieldCheck,
    Loader2,
    ArrowLeft,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Zap,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ClientProfile {
    id: string;
    company_name: string;
    status: 'building' | 'active' | 'live';
    created_at: string;
    is_admin: boolean;
    email?: string;
    phone?: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [stats, setStats] = useState({
        totalClients: 0,
        activeDeployments: 0,
        pendingSetup: 0
    });

    useEffect(() => {
        async function checkAdminAndFetch() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // Verificar si es admin en DB (primera capa)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();

            if (!profile?.is_admin) {
                router.push('/dashboard');
                return;
            }

            setIsAdmin(true);
            setLoading(false);
        }
        checkAdminAndFetch();
    }, [router]);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                setIsUnlocked(true);
                fetchData();
            } else {
                alert('Clave incorrecta. Acceso denegado.');
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setVerifying(false);
        }
    };

    const fetchData = async () => {
        // Obtener todos los clientes (perfiles) usando la función segura que incluye emails
        const { data: profilesData, error } = await supabase
            .rpc('get_admin_profiles');

        if (error) {
            console.error('Error fetching profiles:', error);
            // Fallback por si la función RPC no existiera o fallara
            const { data: fallbackData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fallbackData) {
                const clientsOnly = fallbackData.filter(p => !p.is_admin);
                setClients(clientsOnly as any);
                setStats({
                    totalClients: clientsOnly.length,
                    activeDeployments: clientsOnly.filter(c => c.status === 'live').length,
                    pendingSetup: clientsOnly.filter(c => c.status === 'building').length
                });
            }
            return;
        }

        if (profilesData) {
            // La función RPC ya filtra por permisos de admin internamente, pero filtramos por si acaso
            const clientsOnly = profilesData.filter((p: any) => !p.is_admin);
            setClients(clientsOnly);
            setStats({
                totalClients: clientsOnly.length,
                activeDeployments: clientsOnly.filter((c: any) => c.status === 'live').length,
                pendingSetup: clientsOnly.filter((c: any) => c.status === 'building').length
            });
        }
    };

    const updateClientStatus = async (clientId: string, newStatus: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', clientId);

        if (!error) {
            setClients(clients.map(c => c.id === clientId ? { ...c, status: newStatus as any } : c));
            alert('Estado actualizado con éxito');
        } else {
            console.error(error);
            alert('Error al actualizar estado');
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#00FF94]" size={48} />
            </main>
        );
    }

    if (!isUnlocked) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="max-w-md w-full glass-card p-10 rounded-3xl bg-white/5 border border-white/10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-[#00FF94]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#00FF94]/20 shadow-[0_0_30px_rgba(0,255,148,0.1)]">
                        <ShieldCheck className="text-[#00FF94]" size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
                        <p className="text-gray-400 text-sm">Introduce la clave de agencia para continuar</p>
                    </div>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña de Maestro"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:outline-none focus:border-[#00FF94]/50 transition-all font-mono tracking-widest"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full py-3 bg-[#00FF94] text-black font-bold rounded-xl hover:bg-[#00FF94]/90 transition-all flex items-center justify-center gap-2"
                        >
                            {verifying ? <Loader2 className="animate-spin" size={20} /> : 'Desbloquear Panel'}
                        </button>
                    </form>
                    <Link href="/dashboard" className="inline-block text-gray-500 hover:text-white text-xs transition-colors underline-offset-4 hover:underline">
                        Volver al Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Admin */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4 animate-in slide-in-from-left duration-700">
                        <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                                <ShieldCheck className="text-[#00FF94]" /> Control de Agencia
                            </h1>
                            <p className="text-gray-400">Panel Maestro HecTechAi</p>
                        </div>
                    </div>
                </header>

                {/* Stats Agency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Users size={24} /></div>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Total Clientes</h3>
                        <span className="text-3xl font-bold text-white">{stats.totalClients}</span>
                    </div>
                    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-[#00FF94]/10 text-[#00FF94]"><CheckCircle2 size={24} /></div>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Deployments Live</h3>
                        <span className="text-3xl font-bold text-white">{stats.activeDeployments}</span>
                    </div>
                    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500"><Zap size={24} /></div>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">En Construcción</h3>
                        <span className="text-3xl font-bold text-white">{stats.pendingSetup}</span>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="glass-card rounded-3xl bg-white/5 border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold">Gestión de Clientes</h3>
                        <button onClick={() => fetchData()} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-8 py-4">Empresa</th>
                                    <th className="px-8 py-4">Contacto</th>
                                    <th className="px-8 py-4">Estado Actual</th>
                                    <th className="px-8 py-4">Acciones de Despliegue</th>
                                    <th className="px-8 py-4">Dash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-medium text-white">{client.company_name}</div>
                                            <div className="text-xs text-gray-500 mt-1 font-mono">{client.id.split('-')[0]}...</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm text-gray-300">{client.email || 'No email'}</div>
                                            {client.phone && <div className="text-xs text-gray-500 mt-0.5">{client.phone}</div>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${(client.status === 'live' || client.status === 'active')
                                                ? 'bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                {client.status === 'building' ? 'BUILDING' : 'LIVE'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                {client.status === 'building' ? (
                                                    <button
                                                        onClick={() => updateClientStatus(client.id, 'live')}
                                                        className="px-3 py-1 text-[10px] rounded border bg-[#00FF94]/20 border-[#00FF94]/40 text-[#00FF94] hover:bg-[#00FF94]/30 transition-colors"
                                                    >
                                                        Set Live
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateClientStatus(client.id, 'building')}
                                                        className="px-3 py-1 text-[10px] rounded border bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                                                    >
                                                        Set Building
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Link
                                                href={`/dashboard?view_as=${client.id}`}
                                                className="p-2 text-gray-500 hover:text-[#00FF94] transition-colors inline-block"
                                                title={`Ver Dashboard de ${client.company_name}`}
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
