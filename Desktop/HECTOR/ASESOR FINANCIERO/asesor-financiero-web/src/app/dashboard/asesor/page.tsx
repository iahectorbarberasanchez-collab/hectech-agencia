"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, User, RefreshCw, FileSpreadsheet, AlertTriangle, ArrowRight, TrendingDown, TrendingUp, Trophy, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar";
import { useFinancial } from "@/context/FinancialContext";
import { MarketQuoteCard, PortfolioDistribution, AssetComparison, TaxOptimizationCard, MacroPanel, WhatIfPanel, CashFlowPanel, MonteCarloPanel, CapitalGainsPanel, CorrelationHeatmapPanel, ETFOverlapPanel, StockScreenerPanel, FinancialGoalsPanel, ReportReadyPanel, FundamentalsPanel, InsiderTradesPanel, SECFilingsPanel, NewsSearchPanel } from "@/components/GenerativeUI";

const BASE_SUGGESTIONS = [
  "Haz un resumen de mis datos",
  "¿Cuánto estoy gastando en total?",
  "¿Dónde puedo recortar gastos?",
  "Dame un plan de inversión",
];

const MACRO_SUGGESTIONS = [
  "¿Cómo está la macro ahora mismo?",
  "¿Está el mercado en modo miedo o codicia?",
  "¿Cómo afecta el BCE a mis inversiones?",
  "¿Es buen momento para invertir?",
];

const NO_DATA_SUGGESTIONS = [
  "¿Cómo empezar a invertir?",
  "Dame la regla 50/30/20",
  "¿Qué es un fondo indexado?",
  "¿Qué es el análisis fundamental?",
];

// --- Panic / Euphoria keyword detection ---
const PANIC_KEYWORDS = [
  /vender? todo/i, /pánico/i, /panico/i, /crash/i, /colapso/i, /hundir/i, /se hunde/i,
  /perder? todo/i, /se acaba/i, /crisis total/i, /catástrofe/i, /catastrofe/i,
  /debo vender/i, /salir del mercado/i,
];
const EUPHORIA_KEYWORDS = [
  /todo a/i, /meter todo/i, /all.in/i, /hipotecar/i, /a la luna/i, /voy a forrarme/i,
  /no puede bajar/i, /siempre sube/i, /mil[xX]/i, /x1000/i, /10000%/i,
  /double?r? en/i,
];

function detectPanicEuphoria(text: string): 'panic' | 'euphoria' | null {
  if (PANIC_KEYWORDS.some(r => r.test(text))) return 'panic';
  if (EUPHORIA_KEYWORDS.some(r => r.test(text))) return 'euphoria';
  return null;
}

// --- Gamification milestones ---
const SAVINGS_MILESTONES = [
  { key: 'messages_3', label: '¡3 preguntas respondidas!', icon: '💬', threshold: 3, type: 'messages' },
  { key: 'messages_10', label: '¡Conversación activa! 10 mensajes', icon: '🔥', threshold: 10, type: 'messages' },
  { key: 'messages_25', label: '¡Inversor comprometido! 25 mensajes', icon: '🏆', threshold: 25, type: 'messages' },
];

