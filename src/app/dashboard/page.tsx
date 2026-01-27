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
    UserCheck,
    Users
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getAutomationMetrics, requestDashboardAccess } from '../actions';

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
    status: string; // Added status field
    project_drive_url?: string; // Optional Google Drive Link
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
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MetricsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRequestingAccess, setIsRequestingAccess] = useState(false);
    const [requestEmail, setRequestEmail] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await getAutomationMetrics(clientId, password);
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

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestEmail) return;

        setRequestLoading(true);
        setError(null);
        setRequestSuccess(null);

        try {
            const response = await requestDashboardAccess(requestEmail);
            if (response.success) {
                setRequestSuccess(response.message || 'Contraseña enviada con éxito.');
                // Limpiar después de unos segundos o dejar que el usuario vuelva al login
            } else {
                setError(response.error || 'No se pudo procesar la solicitud.');
            }
        } catch (err) {
            setError('Error al conectar con el servidor.');
        } finally {
            setRequestLoading(false);
        }
    };

    if (!isAuthenticated || !data) {
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

                        {!isRequestingAccess ? (
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Lock size={14} className="text-[#00FF94]" />
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Introduce tu contraseña..."
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

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRequestingAccess(true);
                                            setError(null);
                                        }}
                                        className="text-sm text-gray-500 hover:text-[#00FF94] transition-colors"
                                    >
                                        ¿No tienes contraseña? Solicítala aquí
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {requestSuccess ? (
                                    <div className="space-y-6 text-center">
                                        <div className="w-16 h-16 bg-[#00FF94]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck size={32} className="text-[#00FF94]" />
                                        </div>
                                        <p className="text-white font-medium">{requestSuccess}</p>
                                        <button
                                            onClick={() => {
                                                setIsRequestingAccess(false);
                                                setRequestSuccess(null);
                                            }}
                                            className="text-[#00FF94] font-bold"
                                        >
                                            Volver al inicio de sesión
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRequestAccess} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                <Users size={14} className="text-[#00FF94]" />
                                                Email de Cliente
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="tu@email.com"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-all"
                                                value={requestEmail}
                                                onChange={(e) => setRequestEmail(e.target.value)}
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
                                            disabled={requestLoading}
                                            className="w-full bg-[#00FF94] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-effect disabled:opacity-50"
                                        >
                                            {requestLoading ? <Loader2 className="animate-spin" /> : 'Enviar mi contraseña'}
                                        </button>

                                        <div className="text-center pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsRequestingAccess(false);
                                                    setError(null);
                                                }}
                                                className="text-sm text-gray-500 hover:text-white transition-colors"
                                            >
                                                Volver al login
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    <Link href="/" className="flex items-center justify-center gap-2 text-gray-500 hover:text-[#00FF94] transition-colors mt-8 text-sm">
                        <ArrowLeft size={16} /> Volver a la web
                    </Link>
                </div>
            </main >
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

                    <div className="flex items-center gap-4">
                        {(data.status === 'ONBOARDING' || data.status === 'ONBOARDING_IN_PROGRESS') && (
                            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                                Implementación en Curso
                            </span>
                        )}
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {(data.status === 'ONBOARDING' || data.status === 'ONBOARDING_IN_PROGRESS') ? (
                    /* ONBOARDING VIEW */
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 relative">
                            <Zap size={40} className="text-yellow-500" />
                            <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 text-center">Estamos construyendo tu ecosistema</h2>
                        <p className="text-gray-400 text-center max-w-lg mb-8 text-lg">
                            Nuestro equipo está configurando tus agentes de IA. Tienes acceso a tu carpeta de proyecto en Google Drive para ver el progreso en tiempo real.
                        </p>

                        {data.project_drive_url && (
                            <Link
                                href={data.project_drive_url}
                                target="_blank"
                                className="mb-10 px-6 py-3 bg-[#00FF94]/10 border border-[#00FF94]/50 rounded-xl text-[#00FF94] font-bold hover:bg-[#00FF94]/20 transition-all flex items-center gap-2 group"
                            >
                                <Users size={20} />
                                Acceder a mi Carpeta de Proyecto
                                <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}

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
                    /* METRICS VIEW (Active) */
                    <div className="space-y-10">
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
                )}
            </div>
        </main>
    );
}
