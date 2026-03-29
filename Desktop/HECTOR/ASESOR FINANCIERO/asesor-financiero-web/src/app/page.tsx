"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] -z-10" />
      
      <main className="w-full max-w-5xl px-6 flex flex-col items-center justify-center text-center z-10 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <img src="/logo.png" alt="Financial AI Advisor Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>El futuro de tus finanzas empieza hoy</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Financial AI Advisor <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
            Impulsado por Inteligencia Artificial
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-12"
        >
          Toma el control de tu patrimonio con recomendaciones personalizadas, seguimiento de presupuesto y estrategias de inversión adaptadas a tu perfil.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={() => router.push('/auth?mode=register')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            Crear cuenta
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => router.push('/auth?mode=login')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full glass hover:bg-white/5 font-medium transition-all"
          >
            Iniciar Sesión
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Estrategias de Inversión</h3>
            <p className="text-foreground/60 text-sm">Portafolios optimizados según tu tolerancia al riesgo y objetivos macro.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Copiloto IA 24/7</h3>
            <p className="text-foreground/60 text-sm">Consultas financieras, dudas de impuestos y educación al instante.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Privacidad Total</h3>
            <p className="text-foreground/60 text-sm">Tus datos están anonimizados y protegidos con seguridad bancaria.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