export default function AsesorPage() {
  const router = useRouter();
  const { user, userId, isLoading: isUserLoading } = useUser();
  const { summary, financialData, documentText, isLoading: isFinancialLoading } = useFinancial();
  const [modelLabel, setModelLabel] = useState<string>('Cargando...');
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    fetch('/api/chat/model-info')
      .then(r => r.json())
      .then(info => {
        setModelLabel(info.label ?? 'IA Premium');
        setIsUnlimited(info.unlimited ?? false);
      })
      .catch(() => setModelLabel('IA Premium'));
  }, []);

  const hasData = summary !== null && (summary.totalRows > 0 || (summary.fileType === 'pdf' && !!documentText));

  const [chatInput, setChatInput] = useState("");
  // Panic/Euphoria modal
  const [warningModal, setWarningModal] = useState<{ type: 'panic' | 'euphoria'; message: string } | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  // Gamification
  const [milestone, setMilestone] = useState<{ label: string; icon: string } | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const triggeredMilestones = useRef<Set<string>>(new Set());

  // Ref to hold current body values — read fresh on every API call
  const bodyRef = useRef<Record<string, unknown>>({});
  bodyRef.current = {
    userId,
    financialData: financialData && Object.keys(financialData).length > 0 ? financialData : null,
    financialSummary: summary,
    documentText: documentText,
  };

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat', body: () => bodyRef.current }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const chat = useChat({
    transport,
    messages: [
      {
        id: "initial-1",
        role: "assistant" as const,
        parts: [
          {
            type: 'text' as const,
            text: hasData
              ? `¡Hola! Ya veo que has cargado **${summary!.fileName}** ${summary!.fileType === 'pdf' ? 'en formato PDF' : `con **${summary!.totalRows} registros**`}. Puedo analizarlo ahora mismo. ¿Qué quieres saber? Especialidades: Salud financiera, trading, análisis técnico/fundamental y macroeconomía.`
              : "¡Hola! Soy tu Asesor Financiero IA Avanzado. El primer paso para asesorarte es conocer tu estado actual: **¿Cuáles son tus ingresos y gastos mensuales aproximados?**\n\nPuedes decírmelo directamente por aquí o subir tu archivo Excel o PDF en el Panel para un análisis exacto. También puedes consultarme sobre mercados, trading o análisis fundamental/técnico."
          }
        ]
      }
    ]
  });

  const {
    messages = [],
    setMessages,
    sendMessage,
    status,
    error
  } = chat;

  const currentMessages = messages || [];
  const isLoading = status === 'submitted' || status === 'streaming';

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  // Check gamification milestones
  const checkMilestones = useCallback((count: number) => {
    for (const m of SAVINGS_MILESTONES) {
      if (!triggeredMilestones.current.has(m.key) && count >= m.threshold) {
        triggeredMilestones.current.add(m.key);
        setMilestone({ label: m.label, icon: m.icon });
        setTimeout(() => setMilestone(null), 3500);
        break;
      }
    }
  }, []);

  const doSendMessage = useCallback(async (text: string) => {
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);
    checkMilestones(newCount);
    await sendMessage({ text });
  }, [userMessageCount, checkMilestones, sendMessage]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput?.trim() || isLoading) return;
    const msg = chatInput.trim();
    setChatInput("");

    // Panic/Euphoria detection
    const detected = detectPanicEuphoria(msg);
    if (detected) {
      pendingMessageRef.current = msg;
      const warningText = detected === 'panic'
        ? "He detectado que podrías estar tomando una decisión impulsiva por pánico. Las emociones son el mayor enemigo del inversor. ¿Estás seguro de que quieres proceder? Recuerda: vender en pánico suele ser el peor momento."
        : "He detectado entusiasmo elevado. Las decisiones impulsivas por euforia pueden ser tan peligrosas como las del pánico. ¿Quieres continuar con esta consulta?";
      setWarningModal({ type: detected, message: warningText });
      return;
    }

    await doSendMessage(msg);
  };

  const handleWarningConfirm = async () => {
    const msg = pendingMessageRef.current;
    setWarningModal(null);
    pendingMessageRef.current = null;
    if (msg) await doSendMessage(msg);
  };

  const handleWarningCancel = () => {
    setWarningModal(null);
    pendingMessageRef.current = null;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save chat to Supabase 5s after the last AI response
  useEffect(() => {
    if (status !== 'ready' || currentMessages.length < 3) return;
    if (chatSaveTimerRef.current) clearTimeout(chatSaveTimerRef.current);
    chatSaveTimerRef.current = setTimeout(async () => {
      if (!userId) return;
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const serialized = currentMessages
          .filter((m: any) => m.role !== 'system')
          .map((m: any) => ({
            role: m.role,
            content: (m.parts as any[])?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') ?? '',
          }))
          .filter(m => m.content);
        if (serialized.length < 2) return;
        await supabase.from('user_chat_history').insert({
          user_id: userId,
          messages: serialized,
        });
      } catch { /* silent */ }
    }, 5000);
    return () => { if (chatSaveTimerRef.current) clearTimeout(chatSaveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // When data changes, clear chat to adapt context
  const prevHasData = useRef(hasData);
  const prevSummaryName = useRef(summary?.fileName);

  useEffect(() => {
    if ((!prevHasData.current && hasData && summary) || (prevSummaryName.current !== summary?.fileName && summary)) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant" as const,
          parts: [
            {
              type: 'text' as const,
              text: `📂 He detectado que acabas de cargar **${summary.fileName}** ${summary.fileType === 'pdf' ? 'en formato PDF' : `con **${summary.totalRows} registros**`}. ¡Ya tengo todos tus datos disponibles y puedo analizarlos a fondo! ¿Por dónde empezamos?`
            }
          ]
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
        role: "assistant" as const,
        parts: [
          {
            type: 'text' as const,
            text: hasData
              ? `¡Nueva sesión iniciada! Aquí sigo con tus datos de **${summary!.fileName}**. ¿Qué analizamos ahora?`
              : "¡Sesión reiniciada! ¿En qué aspecto de tus finanzas o los mercados te puedo ayudar hoy?"
          }
        ]
      }
    ]);
    setUserMessageCount(0);
    triggeredMilestones.current.clear();
  };

  // Mix data-specific suggestions with macro suggestions
  const suggestions = hasData
    ? [...BASE_SUGGESTIONS.slice(0, 2), ...MACRO_SUGGESTIONS.slice(0, 2)]
    : [...NO_DATA_SUGGESTIONS.slice(0, 2), ...MACRO_SUGGESTIONS.slice(0, 2)];

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    doSendMessage(suggestion);
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
              <p className="text-xs font-medium flex items-center gap-1.5">
                <span className={isUnlimited ? 'text-emerald-400' : 'text-amber-400'}>{modelLabel}</span>
                {isUnlimited && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">∞ Sin límite</span>
                )}
              </p>
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
              <strong>Error de conexión AI:</strong> {error.message}. Verifica tu API key (OpenRouter/Groq/Ollama) en el archivo .env.local.
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
                  {/* Texto del mensaje */}
                  {(msg.parts as any[])?.filter((p: any) => p.type === 'text').map((part: any, i: number) => (
                    <span key={i}>{part.text}</span>
                  ))}

                  {/* Renderizado de Herramientas (Generative UI) */}
                  {(msg.parts as any[])?.filter((p: any) => p.type === 'dynamic-tool' || p.type?.startsWith('tool-')).map((tool: any) => {
                    const toolCallId = tool.toolCallId;
                    const toolName = tool.type === 'dynamic-tool' ? tool.toolName : tool.type?.replace('tool-', '');
                    const { state, output } = tool;
                    if (state === 'output-available' && output?.success) {
                      switch (toolName) {
                        case 'get_market_data':
                          return <MarketQuoteCard key={toolCallId} data={output.data} />;
                        case 'show_portfolio_distribution':
                          return <PortfolioDistribution key={toolCallId} data={output.data} />;
                        case 'calculate_tax_optimization':
                          return <TaxOptimizationCard key={toolCallId} data={output.data} />;
                        case 'get_macro_context':
                          return <MacroPanel key={toolCallId} data={output.data} />;
                        case 'simulate_what_if':
                          return <WhatIfPanel key={toolCallId} data={output.data} />;
                        case 'project_cash_flow':
                          return <CashFlowPanel key={toolCallId} data={output.data} />;
                        case 'run_monte_carlo':
                          return <MonteCarloPanel key={toolCallId} data={output.data} />;
                        case 'calculate_capital_gains':
                          return <CapitalGainsPanel key={toolCallId} data={output.data} />;
                        case 'analyze_portfolio_correlation':
                          return <CorrelationHeatmapPanel key={toolCallId} data={output.data} />;
                        case 'analyze_etf_overlap':
                          return <ETFOverlapPanel key={toolCallId} data={output.data} />;
                        case 'screen_stocks':
                          return <StockScreenerPanel key={toolCallId} data={output.data} />;
                        case 'get_financial_goals':
                          return <FinancialGoalsPanel key={toolCallId} data={output.data} />;
                        case 'prepare_portfolio_report':
                          return <ReportReadyPanel key={toolCallId} data={output.data} onDownload={async () => {
                            const { generateFinancialReport } = await import('@/lib/report-generator');
                            await generateFinancialReport(output.data);
                          }} />;
                        case 'get_income_statement':
                        case 'get_balance_sheet':
                        case 'get_cash_flow':
                          return <FundamentalsPanel key={toolCallId} data={output.data} ticker={output.ticker} period={output.period ?? 'annual'} />;
                        case 'get_insider_trades':
                          return <InsiderTradesPanel key={toolCallId} data={output.data} ticker={output.ticker} />;
                        case 'get_sec_filings':
                          return <SECFilingsPanel key={toolCallId} data={output.data} ticker={output.ticker} filingType={output.filingType} />;
                        case 'search_financial_news':
                          return <NewsSearchPanel key={toolCallId} data={output.data} query={output.query} />;
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
                value={chatInput}
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
              disabled={!chatInput?.trim() || isLoading}
              className={`p-3 rounded-full transition-all shrink-0 ${
                chatInput?.trim() && !isLoading
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
                  : "glass text-white/20 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {/* Panic/Euphoria Warning Modal */}
      <AnimatePresence>
        {warningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`glass-card rounded-2xl p-6 max-w-md w-full border ${
                warningModal.type === 'panic'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  warningModal.type === 'panic' ? 'bg-red-500/20' : 'bg-amber-500/20'
                }`}>
                  {warningModal.type === 'panic' ? <TrendingDown className="w-6 h-6 text-red-400" /> : <TrendingUp className="w-6 h-6 text-amber-400" />}
                </div>
                <div>
                  <p className={`font-bold text-sm uppercase tracking-wider ${warningModal.type === 'panic' ? 'text-red-400' : 'text-amber-400'}`}>
                    {warningModal.type === 'panic' ? '⚠️ Alerta: Posible Decisión por Pánico' : '🔥 Alerta: Posible Decisión por Euforia'}
                  </p>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-6">{warningModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleWarningCancel}
                  className="flex-1 py-2.5 rounded-xl glass text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  Pausar y reflexionar
                </button>
                <button
                  onClick={handleWarningConfirm}
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${
                    warningModal.type === 'panic'
                      ? 'bg-red-600/60 hover:bg-red-600'
                      : 'bg-amber-600/60 hover:bg-amber-600'
                  }`}
                >
                  Continuar de todas formas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gamification milestone toast */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-sm border border-emerald-400/30 shadow-lg"
          >
            <span className="text-2xl">{milestone.icon}</span>
            <div>
              <p className="text-white font-bold text-sm">{milestone.label}</p>
              <p className="text-emerald-200 text-xs">Sigue así, inversor comprometido</p>
            </div>
            <Trophy className="w-5 h-5 text-yellow-300 ml-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
