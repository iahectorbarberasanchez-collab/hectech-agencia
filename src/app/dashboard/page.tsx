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
    AlertCircle,
    LogOut,
    Settings,
    MessageSquare,
    Phone
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
    status: 'building' | 'active' | 'live';
    is_admin?: boolean;
}

interface DailyMetrics {
    automations_run: number;
    time_saved_minutes: number;
    leads_generated: number;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    website?: string;
    tech_debt?: string;
    has_chatbot?: boolean;
    created_at: string;
}

interface ConciergeLog {
    id: string;
    phone_number: string;
    user_message: string;
    ai_response: string;
    timestamp: string;
    status: string;
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
    const [activeTab, setActiveTab] = useState<'metrics' | 'support' | 'leads' | 'concierge'>('metrics');
    const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [conciergeLogs, setConciergeLogs] = useState<ConciergeLog[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftContent, setDraftContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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

            if (profileData?.status === 'active' || profileData?.status === 'live' || profileData?.is_admin) {
                const { data: metricsData, error: metricsError } = await supabase
                    .from('v_daily_metrics')
                    .select('*')
                    .eq('client_id', session.user.id);

                if (!metricsError && metricsData) {
                    setMetrics(metricsData);
                }

                // Fetch Leads if admin
                if (profileData?.is_admin) {
                    const { data: leadsData, error: leadsError } = await supabase
                        .from('marketing_leads')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!leadsError && leadsData) {
                        setLeads(leadsData);
                    }
                }

                // Fetch Concierge Logs
                const { data: conciergeData, error: conciergeError } = await supabase
                    .from('concierge_logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(50);

                if (!conciergeError && conciergeData) {
                    setConciergeLogs(conciergeData);
                }
            }

            // Auto-select Concierge tab for Sitges Demo user
            if (session.user.id === '845fd047-a093-4b9f-b8a9-45526f9c3124') {
                setActiveTab('concierge');
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

    const handleGenerateDraft = async (leadId: string) => {
        setIsGenerating(true);
        setIsModalOpen(true);
        setDraftContent('');

        try {
            const response = await fetch('/api/leads/generate-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });

            if (!response.ok) throw new Error('Failed to generate draft');

            const data = await response.json();
            setDraftContent(data.draft);
        } catch (error) {
            console.error('Error:', error);
            setDraftContent('Hubo un error al generar la propuesta. Por favor, inténtalo de nuevo.');
        } finally {
            setIsGenerating(false);
        }
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
    const totalLeadsGenerated = metrics.reduce((acc, curr) => acc + (curr.leads_generated || 0), 0);

    // Cálculo de Días de Vida Recuperados (Basado en jornada laboral de 8h)
    const hoursSaved = totalMinutesSaved / 60;
    const daysSaved = (hoursSaved / 8).toFixed(1);

    // ROI Real (Coste por hora de un humano vs automatización)
    // Usamos 50€/hora como estándar de ahorro operativo
    const roiEuros = Math.floor(hoursSaved * 50).toLocaleString('es-ES');

    // Estimación de atención fuera de horario (simulado basado en ejecuciones)
    const afterHours = Math.floor(totalAutomations * 0.45);
    const potentialRevenue = Math.floor(totalLeadsGenerated * 150).toLocaleString('es-ES');

    if (!profile) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Bienvenido a <span className="text-[#00FF94]">HecTechAi</span>
                        </h1>
                        <p className="text-gray-400">Dashboard de Impacto HecTechAi</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {profile.is_admin && profile.id === '845fd047-a093-4b9f-b8a9-45526f9c3124' && (
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
                    {(profile.is_admin || profile.id === '845fd047-a093-4b9f-b8a9-45526f9c3124') && (
                        <button
                            onClick={() => setActiveTab('concierge')}
                            className={`text-sm font-medium transition-colors ${activeTab === 'concierge' ? 'text-[#00FF94] border-b-2 border-[#00FF94] pb-4 -mb-4.5' : 'text-gray-500 hover:text-white'}`}
                        >
                            Sitges Concierge (Live)
                        </button>
                    )}
                    {profile.is_admin && (
                        <button
                            onClick={() => setActiveTab('leads')}
                            className={`text-sm font-medium transition-colors ${activeTab === 'leads' ? 'text-[#00FF94] border-b-2 border-[#00FF94] pb-4 -mb-4.5' : 'text-gray-500 hover:text-white'}`}
                        >
                            Radar de Leads (CRM)
                        </button>
                    )}
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
                                <StatCard title="Margen Operativo Ganado" value={roiEuros} icon={BarChart3} unit="€ ahorrados" color="#00FF94" />
                                <StatCard title="Pipeline de Negocio" value={totalLeadsGenerated} icon={UserCheck} unit="oportunidades" color="#F472B6" />
                                <StatCard title="Días de Vida Recuperados" value={daysSaved} icon={Clock} unit="días libres" color="#00C2FF" />
                                <StatCard title="Atención 24/7 (Always ON)" value={afterHours} icon={Moon} unit="fuera de horario" color="#A855F7" />
                                <StatCard title="Decisiones IA Tomadas" value={totalAutomations} icon={Activity} unit="ejecuciones" color="#00FF94" />
                                <StatCard title="Velocidad de Respuesta" value="< 5" icon={Zap} unit="segundos" color="#FACC15" />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 border-l-[#00FF94] border-l-4">
                                    <h3 className="text-xl font-bold mb-4">Análisis de Valor HecTechAi</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[#00FF94] font-bold text-lg">Paz Mental y Libertad</p>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                Tu sistema está delegando tareas críticas a la IA, permitiéndote recuperar tiempo para lo que realmente importa. No solo ahorras dinero, compras tranquilidad sabiendo que tu negocio nunca duerme.
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                            <p className="text-white font-medium flex items-center gap-2 text-sm uppercase tracking-wider">
                                                <ShieldCheck size={16} className="text-[#00FF94]" />
                                                Salud del Ecosistema: <span className="text-[#00FF94]">100% Operativo</span>
                                            </p>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse"></div>
                                                <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse delay-75"></div>
                                                <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse delay-150"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 border-l-purple-500 border-l-4">
                                    <h3 className="text-xl font-bold mb-4">Impacto en Facturación</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-gray-400 text-sm">Valor de Oportunidad Detectado</p>
                                            <p className="text-2xl font-bold text-white">{potentialRevenue}€</p>
                                        </div>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Basado en los leads cualificados y el ticket medio de tu sector. Tu automatización no solo ahorra costes, detecta ingresos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                ) : activeTab === 'leads' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="text-[#00FF94]" />
                                Pipeline de Captación (Radar)
                            </h3>
                            <div className="text-xs text-gray-400">
                                {leads.length} leads encontrados
                            </div>
                        </div>

                        <div className="glass-card overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="px-6 py-4 font-medium">Nombre / Negocio</th>
                                            <th className="px-6 py-4 font-medium">Estado</th>
                                            <th className="px-6 py-4 font-medium">Deuda Tech</th>
                                            <th className="px-6 py-4 font-medium">Chatbot</th>
                                            <th className="px-6 py-4 font-medium">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {leads.length > 0 ? (
                                            leads.map((lead) => (
                                                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white">{lead.name}</div>
                                                        <div className="text-xs text-gray-500">{lead.email || lead.website || 'Sin datos'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${lead.status === 'RADAR_LEAD' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                                                            lead.status === 'CONTACTED' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                                                'bg-green-500/10 text-green-400 border border-green-500/30'
                                                            }`}>
                                                            {lead.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs ${lead.tech_debt === 'ALTA' ? 'text-red-400' : 'text-gray-400'}`}>
                                                            {lead.tech_debt || 'Desconocida'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {lead.has_chatbot ? (
                                                            <CheckCircle2 size={16} className="text-[#00FF94]" />
                                                        ) : (
                                                            <AlertCircle size={16} className="text-red-400" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            disabled={isGenerating}
                                                            onClick={() => handleGenerateDraft(lead.id)}
                                                            className="p-2 hover:bg-[#00FF94]/10 rounded-lg transition-colors group disabled:opacity-50"
                                                            title="Generar Propuesta con IA"
                                                        >
                                                            <Zap size={16} className={`${isGenerating ? 'animate-pulse text-yellow-400' : 'text-gray-500 group-hover:text-[#00FF94]'}`} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                                    No se han encontrado leads en el Radar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'concierge' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* ROI Header for Sitges Concierge */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="glass-card p-6 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/20">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Horas de Gestión Ahorradas</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{(conciergeLogs.length * 5 / 60).toFixed(1)}</span>
                                    <span className="text-sm text-[#00FF94]">horas</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">Basado en 5 min/interacción</p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Coste Operativo Evitado</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{(conciergeLogs.length * 5 / 60 * 15).toFixed(0)}€</span>
                                    <span className="text-sm text-purple-400">ahorrados</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">Cálculo estimado (15€/hora)</p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl bg-[#00FF94]/5 border border-[#00FF94]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Clock size={48} className="text-[#00FF94]" />
                                </div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Disponibilidad 24/7</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-[#00FF94]">100%</span>
                                    <span className="text-sm text-gray-400">Always ON</span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">Sin costes de nocturnidad</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-[#00FF94]" />
                                Live Concierge Interactions
                                <span className="flex items-center gap-2 px-3 py-1 bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94] rounded-full text-[10px] font-bold uppercase tracking-wider ml-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></span>
                                    Live Stream
                                </span>
                            </h3>
                            <button
                                onClick={() => router.refresh()}
                                className="text-xs text-gray-400 hover:text-[#00FF94] transition-colors flex items-center gap-1"
                            >
                                <Zap size={14} /> Refrescar logs
                            </button>
                        </div>

                        <div className="glass-card overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="px-6 py-4 font-medium">Guest (Teléfono)</th>
                                            <th className="px-6 py-4 font-medium">Mensaje del Huésped</th>
                                            <th className="px-6 py-4 font-medium">Respuesta del Concierge IA</th>
                                            <th className="px-6 py-4 font-medium">Timestamp</th>
                                            <th className="px-6 py-4 font-medium text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {conciergeLogs.length > 0 ? (
                                            conciergeLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-white font-medium">
                                                            <Phone size={14} className="text-gray-500" />
                                                            {log.phone_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <p className="text-sm text-gray-300 line-clamp-2 italic">
                                                            "{log.user_message}"
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-md">
                                                        <p className="text-sm text-[#00FF94]/80 line-clamp-3">
                                                            {log.ai_response}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500">
                                                        {new Date(log.timestamp).toLocaleString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${log.status === 'success'
                                                            ? 'bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                            }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                                    No hay interacciones registradas todavía. El concierge está listo para hablar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
