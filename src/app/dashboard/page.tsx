'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Clock,
    TrendingUp,
    Activity,
    ShieldCheck,
    Loader2,
    Moon,
    Zap,
    UserCheck,
    Users,
    ArrowLeft,
    LifeBuoy,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase Cliente
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
    id: string;
    company_name: string;
    status: 'building' | 'active' | 'live';
    is_admin?: boolean;
}

interface DailyMetrics {
    automations_run: number;
    time_saved_minutes: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    unit: string;
    color: string;
}

const StatCard = ({ title, value, icon: Icon, unit, color }: StatCardProps) => (
    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00FF94]/40 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/5" style={{ color: color }}>
                <Icon size={24} />
            </div>
            <div className="text-[#00FF94] opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp size={20} />
            </div>
        </div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
            <span className="text-gray-500 text-sm">{unit}</span>
        </div>
    </div>
);

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTab, setActiveTab] = useState<'metrics' | 'support'>('metrics');
    const [metrics, setMetrics] = useState<DailyMetrics[]>([]);

    useEffect(() => {
        async function getData() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
            } else {
                setProfile(profileData);
            }

            if (profileData?.status === 'active' || profileData?.status === 'live') {
                const { data: metricsData, error: metricsError } = await supabase
                    .from('daily_metrics')
                    .select('*')
                    .eq('client_id', session.user.id);

                if (!metricsError && metricsData) {
                    setMetrics(metricsData);
                }
            }

            setLoading(false);
        }
        getData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#00FF94]" size={48} />
            </main>
        );
    }

    const totalAutomations = metrics.reduce((acc, curr) => acc + (curr.automations_run || 0), 0);
    const totalMinutesSaved = metrics.reduce((acc, curr) => acc + (curr.time_saved_minutes || 0), 0);
    const hoursSaved = Math.floor(totalMinutesSaved / 60);
    const roiEuros = (hoursSaved * 50).toFixed(0);
    const qualifiedLeads = Math.floor(totalAutomations * 0.1);
    const afterHours = Math.floor(totalAutomations * 0.35);

    if (!profile) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Bienvenido, <span className="text-[#00FF94]">{profile.company_name || 'Cliente'}</span>
                        </h1>
                        <p className="text-gray-400">Dashboard de Impacto HecTechAi</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {profile.is_admin && (
                            <Link
                                href="/admin"
                                className="px-4 py-2 bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94] rounded-lg text-sm font-bold hover:bg-[#00FF94]/20 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck size={18} />
                                Control Agency
                            </Link>
                        )}
                        {profile.status === 'building' && (
                            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                Construcción en Progreso
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                <div className="flex gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('metrics')}
                        className={`text-sm font-medium transition-colors ${activeTab === 'metrics' ? 'text-[#00FF94] border-b-2 border-[#00FF94] pb-4 -mb-4.5' : 'text-gray-500 hover:text-white'}`}
                    >
                        Métricas de Impacto
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        className={`text-sm font-medium transition-colors ${activeTab === 'support' ? 'text-[#00FF94] border-b-2 border-[#00FF94] pb-4 -mb-4.5' : 'text-gray-500 hover:text-white'}`}
                    >
                        Soporte Técnico
                    </button>
                </div>

                {activeTab === 'metrics' ? (
                    profile.status === 'building' ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-700">
                            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 relative">
                                <Zap size={40} className="text-yellow-500" />
                                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping opacity-20"></div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4 text-center">Estamos construyendo tu ecosistema</h2>
                            <p className="text-gray-400 text-center max-w-lg mb-8 text-lg">
                                Nuestro equipo está configurando tus agentes de IA. Te notificaremos cuando tu sistema esté 100% operativo.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                                <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 opacity-50">
                                    <div className="text-[#00FF94] mb-3"><ShieldCheck size={24} /></div>
                                    <h3 className="text-white font-bold mb-1">1. Acuerdo</h3>
                                    <p className="text-xs text-gray-500">Completado</p>
                                </div>
                                <div className="glass-card p-6 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/30 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00FF94]"></div>
                                    <div className="text-yellow-500 mb-3"><Activity size={24} className="animate-spin-slow" /></div>
                                    <h3 className="text-white font-bold mb-1">2. Construcción</h3>
                                    <p className="text-xs text-[#00FF94]">En Progreso...</p>
                                </div>
                                <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 opacity-50">
                                    <div className="text-gray-500 mb-3"><Zap size={24} /></div>
                                    <h3 className="text-white font-bold mb-1">3. Activación</h3>
                                    <p className="text-xs text-gray-500">Pendiente</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                <StatCard title="Tareas Completadas" value={totalAutomations} icon={Activity} unit="ejecuciones" color="#00FF94" />
                                <StatCard title="Atención 24/7" value={afterHours} icon={Moon} unit="fuera de horario" color="#A855F7" />
                                <StatCard title="Tiempo Recuperado" value={hoursSaved} icon={Clock} unit="horas" color="#00C2FF" />
                                <StatCard title="Velocidad Media" value="< 5" icon={Zap} unit="segundos" color="#FACC15" />
                                <StatCard title="Leads Cualificados" value={qualifiedLeads} icon={UserCheck} unit="listos" color="#F472B6" />
                                <StatCard title="ROI Estimado" value={roiEuros} icon={BarChart3} unit="€ ahorrados" color="#00FF94" />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 border-l-[#00FF94] border-l-4">
                                    <h3 className="text-xl font-bold mb-4">¿Qué significan estos datos?</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[#00FF94] font-bold text-lg">Impacto Operativo</p>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                Cada ejecución representa un proceso manual eliminado. Tu sistema está operando a plena capacidad, recuperando tiempo valioso para tu negocio todos los días.
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-white font-medium mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                <ShieldCheck size={16} className="text-[#00FF94]" />
                                                Estado del Sistema: <span className="text-[#00FF94]">Activo & Optimizado</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-[#00FF94]/10 text-[#00FF94]"><CheckCircle2 size={24} /></div>
                                <div><h4 className="text-white font-bold text-sm">Flujos n8n</h4><p className="text-[#00FF94] text-xs">Operativo</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-[#00FF94]/10 text-[#00FF94]"><CheckCircle2 size={24} /></div>
                                <div><h4 className="text-white font-bold text-sm">Base de Datos</h4><p className="text-[#00FF94] text-xs">Operativo</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-[#00FF94]/10 text-[#00FF94]"><CheckCircle2 size={24} /></div>
                                <div><h4 className="text-white font-bold text-sm">IA Agents</h4><p className="text-[#00FF94] text-xs">Operativo</p></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <LifeBuoy className="text-[#00FF94]" /><h3 className="text-xl font-bold">Abrir Ticket de Soporte</h3>
                                </div>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Asunto</label>
                                        <input type="text" placeholder="¿En qué podemos ayudarte?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00FF94] outline-none transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Descripción</label>
                                        <textarea rows={4} placeholder="Describe la incidencia o consulta..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00FF94] outline-none transition-colors"></textarea>
                                    </div>
                                    <button type="button" onClick={() => alert('Ticket simulado enviado con éxito a Notion/Supabase')} className="w-full py-4 bg-[#00FF94] text-black font-bold rounded-xl hover:bg-[#00e685] transition-colors flex items-center justify-center gap-2">Enviar Solicitud</button>
                                </form>
                            </div>
                            <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 border-l-purple-500 border-l-4">
                                <h3 className="text-xl font-bold mb-4">Mantenimiento HecTechAi</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="mt-1"><AlertCircle size={18} className="text-purple-400" /></div>
                                        <div><p className="text-white text-sm font-bold">Próxima Optimización</p><p className="text-gray-400 text-xs">05/02/2026 - Actualización de modelos LLM</p></div>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed pt-4 border-t border-white/10">Tu ecosistema está bajo monitoreo continuo. Cualquier anomalía detectada por nuestro sistema de IA generará una alerta automática en nuestra central.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
