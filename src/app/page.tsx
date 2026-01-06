'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Bot,
  Cpu,
  Zap,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Play,
  Database,
  Globe,
  Sparkles,
  Loader2,
  AlertCircle,
  BarChart3,
  PenTool,
  Search,
  Instagram,
  Mail,
  Plus,
  Minus,
  Users,
  Rocket,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { ContactForm } from './ContactForm';
import { generateAuditAction } from './actions';
import { VisualAudit } from '../components/VisualAudit';

// --- COMPONENTS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beneficios', href: '#beneficios' },
    { name: 'Demos', href: '#demos' },
    { name: 'Auditoría IA ✨', href: '#auditoria-ia' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Sobre mí', href: '#sobre-nosotros' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/logo.png"
            alt="HecTechAi Logo"
            width={56}
            height={56}
            className="object-contain"
            style={{ mixBlendMode: 'screen' }}
          />
          <div className="hidden md:flex items-center gap-2 font-display font-bold text-3xl tracking-tighter text-white">
            <span>Hec<span className="text-[#00FF94]">TechAi</span></span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {link.name}
            </a>
          ))}
          <a href="#contacto" className="bg-[#00FF94] text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#00cc76] transition-all glow-effect">
            Agendar Consultoría
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#050505] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#00FF94] font-medium text-lg">
              {link.name}
            </a>
          ))}
          <a href="#contacto" onClick={() => setIsOpen(false)} className="bg-[#00FF94] text-center text-black w-full py-3 rounded-lg font-bold mt-2">
            Agendar Consultoría
          </a>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 circuit-bg z-0 pointer-events-none opacity-40"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF94] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00C2FF] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00FF94]/30 bg-[#00FF94]/5 text-[#00FF94] text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse"></span>
            El futuro de tu negocio
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white">
            Tu negocio, funcionando en <br className="hidden lg:block" />
            <span className="text-gradient">piloto automático</span>.
          </h1>

          <p className="text-gray-400 text-lg lg:text-xl max-w-lg leading-relaxed">
            Ayudamos a pequeños negocios a ahorrar horas de trabajo y vender 24/7 mediante Chatbots inteligentes y Automatización de procesos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="#contacto" className="bg-[#00FF94] text-black px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform duration-200 glow-effect flex items-center justify-center gap-2">
              Agendar Consultoría Gratis
              <ArrowRight size={20} />
            </a>
            <a href="#demos" className="px-8 py-4 rounded-lg font-bold text-white border border-white/20 hover:border-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 group">
              <Play size={18} className="group-hover:text-[#00FF94] transition-colors" />
              Ver Demos en vivo
            </a>
          </div>

          {/* Métricas de Impacto */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="glass-card p-4 rounded-xl text-center animate-scale-in hover:animate-pulse-glow transition-all" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl font-bold text-[#00FF94] mb-1">+15h</div>
              <div className="text-xs text-gray-400">Ahorradas/semana</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center animate-scale-in hover:animate-pulse-glow transition-all" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-[#00C2FF] mb-1">40%</div>
              <div className="text-xs text-gray-400">Más conversiones</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center animate-scale-in hover:animate-pulse-glow transition-all" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-purple-400 mb-1">24/7</div>
              <div className="text-xs text-gray-400">Disponibilidad</div>
            </div>
          </div>
        </div>

        <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center animate-float">
          <div className="relative w-full h-full max-w-md">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-black border border-[#00FF94] rounded-2xl z-20 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(0,255,148,0.4)]">
              <Bot size={48} className="text-[#00FF94]" />
            </div>

            <div className="absolute top-10 left-0 p-4 glass-card rounded-xl z-10 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg text-[#00FF94]"><MessageSquare size={16} /></div>
                <div>
                  <div className="text-xs text-gray-400">Ventas 24/7</div>
                  <div className="text-sm font-bold text-white">Respuesta Automática</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 right-0 p-4 glass-card rounded-xl z-10 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Calendar size={16} /></div>
                <div>
                  <div className="text-xs text-gray-400">Agendamiento</div>
                  <div className="text-sm font-bold text-white">Cita Confirmada</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 left-10 p-4 glass-card rounded-xl z-10 animate-bounce" style={{ animationDuration: '5s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Database size={16} /></div>
                <div>
                  <div className="text-xs text-gray-400">CRM</div>
                  <div className="text-sm font-bold text-white">Datos Sincronizados</div>
                </div>
              </div>
            </div>

            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M50 50 L20 20" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
              <path d="M50 50 L80 80" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
              <path d="M50 50 L30 80" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  const benefits = [
    {
      icon: <Clock size={32} className="text-[#00FF94]" />,
      title: "Atención 24/7",
      desc: "Tu negocio nunca duerme. Responde a leads al instante, incluso fuera de horario, capturando cada oportunidad.",
    },
    {
      icon: <Target size={32} className="text-[#00C2FF]" />,
      title: "Operaciones Cero Errores",
      desc: "Elimina el error humano. Automatiza desde el agendamiento hasta la facturación con precisión milimétrica.",
    },
    {
      icon: <TrendingUp size={32} className="text-purple-400" />,
      title: "Escalabilidad Exponencial",
      desc: "Crece sin límites. Maneja 10x más clientes sin necesidad de aumentar tu plantilla o infraestructura.",
    },
    {
      icon: <Zap size={32} className="text-[#FFE600]" />,
      title: "Fidelización Inteligente",
      desc: "Sistemas que aprenden de tus clientes para ofrecer seguimiento post-venta que garantiza la recurrencia.",
    },
    {
      icon: <Globe size={32} className="text-blue-400" />,
      title: "Datos en Tiempo Real",
      desc: "Toma decisiones basadas en evidencias con dashboards que muestran el rendimiento de tu embudo de ventas.",
    },
    {
      icon: <CheckCircle2 size={32} className="text-green-400" />,
      title: "Reducción de Costes",
      desc: "Reduce hasta un 70% los costes operativos delegando tareas repetitivas a sistemas inteligentes.",
    },
  ];

  return (
    <section id="beneficios" className="py-24 bg-[#0A0A0A] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">¿Por qué tu negocio necesita <span className="text-gradient">IA hoy</span>?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">La tecnología ya no es solo para grandes empresas. Nivelamos el campo de juego para ti.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((item, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const VideoDemo = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-black">
      <div className="absolute inset-0 circuit-bg opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Mira cómo <span className="text-gradient">transformamos negocios</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Un vistazo rápido a cómo la IA puede automatizar tu negocio en minutos, no meses.
          </p>
        </div>

        <div className="relative group cursor-pointer" onClick={() => setShowVideo(true)}>
          <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF94]/20 to-[#00C2FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#00FF94] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_50px_rgba(0,255,148,0.5)]">
                <Play size={40} className="text-black ml-1" fill="black" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-2xl font-bold mb-2">Ver Demo en Acción</div>
                <div className="text-gray-300 text-sm">2 minutos que cambiarán tu negocio</div>
              </div>
            </div>
          </div>
        </div>

        {showVideo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setShowVideo(false)}>
            <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowVideo(false)} className="absolute -top-12 right-0 text-white hover:text-[#00FF94] transition-colors">
                <X size={32} />
              </button>
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/20">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Demo HecTechAi"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};


const SmartAudit = () => {
  const [activeTab, setActiveTab] = useState<'strategic' | 'visual'>('strategic');
  const [business, setBusiness] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generateAudit = async () => {
    if (!business || !painPoint || !email) return;
    setLoading(true);
    setResult('');

    try {
      const response = await generateAuditAction(business, painPoint, email);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setResult(response.error || "⚠️ Error desconocido.");
      }
    } catch (e) {
      setResult("⚠️ Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="auditoria-ia" className="py-24 relative overflow-hidden bg-black/50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF94] rounded-full blur-[120px] opacity-5 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Nuestra IA audita tu <br />
            <span className="text-gradient">Negocio en Tiempo Real</span>
          </h2>
          <p className="text-gray-400">
            Selecciona el tipo de análisis que necesitas para tu negocio.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('strategic')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'strategic' ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <Sparkles size={18} />
            Plan Estratégico
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'visual' ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <Camera size={18} />
            Análisis Visual
          </button>
        </div>

        <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl min-h-[400px]">
          {activeTab === 'strategic' ? (
            <div className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">¿Qué tipo de negocio tienes?</label>
                  <input
                    type="text"
                    placeholder="Ej. Clínica Dental, Inmobiliaria..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-colors"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">¿Cuál es tu mayor dolor de cabeza?</label>
                  <input
                    type="text"
                    placeholder="Ej. No respondo WhatsApps a tiempo..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-colors"
                    value={painPoint}
                    onChange={(e) => setPainPoint(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Tu mejor email (para enviarte el plan completo)</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={generateAudit}
                disabled={loading || !business || !painPoint || !email}
                className="w-full bg-[#00FF94] text-black font-bold py-4 rounded-xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-effect mb-8 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Generando Plan...</> : <><Sparkles size={20} /> Generar mi Plan IA Gratis</>}
              </button>

              {result && (
                <div className="p-6 bg-white/5 border border-[#00FF94]/20 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-[#00FF94] font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-sm">
                    <Sparkles size={16} /> Tu Estrategia Personalizada
                  </h4>
                  <p className="text-gray-300 leading-relaxed italic whitespace-pre-line">
                    {result}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <VisualAudit />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const DemoShowcase = () => {
  const [activeTab, setActiveTab] = useState<'realestate' | 'ecommerce' | 'health' | 'resto'>('realestate');

  const tabs = [
    { id: 'realestate', label: 'Inmobiliaria' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'health', label: 'Clínicas/Salud' },
    { id: 'resto', label: 'Restaurantes' },
  ] as const;

  const chatData = {
    realestate: [
      { from: 'bot', text: '¡Hola! Soy el asistente inteligente de HecTech Real Estate. 🏠 ¿En qué puedo ayudarte hoy?' },
      { from: 'user', text: 'Hola, busco un piso de 2 habitaciones en el centro.' },
      { from: 'bot', text: 'Perfecto. Tengo 3 opciones exclusivas que no están en portales todavía. ¿Cuál es tu presupuesto mensual máximo?' },
      { from: 'user', text: 'Unos 1200€ al mes.' },
      { from: 'bot', text: 'Entendido. El de la calle Mayor encaja perfecto: 2 hab, terraza y 1150€. ¿Te gustaría ver un tour virtual o prefieres agendar una visita presencial para este viernes?' },
      { from: 'user', text: 'Prefiero visita presencial el viernes.' },
      { from: 'bot', text: 'Excelente elección. Tengo libre a las 10:30 o a las 17:00. ¿Cuál te viene mejor?' },
      { from: 'bot', text: 'Una vez confirmes, te enviaré la ubicación exacta por WhatsApp automáticamente. 📍' },
    ],
    ecommerce: [
      { from: 'bot', text: '👋 ¡Hola! Soy el asistente de compras de tu tienda favorita. Veo que te interesan las Zapatillas Pro-Run.' },
      { from: 'user', text: 'Sí, pero dudo con la talla. Suelo usar 42 o 43.' },
      { from: 'bot', text: 'Te entiendo. Según nuestra guía de tallas basada en IA, para este modelo la 42 suele quedar un poco estrecha. Te recomiendo la 43.' },
      { from: 'bot', text: 'Por cierto, ¡tengo una sorpresa! Como es tu primera consulta, si compras en los próximos 15 minutos, puedo aplicarte un 15% de descuento extra. 🎁' },
      { from: 'user', text: '¡Genial! ¿Cómo lo aplico?' },
      { from: 'bot', text: 'Ya lo he activado para tu sesión. Solo añade al carrito y verás el precio final reducido antes de pagar. ¿Puedo ayudarte con algo más?' },
    ],
    health: [
      { from: 'bot', text: '🏥 Clínica HecTechAi. ¿Necesitas agendar una cita o tienes alguna duda sobre nuestros tratamientos?' },
      { from: 'user', text: 'Quería info sobre el blanqueamiento dental.' },
      { from: 'bot', text: 'Es uno de nuestros tratamientos más populares. Usamos tecnología láser de última generación para resultados en una sola sesión.' },
      { from: 'bot', text: 'Para darte un presupuesto exacto y ver si eres apto, necesitamos una valoración gratuita de 10 minutos. ¿Te gustaría venir esta semana?' },
      { from: 'user', text: 'Vale, ¿qué días tenéis libres?' },
      { from: 'bot', text: 'Mañana jueves a las 16:00 o el viernes a las 09:30. ¿Cuál prefieres asignar a tu nombre?' },
      { from: 'user', text: 'Viernes a las 9:30.' },
      { from: 'bot', text: '¡Hecho! Te acabo de enviar un recordatorio con las indicaciones previas para la cita. ¡Nos vemos pronto! ✨' },
    ],
    resto: [
      { from: 'bot', text: '🍔 ¡Bienvenido a GastroTech! ¿Buscas mesa para hoy o prefieres pedir para llevar con un 10% de descuento?' },
      { from: 'user', text: 'Mesa para un grupo de 6 personas.' },
      { from: 'bot', text: '¡Claro! ¿Para qué hora os gustaría venir?' },
      { from: 'user', text: 'A las 21:30.' },
      { from: 'bot', text: 'Para grupos de más de 4 personas, solemos recomendar el Salón VIP para mayor comodidad. ¿Te parece bien que os reserve allí?' },
      { from: 'user', text: 'Sí, perfecto.' },
      { from: 'bot', text: '¡Genial! Reserva confirmada para 6 personas a las 21:30. ✅' },
      { from: 'bot', text: 'Como sugerencia del chef, hoy tenemos pulpo a la brasa fuera de carta. ¡Os guardo una ración si queréis probarlo! ¿O prefieres ver la carta completa ahora?' },
    ],
  };

  return (
    <section id="demos" className="py-24 relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00FF94]/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          <div className="flex-1 w-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Mira lo que la IA puede <br />
              <span className="text-gradient">hacer por tu sector</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Selecciona tu industria y observa cómo un agente de IA maneja una conversación real.
            </p>

            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
              <div className="bg-[#111] p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00FF94] to-blue-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <Bot size={20} className="text-[#00FF94]" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white font-display">Asistente HecTechAi</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-500">En línea</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 h-[400px] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {chatData[activeTab].map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-float`} style={{ animationDuration: '0.5s', animationFillMode: 'both', animationDelay: `${idx * 0.5}s`, animationName: 'slideIn' }}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.from === 'user'
                      ? 'bg-[#00C2FF]/20 text-white rounded-tr-sm border border-[#00C2FF]/20'
                      : 'bg-[#222] text-gray-200 rounded-tl-sm border border-white/5'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#111] border-t border-white/5 flex gap-3">
                <div className="flex-1 bg-white/5 rounded-full h-10 px-4 flex items-center text-gray-500 text-sm">
                  Escribe un mensaje...
                </div>
                <div className="w-10 h-10 bg-[#00FF94] rounded-full flex items-center justify-center text-black">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section >
  );
};

const Services = () => {
  return (
    <section id="servicios" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Nuestros Servicios</h2>
          <p className="text-gray-400">Soluciones técnicas simplificadas para dueños de negocios.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

          <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <MessageSquare size={120} className="text-[#00FF94]" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 bg-[#00FF94] rounded-lg flex items-center justify-center mb-6 text-black">
                <Bot size={24} />
              </div>
              <h3 className="text-3xl font-bold mb-2 text-white">Chatbots Inteligentes</h3>
              <p className="text-gray-400 max-w-2xl mb-4">
                Desarrollamos asistentes virtuales con lenguaje natural que entienden el contexto de tu negocio. No son simples árboles de decisión; son agentes que venden por ti.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block">
                <p className="text-xs text-[#00FF94] font-bold uppercase tracking-wider mb-1">Ejemplo:</p>
                <p className="text-sm text-gray-300">Agente inmobiliario que califica leads, responde dudas sobre la zona y reserva visitas en tu Calendar 24/7 sin intervención humana.</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#00C2FF] rounded-full blur-[60px] opacity-20"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 bg-[#00C2FF] rounded-lg flex items-center justify-center mb-6 text-white">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Automatización</h3>
              <p className="text-gray-400 text-sm mb-4">
                Conectamos tus herramientas (n8n, Make) para eliminar tareas repetitivas y silos de información.
              </p>
              <div className="mt-auto bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] text-[#00C2FF] font-bold uppercase tracking-wider mb-1">Ejemplo:</p>
                <p className="text-xs text-gray-300">Sincronización de pedidos con tu CRM y software contable, notificando al equipo por Slack al instante.</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group border-white/5 hover:border-[#00FF94]/30 transition-colors">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-[#00FF94] group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Sistemas CRM</h3>
              <p className="text-gray-400 text-sm mb-4">Centralizamos tus datos para que cada interacción sea personalizada.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[10px] text-[#00FF94] font-bold uppercase tracking-wider mb-1">Ejemplo:</p>
              <p className="text-xs text-gray-300">Segmentación de clientes para campañas de WhatsApp según historial de compra.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group border-white/5 hover:border-purple-500/30 transition-colors">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Dashboards de Datos</h3>
              <p className="text-gray-400 text-sm mb-4">Visualiza el rendimiento de tu negocio y el ROI de tus automatizaciones en tiempo real.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Ejemplo:</p>
              <p className="text-xs text-gray-300">Panel interactivo que muestra leads diarios, tasa de conversión y tiempo humano ahorrado al mes.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group border-white/5 hover:border-orange-400/30 transition-colors">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                <PenTool size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Contenido con IA</h3>
              <p className="text-gray-400 text-sm mb-4">Sistemas de generación de contenido multicanal manteniendo tu tono de marca.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">Ejemplo:</p>
              <p className="text-xs text-gray-300">Creación automática de posts para redes sociales a partir de un simple título o idea de producto.</p>
            </div>
          </div>

          <div className="md:col-span-3 glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="flex-1">
              <div className="w-12 h-12 bg-[#FFE600] rounded-lg flex items-center justify-center mb-6 text-black group-hover:rotate-12 transition-transform">
                <Search size={24} />
              </div>
              <h3 className="text-3xl font-bold mb-2 text-white">Auditoría de Procesos IA</h3>
              <p className="text-gray-400 max-w-2xl mb-4">
                Analizamos tu operativa actual para identificar cuellos de botella y detectar dónde la IA tendrá el mayor impacto financiero inmediato.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block">
                <p className="text-xs text-[#FFE600] font-bold uppercase tracking-wider mb-1">Ejemplo:</p>
                <p className="text-sm text-gray-300">Mapeo de flujos de trabajo actuales y proyección de ahorro en costes operativos tras la implementación de agentes IA.</p>
              </div>
            </div>
            <div className="shrink-0">
              <a href="#contacto" className="inline-flex items-center gap-2 bg-primary text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-all">
                Optimizar mi negocio
                <ArrowRight size={20} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    { title: "Auditoría", desc: "Analizamos tu negocio para identificar oportunidades.", icon: <CheckCircle2 /> },
    { title: "Implementación", desc: "Configuramos los bots y automatizaciones a medida.", icon: <Cpu /> },
    { title: "Optimización", desc: "Monitoreamos resultados y ajustamos para maximizar conversiones.", icon: <TrendingUp /> },
  ];

  return (
    <section id="proceso" className="py-24 relative bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Tu transformación digital en <span className="text-[#00FF94]">3 pasos</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[#00FF94]/30 to-transparent z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0A0A0A] border border-[#00FF94] rounded-full flex items-center justify-center text-[#00FF94] text-xl font-bold mb-6 shadow-[0_0_20px_rgba(0,255,148,0.2)]">
                {step.icon}
              </div>
              <div className="text-8xl font-black text-white/[0.05] absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                {index + 1}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-gray-400 max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutUs = () => {
  return (
    <section id="sobre-nosotros" className="py-24 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#00FF94]/10 rounded-full blur-[100px]"></div>
            <div className="relative glass-card p-1 rounded-3xl overflow-hidden border border-white/10 group">
              <div className="aspect-[4/5] relative bg-[#111] rounded-[22px] overflow-hidden">
                {/* User can replace this with their actual photo */}
                <div className="absolute inset-0 flex items-center justify-center text-[#00FF94]/20">
                  <Users size={120} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-[#00FF94] font-bold text-sm tracking-widest uppercase mb-1">Fundador</p>
                  <h3 className="text-3xl font-bold text-white">Hector Barbera Sanchez</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                Impulsando el futuro del <span className="text-gradient">negocio local</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                En <strong>HecTechAi</strong>, no solo implementamos tecnología; devolvemos el tiempo a quienes hacen que el mundo se mueva. Creé este proyecto porque vi cómo muchos dueños de negocios pasaban el fin de semana respondiendo emails en lugar de descansar. Mi misión es que la IA haga el trabajo aburrido por ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-[#00FF94]/30 transition-colors">
                <div className="w-10 h-10 bg-[#00FF94]/10 rounded-lg flex items-center justify-center text-[#00FF94] mb-4">
                  <Rocket size={20} />
                </div>
                <h4 className="text-white font-bold mb-2">Misión</h4>
                <p className="text-sm text-gray-500">Transformar la operativa manual en sistemas autónomos de alto rendimiento.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-[#00FF94]/30 transition-colors">
                <div className="w-10 h-10 bg-[#00FF94]/10 rounded-lg flex items-center justify-center text-[#00FF94] mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-white font-bold mb-2">Compromiso</h4>
                <p className="text-sm text-gray-500">Soluciones éticas, seguras y diseñadas para durar a largo plazo.</p>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-[#00FF94]">
              <p className="text-gray-300 italic italic leading-relaxed">
                "Mi misión es que la IA haga el trabajo aburrido para que tú te dediques a lo que realmente importa: hacer crecer tu empresa y disfrutar de tu tiempo."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ROICalculator = () => {
  const [employees, setEmployees] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(20);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);

  const monthlyLoss = Math.round(employees * hourlyRate * hoursPerWeek * 4.33);
  const annualLoss = monthlyLoss * 12;
  const potentialSavings = Math.round(monthlyLoss * 0.7);

  return (
    <section id="roi-calculator" className="py-24 relative overflow-hidden bg-[#0A0A0A]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF94]/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Calcula el coste de <span className="text-gradient">no automatizar</span></h2>
            <p className="text-gray-400 text-lg mb-12">
              Muchas empresas no son conscientes del capital que pierden cada mes en tareas que una IA podría hacer por una fracción del coste. Ajusta los valores y descubre tu potencial de ahorro.
            </p>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <label className="font-medium">Nº de empleados gestionando tareas manuales</label>
                  <span className="text-[#00FF94] font-bold text-xl">{employees}</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <label className="font-medium">Coste hora promedio (Sueldo + Impuestos)</label>
                  <span className="text-[#00FF94] font-bold text-xl">{hourlyRate}€/h</span>
                </div>
                <input
                  type="range" min="10" max="100" step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <label className="font-medium">Horas perdidas / semana por empleado</label>
                  <span className="text-[#00FF94] font-bold text-xl">{hoursPerWeek}h</span>
                </div>
                <input
                  type="range" min="2" max="40" step="2"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#00FF94]/10 blur-[100px] rounded-full"></div>
            <div className="relative glass-card p-10 rounded-3xl border border-white/10 shadow-2xl">
              <div className="space-y-8">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-1">Pérdida mensual estimada</p>
                  <div className="text-5xl md:text-7xl font-black text-white leading-none">
                    {monthlyLoss.toLocaleString()}€
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 w-full"></div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Fuga anual de capital</p>
                    <p className="text-2xl font-bold text-gray-300">{annualLoss.toLocaleString()}€</p>
                  </div>
                  <div>
                    <p className="text-[#00FF94] text-xs uppercase font-bold mb-1">Ahorro potencial IA</p>
                    <p className="text-2xl font-bold text-[#00FF94]">{potentialSavings.toLocaleString()}€/mes</p>
                  </div>
                </div>

                <div className="bg-[#00FF94]/10 p-6 rounded-2xl border border-[#00FF94]/20">
                  <p className="text-sm text-[#00FF94] leading-relaxed">
                    <strong>💡 Impacto Directo:</strong> Estás perdiendo aproximadamente el <strong>30% de tu productividad</strong> en tareas que HecTechAi puede automatizar hoy mismo.
                  </p>
                </div>

                <a href="#contacto" className="block w-full text-center bg-[#00FF94] text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform">
                  Detener esta fuga de capital ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Qué es exactamente la automatización con IA?",
      a: "Es el uso de modelos de lenguaje inteligentes (como GPT-4) e integraciones de software para realizar tareas repetitivas de forma autónoma. Desde responder clientes por WhatsApp hasta gestionar facturas y agendar citas sin intervención humana."
    },
    {
      q: "¿Es compatible con las herramientas que ya utilizo?",
      a: "Sí. Nos integramos con WhatsApp, Gmail, Google Calendar, Shopify, Instagram, CRM y más de 1.000 aplicaciones a través de plataformas líderes como n8n y Make."
    },
    {
      q: "¿Cuánto tiempo se tarda en ver resultados?",
      a: "Los resultados suelen ser inmediatos tras la implementación. El ahorro de tiempo se nota desde el primer día y el retorno de la inversión (ROI) suele completarse en menos de 3 meses."
    },
    {
      q: "¿Mi negocio es demasiado pequeño para la IA?",
      a: "Al contrario, la IA es el gran igualador. Permite que negocios locales y autónomos operen con la eficiencia de una gran corporación sin necesidad de contratar más personal."
    },
    {
      q: "¿Cómo garantizáis la seguridad de mis datos?",
      a: "La privacidad es nuestra prioridad. Usamos conexiones seguras y cifradas. Nunca utilizamos los datos de tu negocio para entrenar modelos de IA públicos externos."
    },
    {
      q: "¿Qué pasa si la IA se equivoca?",
      a: "Nuestras implementaciones incluyen filtros de seguridad y sistemas de supervisión. Además, siempre configuramos opciones para que un humano pueda intervenir fácilmente si la IA detecta una consulta compleja."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-[#050505]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Preguntas Frecuentes</h2>
          <p className="text-gray-400">Todo lo que necesitas saber para dar el paso hacia la automatización.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-bold text-white pr-8">{faq.q}</span>
                {openIndex === index ? (
                  <Minus size={20} className="text-[#00FF94] shrink-0" />
                ) : (
                  <Plus size={20} className="text-[#00FF94] shrink-0" />
                )}
              </button>

              <div className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#020202] pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">

        <div className="bg-gradient-to-b from-[#111] to-black border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden mb-24">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF94] to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">¿Listo para el futuro?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Deja de perder tiempo en tareas repetitivas. Empieza a escalar tu negocio hoy mismo.
            </p>
            <a href="#contacto" className="bg-[#00FF94] text-black text-xl font-bold px-12 py-5 rounded-lg hover:scale-105 transition-transform duration-200 shadow-[0_0_40px_rgba(0,255,148,0.4)] inline-block">
              Reserva tu Auditoría Gratis Ahora
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white">
            <Image
              src="/logo.png"
              alt="HecTechAi Logo"
              width={32}
              height={32}
              className="object-contain transition-all opacity-80 hover:opacity-100"
              style={{ mixBlendMode: 'screen' }}
            />
            <div className="hidden md:flex items-center gap-2 font-display">
              <span>Hec<span className="text-[#00FF94]">TechAi</span></span>
            </div>
          </div>

          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#sobre-nosotros" className="hover:text-white transition-colors">Sobre nosotros</a>
            <a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a>
            <a href="/legal" className="hover:text-white transition-colors">Aviso Legal</a>
          </div>

          <div className="flex gap-4 text-white">
            <a
              href="https://instagram.com/hectechai"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00FF94] hover:text-black transition-all cursor-pointer"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="mailto:hectechia@gmail.com"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00FF94] hover:text-black transition-all cursor-pointer"
              title="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="text-center text-gray-600 text-xs mt-12">
          © {new Date().getFullYear()} HecTechAi Automation Agency. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00FF94] selection:text-black">
      <Navbar />
      <Hero />
      <Benefits />
      <ROICalculator />
      <VideoDemo />
      <DemoShowcase />
      <SmartAudit />
      <Services />
      <Process />
      <AboutUs />
      <FAQ />

      {/* Contact Section reused from previous implementation but styled to match new theme */}
      <section id="contacto" className="w-full py-24 px-6 md:px-24 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto glass-card p-12 rounded-3xl border border-white/10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">¿Listo para automatizar tu negocio?</h2>
            <p className="text-gray-400">Hablemos de tu proyecto. Te contactaremos en menos de 24 horas.</p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
