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
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
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

            // Verificar si es admin
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

            // Obtener todos los clientes (perfiles)
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesData) {
                const clientsOnly = profilesData.filter(p => !p.is_admin);
                setClients(clientsOnly);
                setStats({
                    totalClients: clientsOnly.length,
                    activeDeployments: clientsOnly.filter(c => c.status === 'live').length,
                    pendingSetup: clientsOnly.filter(c => c.status === 'building').length
                });
            }

            setLoading(false);
        }
        checkAdminAndFetch();
    }, [router]);

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
                        <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-8 py-4">Empresa</th>
                                    <th className="px-8 py-4">Estado Actual</th>
                                    <th className="px-8 py-4">Acciones de Despliegue</th>
                                    <th className="px-8 py-4">Dash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6 font-medium text-white">{client.company_name}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${client.status === 'live' ? 'bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20' :
                                                    client.status === 'active' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateClientStatus(client.id, 'building')}
                                                    className={`px-3 py-1 text-[10px] rounded border ${client.status === 'building' ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}
                                                >
                                                    Set Building
                                                </button>
                                                <button
                                                    onClick={() => updateClientStatus(client.id, 'active')}
                                                    className={`px-3 py-1 text-[10px] rounded border ${client.status === 'active' ? 'bg-blue-500/20 border-blue-500/40 text-blue-500' : 'border-white/10 text-gray-500 hover:text-blue-500'}`}
                                                >
                                                    Set Active
                                                </button>
                                                <button
                                                    onClick={() => updateClientStatus(client.id, 'live')}
                                                    className={`px-3 py-1 text-[10px] rounded border ${client.status === 'live' ? 'bg-[#00FF94]/20 border-[#00FF94]/40 text-[#00FF94]' : 'border-white/10 text-gray-500 hover:text-[#00FF94]'}`}
                                                >
                                                    Set Live
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
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
