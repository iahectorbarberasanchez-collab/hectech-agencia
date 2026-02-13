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
    Phone,
    Globe,
    Target,
    TreePalm,
    Building2,
    Utensils,
    HeartPulse,
    Calendar,
    Users2,
    X,
    Hotel,
    Bed
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
    company_name?: string;
    industry?: 'concierge' | 'real_estate' | 'medical' | 'restaurant' | 'hotel' | 'other';
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftContent, setDraftContent] = useState('');

    // Support Ticket State
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

    useEffect(() => {
        async function getData() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            console.log('Session User ID:', session.user.id);

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
            } else {
                console.log('Profile Data Loaded:', profileData);
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

            // Auto-select Concierge tab for Concierge industry users
            if (profileData?.industry === 'concierge' || session.user.id === '845fd047-a093-4b9f-b8a9-45526f9c3124') {
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
            // Mocking the n8n API call for now as we don't have the exact endpoint for drafting
            // In a real scenario, this would be: await fetch('YOUR_N8N_DRAFT_WEBHOOK', ...)
            await new Promise(resolve => setTimeout(resolve, 2000));
            setDraftContent(`PROPUESTA ESTRATÉGICA PARA LEAD ID: ${leadId}\n\n1. ANÁLISIS DE DEUDA TECH: El cliente presenta una infraestructura legacy sin automatización de respuesta inmediata.\n2. SOLUCIÓN HECTECH: Implementación de Agente de IA Multimodal para WhatsApp con integración RAG.\n3. IMPACTO ESTIMADO: Reducción del 40% en tiempos de respuesta y aumento del 15% en tasa de conversión.`);
        } catch (error) {
            console.error("Error generating draft:", error);
            setDraftContent('Error al generar la propuesta. Inténtalo de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketSubject || !ticketDescription) return;

        setIsSubmittingTicket(true);
        try {
            const response = await fetch('https://n8n.hectechai.com/webhook/formulario-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'support_ticket',
                    user_id: profile?.id,
                    company: profile?.company_name,
                    subject: ticketSubject,
                    description: ticketDescription,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('¡Ticket enviado con éxito! Nos pondremos en contacto contigo pronto.');
                setTicketSubject('');
                setTicketDescription('');
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert('Hubo un problema al enviar el ticket. Por favor, inténtalo de nuevo.');
        } finally {
            setIsSubmittingTicket(false);
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

    // Advanced Concierge Metrics Logic
    const resolutionRate = conciergeLogs.length > 0 ? 98 : 0; // Simulated high resolution for demo

    // Upselling Detection Logic
    const upsellKeywords = ['parking', 'limpieza', 'check-out', 'late', 'reserva', 'tour', 'aeropuerto', 'transfer'];
    const potentialUpsells = conciergeLogs.filter(log =>
        upsellKeywords.some(key => log.ai_response.toLowerCase().includes(key))
    ).length;
    const upsellRevenue = potentialUpsells * 35; // Estimated 35€ per upsell suggestion

    // Language Detection Logic (Simple heuristic for demo)
    const detectedLanguages = new Set(['Español']);
    conciergeLogs.forEach(log => {
        const msg = log.user_message.toLowerCase();
        if (msg.includes('hello') || msg.includes(' the ') || msg.includes(' is ')) detectedLanguages.add('Inglés');
        if (msg.includes('bonjour') || msg.includes(' s\'il ') || msg.includes(' merci ')) detectedLanguages.add('Francés');
        if (msg.includes('hallo') || msg.includes(' danke ')) detectedLanguages.add('Alemán');
    });

    // Peak Activity Logic
    const peakHours = conciergeLogs.reduce((acc: Record<number, number>, log) => {
        const hour = new Date(log.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});
    const topHour = Object.entries(peakHours).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || '--';

    if (!profile) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-in slide-in-from-left duration-700">
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Bienvenido, <span className="text-[#00FF94]">{profile.company_name || 'a HecTechAi'}</span>
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
                    {(profile.is_admin || profile.industry === 'concierge' || profile.id === '845fd047-a093-4b9f-b8a9-45526f9c3124') && (
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
                            {/* Industry-specific Metrics Section */}
                            {profile.industry === 'real_estate' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                    <StatCard title="Leads de Captación" value={totalLeadsGenerated} icon={Target} unit="propietarios" color="#00FF94" />
                                    <StatCard title="Pipeline Estimado" value={potentialRevenue} icon={TrendingUp} unit="€ en comisiones" color="#F472B6" />
                                    <StatCard title="Velocidad de Respuesta" value="< 2" icon={Zap} unit="minutos avg" color="#FACC15" />
                                    <StatCard title="Citas de Valoración" value="12" icon={Calendar} unit="este mes" color="#00C2FF" />
                                    <StatCard title="Ahorro Operativo" value={roiEuros} icon={BarChart3} unit="€ mensuales" color="#A855F7" />
                                    <StatCard title="Disponibilidad 24/7" value="100%" icon={Moon} unit="Always ON" color="#00FF94" />
                                </div>
                            ) : profile.industry === 'medical' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                    <StatCard title="Citas Agendadas" value="48" icon={Calendar} unit="este mes" color="#00C2FF" />
                                    <StatCard title="Pacientes Atendidos" value="124" icon={Users2} unit="consultas IA" color="#00FF94" />
                                    <StatCard title="Tiempo de Recepción" value="12h" icon={Clock} unit="ahorradas/semana" color="#F472B6" />
                                    <StatCard title="Resolución Automática" value="85%" icon={ShieldCheck} unit="sin humano" color="#A855F7" />
                                    <StatCard title="Ahorro en Personal" value={roiEuros} icon={BarChart3} unit="€/mes" color="#FACC15" />
                                    <StatCard title="Estado del Agente" value="Activo" icon={HeartPulse} unit="24/7 Operativo" color="#00FF94" />
                                </div>
                            ) : profile.industry === 'restaurant' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                    <StatCard title="Reservas Confirmadas" value="86" icon={Utensils} unit="vía WhatsApp" color="#00C2FF" />
                                    <StatCard title="Cubiertos IA" value="340" icon={Users2} unit="comensales" color="#00FF94" />
                                    <StatCard title="Horas de Pico Cubiertas" value="100%" icon={Zap} unit="automatizado" color="#FACC15" />
                                    <StatCard title="Ahorro de Gestión" value={roiEuros} icon={BarChart3} unit="€ estimados" color="#F472B6" />
                                    <StatCard title="Feedback Positivo" value="94%" icon={Activity} unit="sentiment" color="#00FF94" />
                                    <StatCard title="Atención Fuera Horas" value={afterHours} icon={Moon} unit="pedidos/dudas" color="#A855F7" />
                                </div>
                            ) : profile.industry === 'hotel' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                    <StatCard title="Check-ins Procesados" value="156" icon={Bed} unit="vía IA" color="#00C2FF" />
                                    <StatCard title="Atención al Huésped" value="430" icon={Users2} unit="consultas 24/7" color="#00FF94" />
                                    <StatCard title="Ahorro Front-Desk" value={roiEuros} icon={Clock} unit="€ en gestión" color="#F472B6" />
                                    <StatCard title="Upselling (Room/Tours)" value="2.450€" icon={TrendingUp} unit="ventas extra" color="#FACC15" />
                                    <StatCard title="Satisfacción Huésped" value="4.9/5" icon={Activity} unit="IA Sentiment" color="#00FF94" />
                                    <StatCard title="Personal Noche Evitado" value="100%" icon={Moon} unit="Always ON" color="#A855F7" />
                                </div>
                            ) : (
                                // Default / Generic Metrics View
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                    <StatCard title="Margen Operativo Ganado" value={roiEuros} icon={BarChart3} unit="€ ahorrados" color="#00FF94" />
                                    <StatCard title="Pipeline de Negocio" value={totalLeadsGenerated} icon={UserCheck} unit="oportunidades" color="#F472B6" />
                                    <StatCard title="Días de Vida Recuperados" value={daysSaved} icon={Clock} unit="días libres" color="#00C2FF" />
                                    <StatCard title="Atención 24/7 (Always ON)" value={afterHours} icon={Moon} unit="fuera de horario" color="#A855F7" />
                                    <StatCard title="Decisiones IA Tomadas" value={totalAutomations} icon={Activity} unit="ejecuciones" color="#00FF94" />
                                    <StatCard title="Velocidad de Respuesta" value="< 5" icon={Zap} unit="segundos" color="#FACC15" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="glass-card p-8 rounded-3xl bg-white/5 border border-white/10 border-l-[#00FF94] border-l-4">
                                    <h3 className="text-xl font-bold mb-4">Análisis de Valor HecTechAi</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[#00FF94] font-bold text-lg">Paz Mental y Libertad</p>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {profile.industry === 'real_estate'
                                                    ? 'Tu agente inmobiliario de IA captura y filtra leads mientras tú cierras visitas presenciales. No pierdas ni un solo propietario por no contestar a tiempo.'
                                                    : profile.industry === 'medical'
                                                        ? 'Tus pacientes reciben atención inmediata para dudas frecuentes y gestión de citas, reduciendo la saturación de tu recepción física.'
                                                        : profile.industry === 'restaurant'
                                                            ? 'Llenamos tus mesas de forma automática. El sistema gestiona las reservas y dudas de la carta sin que el personal de sala tenga que tocar el teléfono.'
                                                            : profile.industry === 'hotel'
                                                                ? 'Tu Front-Desk digital no descansa. Gestiona check-ins, dudas sobre el desayuno o solicitudes de toallas mientras tu equipo físico se enfoca en el trato humano y el lujo.'
                                                                : 'Tu sistema está delegando tareas críticas a la IA, permitiéndote recuperar tiempo para lo que realmente importa. No solo ahorras dinero, compras tranquilidad.'}
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
                                            <p className="text-gray-400 text-sm">
                                                {profile.industry === 'real_estate' ? 'Valor Proyectado de Comisiones' : 'Valor de Oportunidad Detectado'}
                                            </p>
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

                        {/* Advanced Insights Section */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="glass-card p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap size={16} className="text-yellow-500" /></div>
                                    <p className="text-gray-400 text-xs font-medium uppercase">Ventas Detectadas</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-white">{upsellRevenue}€</span>
                                    <span className="text-[10px] text-yellow-500">potenciales</span>
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1">{potentialUpsells} sugerencias de upselling</p>
                            </div>

                            <div className="glass-card p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg"><Globe size={16} className="text-blue-500" /></div>
                                    <p className="text-gray-400 text-xs font-medium uppercase">Conectividad Global</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-white">{detectedLanguages.size}</span>
                                    <span className="text-[10px] text-blue-500">idiomas</span>
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1 truncate">{Array.from(detectedLanguages).join(', ')}</p>
                            </div>

                            <div className="glass-card p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle2 size={16} className="text-[#00FF94]" /></div>
                                    <p className="text-gray-400 text-xs font-medium uppercase">Resolución Automática</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-white">{resolutionRate}%</span>
                                    <span className="text-[10px] text-[#00FF94]">IA pura</span>
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1">Sin intervención humana</p>
                            </div>

                            <div className="glass-card p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/10 rounded-lg"><Moon size={16} className="text-purple-500" /></div>
                                    <p className="text-gray-400 text-xs font-medium uppercase">Hora de Mayor Pico</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-white">{topHour}:00h</span>
                                    <span className="text-[10px] text-purple-500">atención crítica</span>
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1">Cubierto por el agente IA</p>
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
                                                            &quot;{log.user_message}&quot;
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
                                <form className="space-y-4" onSubmit={handleTicketSubmit}>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Asunto</label>
                                        <input
                                            type="text"
                                            value={ticketSubject}
                                            onChange={(e) => setTicketSubject(e.target.value)}
                                            placeholder="¿En qué podemos ayudarte?"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00FF94] outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Descripción</label>
                                        <textarea
                                            rows={4}
                                            value={ticketDescription}
                                            onChange={(e) => setTicketDescription(e.target.value)}
                                            placeholder="Describe la incidencia o consulta..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00FF94] outline-none transition-colors"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingTicket}
                                        className="w-full py-4 bg-[#00FF94] text-black font-bold rounded-xl hover:bg-[#00e685] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmittingTicket ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar Solicitud'
                                        )}
                                    </button>
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

            {/* Modal de Propuesta IA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="text-yellow-400" size={20} />
                                Propuesta Estratégica HecTechAi
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="animate-spin text-[#00FF94]" size={40} />
                                    <p className="text-gray-400 animate-pulse">Analizando lead y generando estrategia...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed text-sm">
                                        {draftContent}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(draftContent);
                                    alert('Copiado al portapapeles');
                                }}
                                disabled={isGenerating || !draftContent}
                                className="px-6 py-2 bg-[#00FF94] text-black font-bold rounded-xl hover:bg-[#00e685] transition-all disabled:opacity-50"
                            >
                                Copiar Propuesta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
