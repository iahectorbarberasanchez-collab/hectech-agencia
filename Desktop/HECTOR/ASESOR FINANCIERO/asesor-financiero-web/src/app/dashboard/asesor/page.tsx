"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, User, RefreshCw, FileSpreadsheet, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar";
import { useFinancial } from "@/context/FinancialContext";
import { MarketQuoteCard, PortfolioDistribution, AssetComparison, TaxOptimizationCard } from "@/components/GenerativeUI";

const BASE_SUGGESTIONS = [
  "Haz un resumen de mis datos",
  "¿Cuánto estoy gastando en total?",
  "¿Dónde puedo recortar gastos?",
  "Dame un plan de inversión",
];

const NO_DATA_SUGGESTIONS = [
  "¿Cómo empezar a invertir?",
  "Dame la regla 50/30/20",
  "¿Qué es un fondo indexado?",
  "¿Qué es el análisis fundamental?",
];

export default function AsesorPage() {
  const router = useRouter();
  const { user, userId, isLoading: isUserLoading } = useUser();
  const { summary, financialData, documentText, isLoading: isFinancialLoading } = useFinancial();

  const hasData = summary !== null && (summary.totalRows > 0 || (summary.fileType === 'pdf' && !!documentText));

  const [chatInput, setChatInput] = useState("");
  const chat = useChat({
    api: '/api/chat',
    body: {
      userId,
      financialData: financialData && Object.keys(financialData).length > 0 ? financialData : null,
      financialSummary: summary,
      documentText: documentText
    },
    initialMessages: [
      {
        id: "initial-1",
        role: "assistant",
        content: hasData
          ? `¡Hola! Ya veo que has cargado **${summary!.fileName}** ${summary!.fileType === 'pdf' ? 'en formato PDF' : `con **${summary!.totalRows} registros**`}. Puedo analizarlo ahora mismo. ¿Qué quieres saber? Especialidades: Salud financiera, trading, análisis técnico/fundamental y macroeconomía.`
          : "¡Hola! Soy tu Asesor Financiero IA Avanzado de HecTechAI. El primer paso para asesorarte es conocer tu estado actual: **¿Cuáles son tus ingresos y gastos mensuales aproximados?**\n\nPuedes decírmelo directamente por aquí o subir tu archivo Excel o PDF en el Panel para un análisis exacto. También puedes consultarme sobre mercados, trading o análisis fundamental/técnico."
      }
    ]
  });

  // Map properties safely, trying both possible naming conventions
  const { 
    messages = [], 
    setMessages, 
    sendMessage, 
    append,
    handleSubmit: sdkHandleSubmit, 
    input: sdkInput, 
    handleInputChange: sdkHandleInputChange, 
    isLoading: sdkIsLoading, 
    status, 
    error 
  } = chat as any;

  const currentMessages = messages || [];
  const isLoading = sdkIsLoading || status === 'loading' || status === 'streaming';
  
  // Use either the SDK input or our local state
  const displayInput = sdkInput !== undefined ? sdkInput : chatInput;
  
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sdkHandleInputChange) {
      sdkHandleInputChange(e);
    } else {
      setChatInput(e.target.value);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with input:", displayInput);
    
    if (sdkHandleSubmit) {
      sdkHandleSubmit(e);
    } else if (sendMessage) {
      const msg = chatInput;
      setChatInput("");
      await sendMessage(msg);
    } else if (append) {
      const msg = chatInput;
      setChatInput("");
      await append({ role: 'user', content: msg });
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When data changes, clear chat to adapt context
  const prevHasData = useRef(hasData);
  const prevSummaryName = useRef(summary?.fileName);

  useEffect(() => {
    if ((!prevHasData.current && hasData && summary) || (prevSummaryName.current !== summary?.fileName && summary)) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `📂 He detectado que acabas de cargar **${summary.fileName}** ${summary.fileType === 'pdf' ? 'en formato PDF' : `con **${summary.totalRows} registros**`}. ¡Ya tengo todos tus datos disponibles y puedo analizarlos a fondo! ¿Por dónde empezamos?`
        }
      ]);
    }
    prevHasData.current = hasData;
    prevSummaryName.current = summary?.fileName;
  }, [hasData, summary, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isLoading]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isFinancialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <p className="text-white/60 font-medium font-geist">Cargando tu asesor personal...</p>
        </div>
      </div>
    );
  }

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: hasData
          ? `¡Nueva sesión iniciada! Aquí sigo con tus datos de **${summary!.fileName}**. ¿Qué analizamos ahora?`
          : "¡Sesión reiniciada! ¿En qué aspecto de tus finanzas o los mercados te puedo ayudar hoy?"
      }
    ]);
  };

  const suggestions = hasData ? BASE_SUGGESTIONS : NO_DATA_SUGGESTIONS;

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    if (sendMessage) {
      sendMessage(suggestion);
    } else if (append) {
      append({ role: 'user', content: suggestion });
    } else if (sdkHandleInputChange) {
      sdkHandleInputChange({ target: { value: suggestion } } as any);
      setTimeout(() => document.getElementById('chat-submit-btn')?.click(), 50);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-6 border-b border-white/10 flex items-center justify-between glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
              <Bot className="w-6 h-6 text-emerald-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Asesor IA Premium</h1>
              <p className="text-xs text-emerald-400 font-medium">Motor GPT-4o conectado</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasData && summary ? (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {summary.fileName} · {summary.totalRows} registros
              </span>
            ) : (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Sube tu Excel primero
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}

            <button
              onClick={resetChat}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/5 text-white/50 hover:text-white transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm mb-4">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              <strong>Error de conexión AI:</strong> {error.message}. Verifica tu conexión o el estado de los servicios de IA de Google Gemini.
            </div>
          )}

          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="glass-card p-4 rounded-xl text-left text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all hover:-translate-y-0.5 border border-white/5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 mb-2" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}

          <AnimatePresence>
            {currentMessages.map((msg: any) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-emerald-500/20 text-emerald-400" : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div
                  className={`px-5 py-4 rounded-2xl text-sm leading-relaxed max-w-[600px] whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "glass-card text-white/90 rounded-tl-sm"
                      : "bg-emerald-600 text-white rounded-tr-sm"
                  }`}
                >
                  {msg.content}

                  {/* Renderizado de Herramientas (Generative UI) */}
                  {msg.toolInvocations && msg.toolInvocations.map((tool: any) => {
                    const { toolCallId, toolName, state, result } = tool;
                    if (state === 'result' && result.success) {
                      switch (toolName) {
                        case 'get_market_data':
                          return <MarketQuoteCard key={toolCallId} data={result.data} />;
                        case 'show_portfolio_distribution':
                          return <PortfolioDistribution key={toolCallId} data={result.data} />;
                        case 'calculate_tax_optimization':
                          return <TaxOptimizationCard key={toolCallId} data={result.data} />;
                        // Podríamos añadir más casos aquí
                        default:
                          return null;
                      }
                    }
                    return null;
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 max-w-3xl"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm glass-card flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 p-4 border-t border-white/10 glass">
          <form onSubmit={onFormSubmit} className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 glass-card rounded-2xl flex items-end gap-2 px-4 py-3">
              <input
                value={displayInput || ""}
                onChange={onInputChange}
                type="text"
                placeholder={
                  hasData
                    ? `Pregunta sobre ${summary!.fileName} o de los mercados...`
                    : "Pregunta sobre trading, macro, o sube tu Excel..."
                }
                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none leading-relaxed"
              />
            </div>
            <button
              id="chat-submit-btn"
              type="submit"
              disabled={!(displayInput?.trim()) || isLoading}
              className={`p-3 rounded-full transition-all shrink-0 ${
                (displayInput?.trim()) && !isLoading
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
                  : "glass text-white/20 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
