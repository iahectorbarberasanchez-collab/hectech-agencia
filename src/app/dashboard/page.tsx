'use client';

import React, { useState } from 'react';
import {
    BarChart3,
    Clock,
    TrendingUp,
    Activity,
    ShieldCheck,
    ArrowLeft,
    Loader2,
    Lock,
    AlertCircle,
    Moon,
    Zap,
    UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { getAutomationMetrics } from '../actions';

// Componente para las tarjetas de estadísticas
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    unit: string;
    color: string;
}

// Componente para las tarjetas de estadísticas
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

interface MetricsData {
    client_name: string;
    total_actions: number;
    hours_saved: number;
    roi_euros: string;
    avg_response_time: number; // en segundos
    qualified_leads: number;
    after_hours_actions: number;
    history: Array<{ month: string; value: number }>;
}

export default function DashboardPage() {
    const [clientId, setClientId] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MetricsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await getAutomationMetrics(clientId);
            if (response.success && response.data) {
                setData(response.data as MetricsData);
                setIsAuthenticated(true);
            } else {
                setError(response.error || 'No se pudo acceder al dashboard.');
            }
        } catch (err: unknown) {
            console.error('Login error:', err);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !data) {
        return (
            <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">
                            HEC<span className="text-[#00FF94]">TECH</span>
                        </h1>
                        <p className="text-gray-400">Acceso exclusivo para clientes</p>
                    </div>

                    <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF94] to-[#00C2FF]"></div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock size={14} className="text-[#00FF94]" />
                                    ID de Cliente o Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Introduce tu identificador..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-all"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
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
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Bienvenido, <span className="text-[#00FF94]">{data.client_name}</span>
                        </h1>
                        <p className="text-gray-400">Dashboard de Impacto HecTechAi</p>
                    </div>

                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <StatCard
                        title="Tareas Completadas"
                        value={data.total_actions}
                        icon={Activity}
                        unit="ejecuciones"
                        color="#00FF94"
                    />
                    <StatCard
                        title="Atención 24/7"
                        value={data.after_hours_actions}
                        icon={Moon}
                        unit="fuera de horario"
                        color="#A855F7"
                    />
                    <StatCard
                        title="Tiempo Recuperado"
                        value={data.hours_saved}
                        icon={Clock}
                        unit="horas"
                        color="#00C2FF"
                    />
                    <StatCard
                        title="Velocidad Media"
                        value={data.avg_response_time}
                        icon={Zap}
                        unit="segundos"
                        color="#FACC15"
                    />
                    <StatCard
                        title="Leads Cualificados"
                        value={data.qualified_leads}
                        icon={UserCheck}
                        unit="listos"
                        color="#F472B6"
                    />
                    <StatCard
                        title="ROI Estimado"
                        value={data.roi_euros}
                        icon={BarChart3}
                        unit="€ ahorrados"
                        color="#00FF94"
                    />
                </div>

                {/* Charts & Detail Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden h-[400px] flex flex-col">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#00FF94]">
                            <TrendingUp size={24} />
                            Crecimiento de Eficiencia
                        </h3>
                        <div className="flex-1 flex items-end justify-between gap-4 pt-10">
                            {data.history.map((item: { month: string; value: number }, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#00FF94]/20 to-[#00FF94] rounded-t-lg transition-all duration-1000"
                                        style={{ height: `${(item.value / 1250) * 100}%` }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-500">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 border-l-[#00FF94] border-l-4">
                        <h3 className="text-xl font-bold mb-4">¿Qué significan estos datos?</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-[#00FF94] font-bold text-lg">Impacto Operativo</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Cada ejecución representa un proceso manual que ha sido eliminado de tu jornada. Actualmente, tu flujo está operando a una capacidad equivalente a {Math.floor(data.hours_saved / 8)} días de trabajo humano recuperados este mes.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-white font-medium mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <ShieldCheck size={16} className="text-[#00FF94]" />
                                    Estado del Sistema: <span className="text-[#00FF94]">Activo</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
