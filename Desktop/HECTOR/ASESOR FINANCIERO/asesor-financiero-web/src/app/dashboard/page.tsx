"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, MessageSquare, FileSpreadsheet, CheckCircle2, ArrowRight, Table2 } from "lucide-react";
import UniversalUploader from "@/components/UniversalUploader";
import IndependenceSimulator from "@/components/IndependenceSimulator";
import Sidebar from "@/components/Sidebar";
import { useFinancial } from "@/context/FinancialContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDashboardSummary } from "@/lib/portfolio-utils";
import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, Percent, Activity, Sparkles, Download, FileText } from "lucide-react";
import { generateInsightsFromData } from "@/lib/insight-rules";
import { generateFinancialReport } from "@/lib/report-generator";
import { PortfolioAsset } from "@/lib/supabase";
import { MarketQuote } from "@/types/market";
import { RefreshCw } from "lucide-react";
import AIInsightsPanel from "@/components/AIInsightsPanel";

export default function Dashboard() {
  const router = useRouter();
  const { financialData, documentText, summary } = useFinancial();
  const { user, userId, isLoading: isUserLoading } = useUser();
  const [userName, setUserName] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketQuote[]>([]);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // Fetch user display name from profile
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_financial_profile')
      .select('occupation')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.occupation) {
          setUserName(data.occupation);
        } else if (user?.email) {
          // Fallback: use part of email before @
          setUserName(user.email.split('@')[0]);
        }
      });
  }, [userId, user]);

  // Dashboard calculations
  const dashboardStats = getDashboardSummary(summary);

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchMarket() {
      try {
        const res = await fetch('/api/market');
        const json = await res.json();
        if (json.success) setMarketData(json.data);
      } catch (e) {
        console.error("Error fetching market data:", e);
      } finally {
        setIsMarketLoading(false);
      }
    }
    fetchMarket();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarket, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch portfolio from DB
  useEffect(() => {
    if (!userId) return;
    setPortfolioLoading(true);
    supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId)
      .order('value_eur', { ascending: false })
      .then(({ data }) => {
        setPortfolioAssets(data || []);
        setPortfolioLoading(false);
      });
  }, [userId]);

  const handleDownloadReport = async () => {
    if (!userId) return;
    setIsGenerating(true);
    try {
      // 1. Fetch assets
      const { data: assets } = await supabase
        .from("user_portfolio")
        .select("*")
        .eq("user_id", userId);

      // 2. Fetch latest quotes for those assets via API (Safe for client)
      const tickers = assets?.map(a => a.ticker).filter(Boolean) as string[] || [];
      let quotes: Record<string, MarketQuote> = {};
      
      if (tickers.length > 0) {
        const res = await fetch(`/api/market?symbols=${tickers.join(',')}`);
        const json = await res.json();
        if (json.success && json.data) {
          json.data.forEach((q: MarketQuote) => {
            quotes[q.symbol.toUpperCase()] = q;
          });
        }
      }

      // 3. Generate PDF
      generateFinancialReport({
        userName: user?.email?.split('@')[0] || "Usuario",
        date: new Date().toLocaleDateString('es-ES'),
        stats: dashboardStats,
        assets: assets || [],
        quotes,
        insights: generateInsightsFromData(dashboardStats)
      });
    } catch (e) {
      console.error("Error generating report:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const portfolioTotal = portfolioAssets.reduce((s, a) => s + (a.value_eur || 0), 0);
  const portfolioInvested = portfolioAssets.reduce((s, a) => {
    // Use qty × price only when both are set — otherwise fall back to value_eur (avoids inflating cost)
    if (a.quantity && a.purchase_price && a.purchase_price > 0) return s + a.quantity * a.purchase_price;
    return s + (a.value_eur || 0);
  }, 0);
  const portfolioProfit = portfolioTotal - portfolioInvested;
  const portfolioProfitPct = portfolioInvested > 0 ? (portfolioProfit / portfolioInvested) * 100 : 0;

  // Prefer Resum sheet values when available, fall back to DB calculation
  const displayInvested = summary?.resumenMetrics?.totalInvested ?? portfolioInvested;
  const displayCurrentValue = summary?.resumenMetrics?.totalCurrentValue ?? portfolioTotal;
  const displayProfit = displayCurrentValue - displayInvested;
  const displayProfitPct = displayInvested > 0 ? (displayProfit / displayInvested) * 100 : 0;

  // Category breakdown from Resum sheet
  const resumenBreakdown: { label: string; value: number; color: string; icon: string }[] = [];
  const rm = summary?.resumenMetrics;
  if (rm) {
    if (rm.acciones) resumenBreakdown.push({ label: 'Acciones', value: rm.acciones, color: 'bg-blue-500', icon: '📈' });
    if (rm.etf) resumenBreakdown.push({ label: 'ETF', value: rm.etf, color: 'bg-indigo-500', icon: '🌍' });
    if (rm.cripto) resumenBreakdown.push({ label: 'Cripto', value: rm.cripto, color: 'bg-orange-500', icon: '₿' });
    // Oro and Plata shown as individual cards so each position is clearly visible
    if (rm.oro) resumenBreakdown.push({ label: 'Oro', value: rm.oro, color: 'bg-yellow-500', icon: '🥇' });
    if (rm.plata) resumenBreakdown.push({ label: 'Plata', value: rm.plata, color: 'bg-slate-400', icon: '🥈' });
    if (rm.emergencyFund) resumenBreakdown.push({ label: 'Fondo Emergencia', value: rm.emergencyFund, color: 'bg-emerald-500', icon: '🛡️' });
    if (rm.trading) resumenBreakdown.push({ label: 'Cuenta Trading', value: rm.trading, color: 'bg-purple-500', icon: '⚡' });
  }
  const hasResumenBreakdown = resumenBreakdown.length > 0;

  // Group assets by type for mini breakdown
  const typeBreakdown = portfolioAssets.reduce<Record<string, number>>((acc, a) => {
    const type = a.asset_type || 'Inversión';
    acc[type] = (acc[type] || 0) + (a.value_eur || 0);
    return acc;
  }, {});
  const typeBreakdownSorted = Object.entries(typeBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Market Ticker Bar */}
        <div className="w-full bg-white/5 border-b border-white/10 backdrop-blur-md overflow-hidden h-10 flex items-center">
          <div className="flex animate-marquee whitespace-nowrap gap-8 items-center px-8">
            {isMarketLoading ? (
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">Cargando mercados en vivo...</span>
            ) : (
              marketData.map((m, i) => (
                <div key={m.symbol} className="flex items-center gap-2 group cursor-default">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{m.symbol}</span>
                  <span className="text-xs font-bold text-white">{m.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <span className={`text-[10px] font-bold flex items-center ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {m.change >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-1" /> : <TrendingDown className="w-2.5 h-2.5 mr-1" />}
                    {m.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))
            )}
            {/* Duplicated for smooth loop if needed - for now static is fine as it wraps or we can add more */}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="p-8 max-w-6xl mx-auto z-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mb-2"
              >
                {isUserLoading
                  ? "Cargando..."
                  : userName
                  ? `Hola, ${userName} 👋`
                  : "Hola de nuevo 👋"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/60"
              >
                Aquí tienes un resumen de tu situación financiera.
              </motion.p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadReport}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-sm"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Descargar Informe
              </button>

              <Link
                href="/dashboard/asesor"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-full text-white font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Asesor IA
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </header>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Inversión Total</span>
              </div>
              <div className="text-2xl font-black text-white">
                {portfolioLoading ? <span className="opacity-30 text-base">Cargando...</span> : displayInvested > 0 ? `${displayInvested.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €` : "-- €"}
              </div>
              <div className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                {displayCurrentValue !== displayInvested && displayCurrentValue > 0
                  ? <><Activity className="w-3 h-3" /> Valor actual: {displayCurrentValue.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €</>
                  : <><Activity className="w-3 h-3" /> {portfolioAssets.length} activos en cartera</>
                }
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 blur-2xl transition-all" style={{ background: displayProfit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }} />
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${displayProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {displayProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Beneficio Neto</span>
              </div>
              <div className={`text-2xl font-black ${displayProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {portfolioLoading ? <span className="opacity-30 text-base text-white">Cargando...</span> : displayInvested > 0 ? `${displayProfit >= 0 ? '+' : ''}${displayProfit.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €` : "-- €"}
              </div>
              <div className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                {displayInvested > 0 && <span className={displayProfitPct >= 0 ? 'text-emerald-500/60' : 'text-red-500/60'}>{displayProfitPct >= 0 ? '+' : ''}{displayProfitPct.toFixed(1)}% rentabilidad total</span>}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cap. Ahorro / mes</span>
              </div>
              <div className="text-2xl font-black text-white">
                {dashboardStats.monthlyIncome > 0 ? `${(dashboardStats.monthlyIncome - dashboardStats.monthlyExpenses).toLocaleString("es-ES")} €` : "-- €"}
              </div>
              <div className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                <Percent className="w-3 h-3" /> Ratio: {dashboardStats.savingsRate.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Oportunidad Fiscal</span>
              </div>
              <div className="text-2xl font-black text-white">
                {dashboardStats.monthlyIncome <= 0
                  ? "Sin datos"
                  : dashboardStats.monthlyIncome * 12 > 40000
                  ? "Tramo 37%+"
                  : "Tramo optimizado"}
              </div>
              <div className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                <Link href="/dashboard/asesor" className="hover:text-emerald-400 transition-colors">Solicitar estudio fiscal →</Link>
              </div>
            </motion.div>
          </div>

          {/* Portfolio Quick Summary — only shown when assets are loaded */}
          {!portfolioLoading && portfolioAssets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl border border-indigo-500/10 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-400" />
                  Resumen de Cartera
                </h3>
                <Link href="/dashboard/cartera" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                  Ver todo <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {typeBreakdownSorted.map(([type, value], i) => {
                  const pct = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;
                  const colors = ['bg-indigo-500', 'bg-orange-500', 'bg-blue-500', 'bg-yellow-500', 'bg-emerald-500'];
                  return (
                    <div key={type} className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold truncate">{type}</span>
                      </div>
                      <div className="text-sm font-black text-white">{value.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €</div>
                      <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%`, opacity: 0.7 }} />
                      </div>
                      <div className="text-[10px] text-white/20 mt-0.5">{pct.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Resum Breakdown — shown when Resum sheet data is available */}
          {hasResumenBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl border border-emerald-500/10 mb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Desglose por Categoría
                  <span className="text-[10px] text-emerald-400/60 font-normal ml-1">desde hoja Resum</span>
                </h3>
                <div className="text-xs text-white/30">
                  Total: {displayInvested.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {resumenBreakdown.map(({ label, value, color, icon }) => {
                  const pct = displayInvested > 0 ? (value / displayInvested) * 100 : 0;
                  return (
                    <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1 truncate">{label}</div>
                      <div className="text-sm font-black text-white">{value.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €</div>
                      <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%`, opacity: 0.8 }} />
                      </div>
                      <div className="text-[10px] text-white/20 mt-0.5">{pct.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left section: Uploader */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Fuente de Datos</h3>
                </div>
                <UniversalUploader />
              </section>

              {/* Success banner */}
              {summary && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-2xl border border-emerald-500/30"
                >
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    Datos listos para análisis
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {summary.fileType === 'pdf' ? (
                      <>Hemos procesado el archivo <strong className="text-white">{summary.fileName}</strong>. Tu asesor IA ya puede leer su contenido.</>
                    ) : (
                      <>Hemos detectado <strong className="text-white">{summary.totalSheets} pestañas</strong> con un total de <strong className="text-white">{summary.totalRows} registros</strong> en <strong className="text-white">{summary.fileName}</strong>.</>
                    )}
                  </p>

                  {/* Numeric totals chips from the first sheet (usually the summary sheet) */}
                  {summary.fileType === 'tabular' && summary.sheets.length > 0 && summary.sheets[0].numericTotals && Object.keys(summary.sheets[0].numericTotals).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      <div className="w-full text-[10px] uppercase tracking-wider text-white/30 mb-1">Resumen: {summary.sheets[0].name}</div>
                      {Object.entries(summary.sheets[0].numericTotals).map(([col, total]) => (
                        <span
                          key={col}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70"
                        >
                          <Table2 className="w-3 h-3 text-emerald-400" />
                          {col}: <span className="text-white">{total.toLocaleString("es-ES", { maximumFractionDigits: 2 })}</span>
                        </span>
                      ))}
                    </div>
                  )}


                  <Link
                    href="/dashboard/asesor"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Analizar con IA
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.section>
              )}
            </div>

            {/* Right section: AI panel */}
            <div className="space-y-6">
              {/* Proactive Insights Panel */}
              <AIInsightsPanel insights={generateInsightsFromData(dashboardStats)} />

              <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] h-full min-h-[400px] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Análisis IA</h4>
                    <p className="text-xs text-white/50">En tiempo real</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-white/40">
                  {summary ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <Bot className="w-16 h-16 mx-auto mb-4 text-emerald-400 opacity-80" />
                      <p className="text-white/80 max-w-[250px] mx-auto text-sm leading-relaxed">
                        {summary.fileType === 'pdf' ? (
                          <>He analizado tu <strong className="text-emerald-300">documento PDF</strong>. Ve al chat para hacerme preguntas sobre él.</>
                        ) : (
                          <>He cargado tus <strong className="text-emerald-300">{summary.totalRows} registros</strong>. Ve al chat para hacerme preguntas sobre ellos.</>
                        )}
                      </p>
                      <Link
                        href="/dashboard/asesor"
                        className="mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-full glass border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors text-sm font-medium"
                      >
                        Ir al chat <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm max-w-[200px] mx-auto">
                        Sube un archivo Excel o PDF para que pueda generar insights y recomendaciones sobre tus finanzas.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tools Area */}
          <div className="mt-8">
            <IndependenceSimulator />
          </div>
        </div>
      </main>
    </div>
  );
}
