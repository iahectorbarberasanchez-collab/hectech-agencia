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
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase Cliente
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipos basados en las tablas de la Guía
interface Profile {
    id: string;
    company_name: string;
    status: 'building' | 'active';
}

interface DailyMetrics {
    automations_run: number;
    time_saved_minutes: number;
}

// Componente para las tarjetas de estadísticas
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
    const [metrics, setMetrics] = useState<DailyMetrics[]>([]);

    useEffect(() => {
        async function getData() {
            // 1. Verificar sesión
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // 2. Obtener estado del perfil (profiles)
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

            // 3. Si está activo, obtener métricas (daily_metrics)
            if (profileData?.status === 'active') {
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

    // Cálculos derivados de las métricas reales
    const totalAutomations = metrics.reduce((acc, curr) => acc + (curr.automations_run || 0), 0);
    const totalMinutesSaved = metrics.reduce((acc, curr) => acc + (curr.time_saved_minutes || 0), 0);
    const hoursSaved = Math.floor(totalMinutesSaved / 60);
    // Estimaciones basadas en datos reales
    const roiEuros = (hoursSaved * 50).toFixed(0); // Valor estimado hora €50
    const qualifiedLeads = Math.floor(totalAutomations * 0.1); // 10% conversión est.
    const afterHours = Math.floor(totalAutomations * 0.35); // 35% fuera de horario est.

    if (!profile) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Bienvenido, <span className="text-[#00FF94]">{profile.company_name || 'Cliente'}</span>
                        </h1>
                        <p className="text-gray-400">Dashboard de Impacto HecTechAi</p>
                    </div>

                    <div className="flex items-center gap-4">
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

                {profile.status === 'building' ? (
                    /* Building / Onboarding View */
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
                    /* Active Metrics View */
                    <div className="space-y-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <StatCard
                                title="Tareas Completadas"
                                value={totalAutomations}
                                icon={Activity}
                                unit="ejecuciones"
                                color="#00FF94"
                            />
                            <StatCard
                                title="Atención 24/7"
                                value={afterHours}
                                icon={Moon}
                                unit="fuera de horario"
                                color="#A855F7"
                            />
                            <StatCard
                                title="Tiempo Recuperado"
                                value={hoursSaved}
                                icon={Clock}
                                unit="horas"
                                color="#00C2FF"
                            />
                            <StatCard
                                title="Velocidad Media"
                                value="< 5"
                                icon={Zap}
                                unit="segundos"
                                color="#FACC15"
                            />
                            <StatCard
                                title="Leads Cualificados"
                                value={qualifiedLeads}
                                icon={UserCheck}
                                unit="listos"
                                color="#F472B6"
                            />
                            <StatCard
                                title="ROI Estimado"
                                value={roiEuros}
                                icon={BarChart3}
                                unit="€ ahorrados"
                                color="#00FF94"
                            />
                        </div>

                        {/* Charts & Detail Section */}
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
                )}
            </div>
        </main>
    );
}
