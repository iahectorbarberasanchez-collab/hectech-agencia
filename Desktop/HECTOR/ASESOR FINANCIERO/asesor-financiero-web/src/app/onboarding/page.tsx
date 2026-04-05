"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Wallet, TrendingUp, PiggyBank } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

type OptionType = { value: string; label: string; icon?: any; meaning?: string };
type QuestionType = { id: string; title: string; description: string; options: OptionType[] };

const questions: QuestionType[] = [
  // 1. Personal Situation
  {
    id: "family_status",
    title: "¿Cuál es tu situación familiar?",
    description: "Conocer tu situación familiar nos ayuda a determinar tu nivel de responsabilidad financiera y necesidades de protección (seguros, fondo de emergencia).",
    options: [
      { value: "single", label: "Soltero/a", meaning: "Te permite ser más flexible y agresivo con tus inversiones al tener menos dependientes." },
      { value: "couple", label: "En pareja / Casado/a", meaning: "Podéis planificar metas conjuntas, optimizando ahorros y gastos compartidos." },
      { value: "children", label: "Con hijos/as a cargo", meaning: "Tus prioridades se centran en la seguridad y el futuro de tus hijos, requiriendo un enfoque más conservador." },
    ],
  },
  {
    id: "age_range",
    title: "¿En qué rango de edad te encuentras?",
    description: "La edad es un factor clave para definir el horizonte temporal de tus inversiones y tu capacidad de recuperación ante caídas del mercado.",
    options: [
      { value: "18-25", label: "18 - 25 años", meaning: "Tienes el activo más valioso: el tiempo. Puedes maximizar el interés compuesto." },
      { value: "26-35", label: "26 - 35 años", meaning: "Estás en el momento ideal para construir una base sólida con riesgo moderado-alto." },
      { value: "36-50", label: "36 - 50 años", meaning: "Tus años de mayor ingresos; equilibramos crecimiento con estabilidad patrimonial." },
      { value: "51-65", label: "51 - 65 años", meaning: "Nos enfocamos en proteger lo construido y preparar la transición a la jubilación." },
      { value: "65+", label: "Más de 65 años", meaning: "Prioridad: preservar capital y generar ingresos pasivos estables." },
    ],
  },
  // 2. Financial Health
  {
    id: "occupation",
    title: "¿A qué te dedicas actualmente?",
    description: "La estabilidad y el tipo de tus ingresos determinan cuánto riesgo puedes asumir fuera de tu entorno laboral.",
    options: [
      { value: "employee", label: "Trabajador por cuenta ajena", meaning: "Ingresos estables que permiten una planificación estructurada y aportes constantes." },
      { value: "freelance", label: "Autónomo / Empresario", meaning: "Ingresos variables. Priorizaremos un fondo de emergencia más robusto." },
      { value: "student", label: "Estudiante / En formación", meaning: "Tu mayor inversión hoy es tu educación. Empezamos con hábitos de ahorro." },
      { value: "retired", label: "Jubilado/a", meaning: "Enfoque en la gestión eficiente del patrimonio acumulado." },
    ],
  },
  {
    id: "income",
    title: "¿Cuáles son tus ingresos mensuales netos?",
    description: "Saber cuánto entra en casa es la base de cualquier plan. Define tu capacidad de ahorro real.",
    options: [
      { value: "low", label: "Menos de 1.500 €", meaning: "Optimizaremos cada euro para crear tu primer colchón de seguridad." },
      { value: "mid", label: "Entre 1.500 € y 3.000 €", meaning: "Tienes capacidad para diversificar y empezar a invertir seriamente." },
      { value: "high", label: "Entre 3.000 € y 5.000 €", meaning: "Excelente base para acelerar la creación de riqueza mediante interés compuesto." },
      { value: "very_high", label: "Más de 5.000 €", meaning: "Perfil con alta capacidad de inversión y optimización fiscal." },
    ],
  },
  {
    id: "savings_rate",
    title: "¿Qué porcentaje de tus ingresos ahorras?",
    description: "No importa cuánto ganes, sino cuánto conserves. El ahorro es el motor de tu libertad financiera.",
    options: [
      { value: "none", label: "No ahorro actualmente", meaning: "Nuestro primer paso será identificar fugas de dinero para empezar tu ahorro." },
      { value: "low", label: "Menos del 10%", meaning: "Pequeños ajustes pueden duplicar tu velocidad de acumulación de riqueza." },
      { value: "mid", label: "Entre un 10% y el 20%", meaning: "Hábito saludable. Estás en el promedio de los ahorradores exitosos." },
      { value: "high", label: "Más del 20%", meaning: "¡Impresionante! Estás en la vía rápida hacia la independencia financiera." },
    ],
  },
  {
    id: "emergency_fund",
    title: "¿De cuánto es tu fondo de emergencia?",
    description: "Es tu red de seguridad. Sin ella, un imprevisto puede obligarte a vender inversiones con pérdidas.",
    options: [
      { value: "none", label: "No tengo todavía", meaning: "Prioridad número 1: crear este colchón antes de cualquier inversión." },
      { value: "1-3m", label: "Cubre 1 a 3 meses", meaning: "Buen comienzo, pero un poco ajustado ante crisis prolongadas." },
      { value: "3-6m", label: "Cubre 3 a 6 meses", meaning: "Nivel óptimo. Te permite invertir con total paz mental." },
      { value: "6m+", label: "Cubre más de 6 meses", meaning: "Base ultra-sólida. Puedes asumir riesgos mayores en tu inversión." },
    ],
  },
  // 3. Investment Profile
  {
    id: "goal",
    title: "¿Cuál es tu objetivo financiero principal?",
    description: "Cada meta requiere una estrategia distinta. No se invierte igual para comprar una casa que para jubilarse.",
    options: [
      { value: "emergency", label: "Fondo de Emergencia", icon: ShieldCheck, meaning: "Buscamos máxima seguridad y liquidez inmediata." },
      { value: "house", label: "Comprar una casa", icon: Wallet, meaning: "Necesitamos un equilibrio entre crecimiento y protección del capital inicial." },
      { value: "retirement", label: "Jubilación", icon: PiggyBank, meaning: "Aprovechamos el largo plazo para maximizar el interés compuesto agresivamente." },
      { value: "growth", label: "Crecimiento agresivo", icon: TrendingUp, meaning: "Aceptamos alta volatilidad a cambio de maximizar el patrimonio total." },
    ],
  },
  {
    id: "horizon",
    title: "¿Cuánto tiempo mantendrás tu inversión?",
    description: "El tiempo cura la volatilidad. Cuanto más largo sea el plazo, más riesgo podemos (y debemos) asumir.",
    options: [
      { value: "short", label: "Corto plazo (< 2 años)", meaning: "Evitaremos la bolsa volátil; priorizamos depósitos y renta fija." },
      { value: "medium", label: "Medio plazo (2 a 7 años)", meaning: "Cartera equilibrada entre activos seguros y de crecimiento." },
      { value: "long", label: "Largo plazo (+7 años)", meaning: "La historia favorece al inversor paciente. Enfoque mayoritario en renta variable." },
    ],
  },
  {
    id: "knowledge",
    title: "¿Nivel de conocimiento financiero?",
    description: "Queremos hablar tu mismo lenguaje. No te recomendaremos nada que no entiendas perfectamente.",
    options: [
      { value: "beginner", label: "Principiante absoluto", meaning: "Te guiaremos paso a paso, priorizando la sencillez y la educación." },
      { value: "intermediate", label: "Conozco lo básico", meaning: "Podemos explorar estrategias de diversificación más avanzadas." },
      { value: "advanced", label: "Invierto activamente", meaning: "Hablaremos de optimización, costes y estrategias específicas de mercado." },
    ],
  },
  {
    id: "risk",
    title: "Si tu inversión cayera un 15%, ¿qué harías?",
    description: "La teoría es fácil, pero la psicología es lo que te hace ganar dinero. Necesitamos saber cómo reaccionarás.",
    options: [
      { value: "sell", label: "Vendería todo", meaning: "Perfil conservador. Protegeremos tu capital para evitar que sufras con el mercado." },
      { value: "hold", label: "No tocaría nada", meaning: "Perfil moderado. Entiendes que las fluctuaciones son parte del camino." },
      { value: "buy", label: "Compraría más barato", meaning: "Perfil decidido. Tienes mentalidad de inversor profesional de largo plazo." },
    ],
  },
  // 4. Preferences
  {
    id: "investment_type",
    title: "¿En qué activos te gustaría invertir?",
    description: "Tus preferencias personales son vitales para que te sientas cómodo con tu cartera a largo plazo.",
    options: [
      { value: "stocks", label: "Acciones y Fondos", meaning: "Participas en el crecimiento de las mejores empresas del mundo." },
      { value: "real_estate", label: "Bienes Raíces", meaning: "Buscamos activos tangibles y rentas por alquiler o revalorización." },
      { value: "crypto", label: "Criptomonedas", meaning: "Aceptamos la mayor volatilidad por el potencial de disrupción tecnológica." },
      { value: "safe", label: "Renta Fija y Depósitos", meaning: "Priorizamos la previsibilidad y la gestión del flujo de caja." },
    ],
  },
  {
    id: "priority",
    title: "¿Qué priorizas más en tu inversión?",
    description: "Esto define la 'receta' final de tu cartera: ¿Buscas dormir tranquilo o llegar más lejos?",
    options: [
      { value: "safety", label: "Seguridad", meaning: "Duermes mejor sabiendo que tu dinero apenas fluctúa." },
      { value: "balanced", label: "Equilibrio", meaning: "Buscas lo mejor de ambos mundos: riesgo controlado y buen retorno." },
      { value: "profit", label: "Rentabilidad", meaning: "Estás dispuesto a ver números rojos temporales por un premio mayor al final." },
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { userId, isLoading: isUserLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !userId) {
      router.push("/auth");
    }
  }, [userId, isUserLoading, router]);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextStep = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsComplete(true);
      
      // Guardar en Supabase
      try {
        if (!userId) throw new Error("No user ID found");

        const { error } = await supabase
          .from('user_financial_profile')
          .upsert({
            user_id: userId,
            financial_goal: answers.goal,
            knowledge_level: answers.knowledge,
            risk_tolerance: answers.risk,
            monthly_income_range: answers.income,
            family_status: answers.family_status,
            age_range: answers.age_range,
            occupation: answers.occupation,
            monthly_savings_percent: answers.savings_rate,
            emergency_fund_status: answers.emergency_fund,
            investment_horizon: answers.horizon,
            investment_priority: answers.priority,
            preferred_assets: [answers.investment_type],
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) throw error;
      } catch (err: any) {
        console.error("Error saving profile:", err);
        alert("⚠️ Hubo un problema al guardar tu perfil: " + (err.message || String(err)));
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progress = (currentStep / questions.length) * 100;

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="absolute top-0 w-full h-full bg-emerald-500/10 blur-[150px] -z-10" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="glass-card p-12 rounded-3xl flex flex-col items-center text-center max-w-lg w-full"
        >
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">¡Perfil completado!</h2>
          <p className="text-foreground/70 mb-8">Nuestra IA está analizando tus respuestas para crear un plan y tu Dashboard financiero personalizado...</p>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: "100%" }} 
              transition={{ duration: 2.5 }} 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500" 
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-background -z-20" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -z-10" />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-white/5 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="w-full max-w-3xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="mb-12">
              <span className="text-emerald-400 font-medium tracking-wider text-sm uppercase mb-4 block">
                Paso {currentStep + 1} de {questions.length}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
                {currentQ.title}
              </h2>
              <p className="text-lg text-white/60 max-w-2xl leading-relaxed">
                <span className="text-emerald-400 font-semibold italic">¿Por qué preguntamos esto?</span> {currentQ.description}
              </p>
            </div>

            <div className={`grid gap-4 ${currentQ.options.length <= 3 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.id] === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(currentQ.id, option.value)}
                    className={`p-6 rounded-2xl text-left transition-all duration-200 border flex flex-col items-start gap-4 hover:-translate-y-1 ${isSelected ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "glass border-white/5 hover:bg-white/5"}`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      {Icon && <Icon className={`w-8 h-8 ${isSelected ? "text-emerald-400" : "text-white/50"}`} />}
                      <span className={`text-lg font-medium ${isSelected ? "text-white" : "text-white/80"}`}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && option.meaning && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 text-sm text-emerald-300/80 border-t border-emerald-500/20 pt-4 w-full"
                      >
                        <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-widest block mb-1">Feedback del Asesor:</span>
                        {option.meaning}
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${currentStep === 0 ? "opacity-0 pointer-events-none" : "hover:bg-white/5 text-white/70 hover:text-white"}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Atrás
          </button>
          
          <button
            onClick={nextStep}
            disabled={!answers[currentQ.id]}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${!answers[currentQ.id] ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"}`}
          >
            {currentStep === questions.length - 1 ? "Analizar Perfil" : "Siguiente"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
