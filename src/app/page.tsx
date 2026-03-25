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
import { motion, useInView, useAnimation } from 'framer-motion';
import { ContactForm } from './ContactForm';
import { generateAuditAction } from './actions';
import { VisualAudit } from '../components/VisualAudit';
import { HeroChatbot } from '../components/HeroChatbot';
import { Testimonials } from '../components/Testimonials';

// --- ANIMATION HELPER ---
const Reveal = ({ children, width = "fit-content" }: { children: React.ReactNode, width?: "fit-content" | "100%" }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// --- FLOATING CTA ---
const CALENDAR_URL = 'https://calendar.app.google/iSajQABW249gqbvB9';

const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  if (!mounted) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingCTA = () => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setVisible(window.scrollY > 350);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 floating-cta">
      <MagneticButton>
        <a
          href={CALENDAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#00FF94] text-black px-8 py-4 rounded-full font-black text-lg shadow-[0_10px_40px_rgba(0,255,148,0.5)] hover:scale-105 transition-transform whitespace-nowrap badge-pulse"
        >
          <Calendar size={20} />
          Reservar mi auditoría gratuita
        </a>
      </MagneticButton>
    </div>
  );
};

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
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3 cursor-pointer group">
          <Image
            src="/logo.png"
            alt="HecTechAi Logo"
            width={56}
            height={56}
            className="object-contain group-hover:scale-110 transition-transform"
            style={{ mixBlendMode: 'screen' }}
          />
          <div className="flex items-center gap-2 font-display font-bold text-xl md:text-3xl tracking-tighter text-white group-hover:text-[#00FF94] transition-colors">
            <span>Hec<span className="text-[#00FF94]">TechAi</span></span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              {link.name}
            </a>
          ))}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/dashboard"
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-white/10 transition-all"
          >
            <Users size={16} />
            Acceso Clientes
          </motion.a>
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#00FF94] text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#00cc76] transition-all glow-effect badge-pulse"
          >
            <Calendar size={16} />
            Charla 15 min
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full bg-[#050505] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl z-50"
        >
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-[#00FF94] font-medium text-lg py-2 border-b border-white/5 last:border-0">
              {link.name}
            </a>
          ))}
          <a
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white w-full py-4 rounded-xl font-bold"
          >
            <Users size={20} />
            Acceso Clientes
          </a>
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 bg-[#00FF94] text-center text-black w-full py-4 rounded-xl font-bold mt-2 shadow-[0_0_20px_rgba(0,255,148,0.2)]"
          >
            <Calendar size={18} />
            Reservar charla de 15 min
          </a>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 circuit-bg z-0 pointer-events-none opacity-40"></div>

      {/* Luces de ambiente Premium */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-[#00FF94]/30 rounded-full blur-[180px] pointer-events-none"
      ></motion.div>
      <motion.div
        animate={{
          scale: [1.4, 1, 1.4],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -70, 0],
          y: [0, 60, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 -right-1/4 w-[700px] h-[700px] bg-[#00C2FF]/20 rounded-full blur-[200px] pointer-events-none"
      ></motion.div>

      <div className="absolute inset-0 noise-bg opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black leading-[1.0] tracking-tighter text-white font-display mb-8">
            No más <span className="text-gradient">ventas perdidas</span>.<br className="hidden sm:block" />
            Tu Agente de IA cierra clientes mientras escalas.
          </h1>

          <p className="text-gray-400 text-lg lg:text-2xl max-w-xl leading-relaxed mb-10">
            Auditamos tu operativa e implementamos IA de élite que elimina las horas perdidas y asegura que <span className="text-white font-bold">ningún lead se quede sin respuesta</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <MagneticButton>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00FF94] text-black px-10 py-5 rounded-2xl font-black text-xl transition-all glow-effect flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,255,148,0.3)]"
              >
                <Calendar size={24} />
                Agendar Auditoría Gratis
              </motion.a>
            </MagneticButton>
            <motion.a
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              href="#demos"
              className="px-8 py-4 rounded-xl font-bold text-white border border-white/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles size={18} className="group-hover:text-[#00FF94] transition-colors" />
              Ver demos en vivo
            </motion.a>
          </div>

          {/* Métricas de Impacto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            {[
              { val: "+15h", label: "Ahorradas/sem", color: "#00FF94" },
              { val: "40%", label: "Más conversiones", color: "#00C2FF" },
              { val: "24/7", label: "Disponibilidad", color: "#8B5CF6" },
              { val: "< 3 sem", label: "ROI positivo", color: "#FFE600" }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="glass-card p-4 rounded-xl text-center hover:border-primary/50 transition-colors"
              >
                <div className="text-xl font-bold mb-1" style={{ color: metric.color }}>{metric.val}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wider">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative flex items-center justify-center order-first lg:order-last mt-8 lg:mt-0"
        >
          <HeroChatbot />
        </motion.div>
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
    <section id="beneficios" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal width="100%">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-display">¿Por qué tu negocio necesita <span className="text-gradient">IA hoy</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">La tecnología ya no es solo para grandes empresas. Nivelamos el campo de juego para ti.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((item, index) => (
            <Reveal key={index} width="100%">
              <div className="premium-glass p-10 rounded-3xl group hover:-translate-y-2 transition-transform duration-500 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#00FF94]/10 transition-colors"></div>
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black mb-4 text-white font-display tracking-tight">{item.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


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
        <Reveal width="100%">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-display">
              Nuestra IA audita tu <br />
              <span className="text-gradient hover:glow-text transition-all duration-500">Negocio en Tiempo Real</span>
            </h2>
            <p className="text-gray-400">
              Selecciona el tipo de análisis que necesitas para tu negocio.
            </p>
          </div>
        </Reveal>

        <Reveal width="100%">
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('strategic')}
              className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'strategic' ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              <Sparkles size={18} />
              Plan Estratégico
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'visual' ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              <Camera size={18} />
              Análisis Visual
            </button>
          </div>
        </Reveal>

        <Reveal width="100%">
          <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl min-h-[400px] premium-border">
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
        </Reveal>
      </div>
    </section>
  );
};

const DemoShowcase = () => {
  const [activeTab, setActiveTab] = useState<'realestate' | 'health' | 'resto' | 'hotels' | 'vacation'>('realestate');

  const tabs = [
    { id: 'realestate', label: 'Inmobiliaria' },
    { id: 'health', label: 'Clínicas' },
    { id: 'resto', label: 'Restaurantes' },
    { id: 'hotels', label: 'Hoteles' },
    { id: 'vacation', label: 'Pisos Turísticos' },
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
    hotels: [
      { from: 'bot', text: '🏨 Bienvenido al Hotel HecTech Luxury. ¿Deseas consultar disponibilidad de habitaciones o necesitas asistencia con una reserva?' },
      { from: 'user', text: 'Busco habitación doble para el próximo fin de semana.' },
      { from: 'bot', text: 'Para las fechas del 2, 3 y 4 de mayo me quedan 2 Junior Suite con vistas al mar y una Habitación Premium. ¿Te gustaría ver fotos reales?' },
      { from: 'user', text: 'Sí, por favor.' },
      { from: 'bot', text: 'Aquí las tienes: [Enlace]. Además, si completas tu reserva por este chat, incluimos el desayuno buffet de cortesía. ☕ ¿Te reservo una?' },
      { from: 'user', text: '¡Sí, la Premium!' },
      { from: 'bot', text: 'Excelente elección. Ya he bloqueado la habitación. Te envío el enlace de pago seguro para confirmar en 2 minutos. 💳' },
    ],
    vacation: [
      { from: 'bot', text: '🏙️ ¡Hola! Soy el asistente de HecTech Vacation Rentals. ¿Buscas un piso para tus próximas vacaciones?' },
      { from: 'user', text: 'Sí, del 10 al 15 de julio en el centro.' },
      { from: 'bot', text: 'Para esas fechas tengo el "Loft Sol" (a 2 min de la plaza) y el "Ático Gran Vía". Ambos con check-in autónomo. ¿Cuál prefieres?' },
      { from: 'user', text: 'El Ático Gran Vía.' },
      { from: 'bot', text: 'Es espectacular, tiene terraza privada. El precio total es de 750€. ¿Quieres que te envíe el enlace de reserva directa por WhatsApp? 📱' },
      { from: 'user', text: 'Perfecto, envíamelo.' },
      { from: 'bot', text: 'Enviado. Tienes 30 minutos para completar la reserva antes de que el calendario se libere de nuevo. ¡Disfruta de tu estancia! 🔑' },
    ],
  };

  return (
    <section id="demos" className="py-24 relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00FF94]/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          <div className="flex-1 w-full">
            <Reveal width="100%">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
                Mira lo que la IA puede <br />
                <span className="text-gradient hover:glow-text transition-all duration-500">hacer por tu sector</span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Selecciona tu industria y observa cómo un agente de IA maneja una conversación real.
              </p>
            </Reveal>

            <Reveal width="100%">
              <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'realestate' | 'health' | 'resto' | 'hotels' | 'vacation')}
                    className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                      ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.4)]'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="flex-1 w-full">
            <Reveal width="100%">
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative premium-border">
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
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

const Services = () => {
  return (
    <section id="servicios" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal width="100%">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-display">Nuestros Servicios</h2>
            <p className="text-gray-400">Soluciones técnicas simplificadas para dueños de negocios.</p>
          </div>
        </Reveal>

        <div className="bento-grid">
          {/* Item 1: Large - Chatbots */}
          <div className="bento-item-large premium-glass rounded-3xl p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
              <MessageSquare size={180} className="text-[#00FF94]" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-16 h-16 bg-[#00FF94] rounded-2xl flex items-center justify-center mb-8 text-black shadow-[0_0_30px_rgba(0,255,148,0.5)]">
                <Bot size={32} />
              </div>
              <h3 className="text-4xl font-black mb-4 text-white font-display">Agentes de Ventas 24/7</h3>
              <p className="text-gray-400 text-lg max-w-xl mb-8 leading-relaxed">
                Desarrollamos asistentes con lenguaje natural que no solo responden; <span className="text-white font-bold">persuaden y cierran citas</span>. Sistemas que aprenden de cada interacción para convertir más.
              </p>
              <div className="mt-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-sm text-[#00FF94] font-bold uppercase tracking-widest mb-2">Caso de Éxito:</p>
                  <p className="text-gray-300">Inmobiliaria que triplicó sus visitas agendadas en 30 días delegando la calificación de leads a nuestra IA.</p>
                </div>
                <a href="#contacto" className="mt-8 inline-flex items-center gap-3 text-[#00FF94] font-bold text-lg hover:gap-5 transition-all group/link">
                  Quiero mi Agente <ArrowRight size={20} className="group-hover/link:translate-x-2 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Item 2: Wide - Automatización */}
          <div className="bento-item-wide premium-glass rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="w-20 h-20 bg-[#00C2FF] rounded-2xl flex items-center justify-center text-white shrink-0">
                <Zap size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">Full Automation Stack</h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Conectamos n8n, Make y tus CRMs para que las tareas repetitivas mueran definitivamente. Zero fricción operativa.
                </p>
              </div>
              <a href="#contacto" className="md:ml-auto bg-white/5 border border-white/10 p-4 rounded-full text-white hover:bg-[#00C2FF] hover:text-white transition-colors">
                <ArrowRight size={24} />
              </a>
            </div>
          </div>

          {/* Item 3: Tall - CRM */}
          <div className="bento-item-tall premium-glass rounded-3xl p-8 flex flex-col justify-between group border-white/5 hover:border-[#00FF94]/30 transition-colors">
            <div>
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-[#00FF94]">
                <Database size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Cerebros de Datos (RAG)</h3>
              <p className="text-gray-400 text-sm">Convertimos tus PDFs y base de conocimientos en un oráculo privado para tu equipo y clientes.</p>
            </div>
            <div className="mt-8 bg-black/40 rounded-xl p-4 border border-white/5">
              <div className="flex gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div className="text-[10px] font-mono text-gray-500">indexing doc_342.pdf...</div>
              <div className="text-[10px] font-mono text-[#00FF94]">knowledge base updated!</div>
            </div>
          </div>

          {/* Item 4: Small - Dashboards */}
          <div className="premium-glass rounded-3xl p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Metrics Hub</h3>
            <p className="text-gray-400 text-xs">ROI en tiempo real de cada euro ahorrado.</p>
          </div>

          {/* Item 5: Small - Content */}
          <div className="premium-glass rounded-3xl p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 text-orange-400">
              <PenTool size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Media AI</h3>
            <p className="text-gray-400 text-xs">Contenido masivo con voz de marca.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    { title: "Auditoría", desc: "Analizamos tu negocio en profundidad para identificar dónde pierdes más tiempo y dinero. En 48h tienes tu diagnóstico y plan de acción.", icon: <CheckCircle2 /> },
    { title: "Implementación", desc: "Configuramos los agentes IA y automatizaciones a medida de tu sector, sin tecnicismos y con resultados desde el día 1.", icon: <Cpu /> },
    { title: "Optimización", desc: "Monitoreamos resultados y ajustamos para maximizar conversiones. Si en las primeras 4 semanas no ves resultados, lo revisamos juntos sin coste adicional.", icon: <TrendingUp /> },
  ];

  return (
    <section id="proceso" className="py-24 relative bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal width="100%">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Así funciona nuestra metodología<br /><span className="text-[#00FF94]">sin tecnicismos</span></h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[#00FF94]/30 to-transparent z-0"></div>

          {steps.map((step, index) => (
            <Reveal key={index} width="100%">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#0A0A0A] border border-[#00FF94] rounded-full flex items-center justify-center text-[#00FF94] text-xl font-bold mb-6 shadow-[0_0_20px_rgba(0,255,148,0.2)]">
                  {step.icon}
                </div>
                <div className="text-8xl font-black text-white/[0.05] absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-gray-400 max-w-xs">{step.desc}</p>
              </div>
            </Reveal>
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
          <Reveal width="100%">
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#00FF94]/10 rounded-full blur-[100px]"></div>
              <div className="relative glass-card p-1 rounded-3xl overflow-hidden border border-white/10 group premium-border">
                <div className="aspect-[4/5] relative bg-[#111] rounded-[22px] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-[#00FF94]/20">
                    <Users size={120} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <p className="text-[#00FF94] font-bold text-sm tracking-widest uppercase mb-1">Fundador</p>
                    <h3 className="text-3xl font-bold text-white font-display">Hector Barbera Sanchez</h3>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="space-y-8">
            <Reveal width="100%">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight font-display">
                  Impulsando el futuro del <br />
                  <span className="text-gradient">negocio local</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  En <strong>HecTechAi</strong>, no solo implementamos tecnología; devolvemos el tiempo a quienes hacen que el mundo se mueva. Creé este proyecto porque vi cómo muchos dueños de negocios pasaban el fin de semana respondiendo emails en lugar de descansar. Mi misión es que la IA haga el trabajo aburrido por ti.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Reveal width="100%">
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-[#00FF94]/30 transition-colors h-full">
                  <div className="w-10 h-10 bg-[#00FF94]/10 rounded-lg flex items-center justify-center text-[#00FF94] mb-4">
                    <Rocket size={20} />
                  </div>
                  <h4 className="text-white font-bold mb-2">Misión</h4>
                  <p className="text-sm text-gray-500">Transformar la operativa manual en sistemas autónomos de alto rendimiento.</p>
                </div>
              </Reveal>
              <Reveal width="100%">
                <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-[#00FF94]/30 transition-colors h-full">
                  <div className="w-10 h-10 bg-[#00FF94]/10 rounded-lg flex items-center justify-center text-[#00FF94] mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-white font-bold mb-2">Compromiso</h4>
                  <p className="text-sm text-gray-500">Soluciones éticas, seguras y diseñadas para durar a largo plazo.</p>
                </div>
              </Reveal>
            </div>

            <Reveal width="100%">
              <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-[#00FF94]">
                <p className="text-gray-300 italic leading-relaxed">
                  &quot;Mi misión es que la IA haga el trabajo aburrido para que tú te dediques a lo que realmente importa: hacer crecer tu empresa y disfrutar de tu tiempo.&quot;
                </p>
              </div>
            </Reveal>
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
    <section id="roi-calculator" className="py-16 md:py-24 relative overflow-hidden bg-[#0A0A0A]">
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

          <Reveal width="100%">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00FF94]/10 blur-[100px] rounded-full"></div>
              <div className="relative glass-card p-10 rounded-3xl border border-white/10 shadow-2xl premium-border">
                <div className="space-y-8">
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-1">Pérdida mensual estimada</p>
                    <div className="text-5xl md:text-7xl font-black text-white leading-none">
                      {monthlyLoss.toLocaleString()}€
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/10 w-full"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Fuga anual de capital</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-300">{annualLoss.toLocaleString()}€</p>
                    </div>
                    <div>
                      <p className="text-[#00FF94] text-xs uppercase font-bold mb-1">Ahorro potencial IA</p>
                      <p className="text-xl md:text-2xl font-bold text-[#00FF94]">{potentialSavings.toLocaleString()}€/mes</p>
                    </div>
                  </div>

                  <div className="bg-[#00FF94]/10 p-6 rounded-2xl border border-[#00FF94]/20">
                    <p className="text-sm text-[#00FF94] leading-relaxed">
                      <strong>💡 Impacto Directo:</strong> Estás perdiendo aproximadamente el <strong>30% de tu productividad</strong> en tareas que una IA puede hacer por una fracción de ese coste. <strong>Eso es lo que cuesta no hacer nada.</strong>
                    </p>
                  </div>

                  <a
                    href={CALENDAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-center bg-[#00FF94] text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    <Calendar size={18} />
                    Pedir mi diagnóstico gratuito de 15 min
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        <Reveal width="100%">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-display">Preguntas Frecuentes</h2>
            <p className="text-gray-400">Todo lo que necesitas saber para dar el paso hacia la automatización.</p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={index} width="100%">
              <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-bold text-white">{faq.q}</span>
                  <div className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    {openIndex === index ? (
                      <Minus size={20} className="text-[#00FF94]" />
                    ) : (
                      <Plus size={20} className="text-gray-500" />
                    )}
                  </div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            </Reveal>
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
            <a href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="/dashboard" className="text-[#00FF94] font-bold hover:brightness-125 transition-all">Acceso Clientes</a>
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
      <Testimonials />
      <DemoShowcase />
      <SmartAudit />
      <Services />
      <Process />
      <ROICalculator />
      <FAQ />

      {/* Contact Section */}
      <section id="contacto" className="w-full py-24 px-6 md:px-24 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto glass-card p-12 rounded-3xl border border-white/10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">¿Hablamos 15 minutos?<br /><span className="text-gradient">Sin pitch de ventas.</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto mt-4">
              Cuéntanos cómo funciona tu empresa hoy. Te diremos honestamente si la IA tiene sentido para vosotros — y si no es el caso, también te lo decimos.
            </p>
          </div>

          {/* Opción rápida: ir directo al calendario */}
          <div className="flex flex-col items-center mb-10">
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#00FF94] text-black px-8 py-4 rounded-xl font-bold text-lg glow-effect hover:scale-105 transition-transform"
            >
              <Calendar size={22} />
              Reservar en Google Calendar
            </a>
            <p className="text-gray-600 text-xs mt-3">Elige el hueco que más te convenga · Gratuito · Sin compromiso</p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-[1px] bg-white/10"></div>
            <span className="text-gray-600 text-xs uppercase tracking-widest font-bold">O si prefieres, escríbenos</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>

          <ContactForm />
        </div>
      </section>
      <FloatingCTA />

      <Footer />
    </div>
  );
}
