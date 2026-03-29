"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";
import { 
  Plus, Trash2, Edit2, Save, X, TrendingUp, 
  PieChart as PieIcon, Briefcase, AlertCircle, RefreshCcw, 
  ArrowRight, CheckCircle2, Wallet, TrendingDown, DollarSign
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { supabase, PortfolioAsset } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { generateFinancialReport } from "@/lib/report-generator";
import { generateInsightsFromData } from "@/lib/insight-rules";
import { getDashboardSummary } from "@/lib/portfolio-utils";
import { useFinancial } from "@/context/FinancialContext";
import { MarketQuote } from "@/types/market";
import { Globe, ExternalLink, Zap, RefreshCw, FileText, Download } from "lucide-react";

const ASSET_TYPE_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  "Acción": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  "ETF": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  "Cripto": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  "Oro": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  "Cash": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "Inmuebles": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  "Otros": { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" }
};

const ASSET_TYPES = Object.keys(ASSET_TYPE_COLORS);

const COLORS = ["#6366f1", "#818cf8", "#ec4899", "#fcd34d", "#10b981", "#a855f7", "#9ca3af"];

export default function CarteraPage() {
  const router = useRouter();
  const { user, userId, isLoading: isUserLoading } = useUser();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { summary } = useFinancial();
  const [newAsset, setNewAsset] = useState<Partial<PortfolioAsset>>({
    asset_name: "",
    asset_type: "Acción",
    ticker: "",
    quantity: 0,
    purchase_price: 0,
    allocation_percent: 0,
    target_percent: 0,
    value_eur: 0
  });
  const [marketQuotes, setMarketQuotes] = useState<Record<string, MarketQuote>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userId) fetchPortfolio();
  }, [userId]);

  async function fetchPortfolio() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_portfolio")
      .select("*")
      .eq("user_id", userId)
      .order("value_eur", { ascending: false });

    if (!error && data) {
      setAssets(data);
      // Tras cargar de DB, buscamos precios reales si hay tickers
      const tickers = data.map(a => a.ticker).filter(Boolean) as string[];
      if (tickers.length > 0) {
        syncMarketPrices(tickers);
      }
    }
    setIsLoading(false);
  }

  async function syncMarketPrices(tickers: string[]) {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/market?symbols=${tickers.join(',')}`);
      const json = await res.json();
      
      if (json.success && json.data) {
        const quotesMap: Record<string, MarketQuote> = {};
        json.data.forEach((q: MarketQuote) => {
          quotesMap[q.symbol.toUpperCase()] = q;
          // También guardamos sin el sufijo .MC o -USD para facilitar búsqueda
          const base = q.symbol.split('.')[0].split('-')[0].toUpperCase();
          quotesMap[base] = q;
        });
        setMarketQuotes(quotesMap);
      }
    } catch (e) {
      console.error("Error syncing prices:", e);
    } finally {
      setIsRefreshing(false);
    }
  }

  const handleDownloadReport = async () => {
    setIsGenerating(true);
    try {
      const stats = getDashboardSummary(summary);
      generateFinancialReport({
        userName: user?.email?.split('@')[0] || "Usuario",
        date: new Date().toLocaleDateString('es-ES'),
        stats,
        assets,
        quotes: marketQuotes,
        insights: generateInsightsFromData(stats)
      });
    } catch (e) {
      console.error("Error generating report:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  async function handleAddAsset() {
    if (!newAsset.asset_name || !newAsset.value_eur) return;

    const { data, error } = await supabase
      .from("user_portfolio")
      .insert([{
        ...newAsset,
        user_id: userId,
        allocation_percent: calculatePercent(newAsset.value_eur || 0)
      }])
      .select();

    if (!error && data) {
      setAssets([...assets, data[0]]);
      setIsAdding(false);
      setNewAsset({ 
        asset_name: "", 
        asset_type: "Acción", 
        ticker: "",
        quantity: 0,
        purchase_price: 0,
        allocation_percent: 0, 
        target_percent: 0, 
        value_eur: 0 
      });
      fetchPortfolio(); // Recalcular todo incluyendo el nuevo ticker
    }
  }

  async function handleDeleteAsset(id: string) {
    const { error } = await supabase
      .from("user_portfolio")
      .delete()
      .eq("id", id);

    if (!error) {
      setAssets(assets.filter(a => a.id !== id));
      fetchPortfolio();
    }
  }

  const totalValue = assets.reduce((sum, a) => {
    const quote = a.ticker ? marketQuotes[a.ticker.toUpperCase()] : null;
    const currentPrice = quote?.price || 0;
    const value = (a.quantity && currentPrice > 0) ? (a.quantity * currentPrice) : a.value_eur;
    return sum + value;
  }, 0);

  const totalInvested = assets.reduce((sum, a) => {
    return sum + ((a.quantity || 0) * (a.purchase_price || 0) || a.value_eur);
  }, 0);

  const totalProfit = totalValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  
  const calculatePercent = (val: number) => {
    if (totalValue === 0) return 100;
    return (val / (totalValue + (isAdding ? (newAsset.value_eur || 0) : 0))) * 100;
  };

  const chartData = assets.map(a => {
    const quote = a.ticker ? marketQuotes[a.ticker.toUpperCase()] : null;
    const currentPrice = quote?.price || 0;
    const val = (a.quantity && currentPrice > 0) ? (a.quantity * currentPrice) : a.value_eur;
    return {
      name: a.asset_name,
      value: val,
      percent: totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0"
    };
  });

  const rebalanceData = assets.map(a => {
    const quote = a.ticker ? marketQuotes[a.ticker.toUpperCase()] : null;
    const currentPrice = quote?.price || 0;
    const val = (a.quantity && currentPrice > 0) ? (a.quantity * currentPrice) : a.value_eur;
    return {
      name: a.asset_name,
      actual: totalValue > 0 ? (val / totalValue) * 100 : 0,
      objetivo: a.target_percent || 0
    };
  });

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="p-8 max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Briefcase className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Mi Patrimonio</h2>
              </motion.div>
              <p className="text-white/40 text-sm max-w-md">Portafolio inteligente: monitorea y optimiza tu asignación de activos en tiempo real.</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadReport}
                disabled={isGenerating}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                title="Descargar informe PDF"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const tickers = assets.map(a => a.ticker).filter(Boolean) as string[];
                  if (tickers.length > 0) syncMarketPrices(tickers);
                }}
                disabled={isRefreshing}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                title="Refrescar precios"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAdding(!isAdding)}
                className={`flex items-center gap-2 ${isAdding ? 'bg-white/10 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/10 border border-white/10 text-sm`}
              >
                {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isAdding ? 'Cancelar' : 'Añadir Activo'}
              </motion.button>
              <Link 
                href="/dashboard/asesor"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-emerald-300 font-bold transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                Asesor IA
              </Link>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Valor Actual", value: totalValue, icon: Briefcase, color: "indigo", suffix: "€" },
              { label: "Inversión Total", value: totalInvested, icon: Wallet, color: "blue", suffix: "€" },
              { 
                label: "Beneficio Neto", 
                value: totalProfit, 
                icon: totalProfit >= 0 ? TrendingUp : TrendingDown, 
                color: totalProfit >= 0 ? "emerald" : "red", 
                suffix: `€ (${totalProfitPercent.toFixed(1)}%)` 
              }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card relative overflow-hidden p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-all`} />
                
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center border border-${stat.color}-500/20`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <p className="text-white/40 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-white">
                    {stat.value.toLocaleString("es-ES")}
                  </h3>
                  {stat.suffix && <span className="text-xl font-bold text-white/40">{stat.suffix}</span>}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List Table */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {isAdding && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    className="glass-card p-6 rounded-3xl border border-emerald-500/20 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h4 className="font-bold text-white text-lg">Nuevo Activo</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nombre (Ej: Bitcoin)</label>
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Nombre del activo"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                          value={newAsset.asset_name}
                          onChange={e => setNewAsset({...newAsset, asset_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Ticker / Símbolo</label>
                        <input 
                          type="text" 
                          placeholder="Ej: BTC-USD o AAPL"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all uppercase"
                          value={newAsset.ticker}
                          onChange={e => setNewAsset({...newAsset, ticker: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Tipo de Activo</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all appearance-none"
                          value={newAsset.asset_type}
                          onChange={e => setNewAsset({...newAsset, asset_type: e.target.value})}
                        >
                          {ASSET_TYPES.map(t => <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Cantidad Poseída</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                          value={newAsset.quantity || ""}
                          onChange={e => setNewAsset({...newAsset, quantity: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Precio de Compra Medio (€)</label>
                        <input 
                          type="number" 
                          placeholder="Precio unitario pagado"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                          value={newAsset.purchase_price || ""}
                          onChange={e => {
                            const price = Number(e.target.value);
                            setNewAsset({...newAsset, purchase_price: price, value_eur: price * (newAsset.quantity || 0)});
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Valoración Directa (Alternativo)</label>
                        <input 
                          type="number" 
                          placeholder="Solo si no usas Ticker"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all opacity-50"
                          value={newAsset.value_eur || ""}
                          onChange={e => setNewAsset({...newAsset, value_eur: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handleAddAsset}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Guardar Activo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-lg">Mis Activos</h4>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mt-1">Distribución en tiempo real</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black italic border-b border-white/5">
                        <th className="px-8 py-5">Activo</th>
                        <th className="px-8 py-5">Tipo</th>
                        <th className="px-8 py-5 text-right">Valor (€)</th>
                        <th className="px-8 py-5 text-right">Actual %</th>
                        <th className="px-8 py-5 text-right">Objetivo</th>
                        <th className="px-8 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                      {assets.map((asset, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={asset.id} 
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{asset.asset_name}</span>
                              <span className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">{asset.ticker || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${ASSET_TYPE_COLORS[asset.asset_type]?.bg || 'bg-white/5'} ${ASSET_TYPE_COLORS[asset.asset_type]?.text || 'text-white/40'} border ${ASSET_TYPE_COLORS[asset.asset_type]?.border || 'border-white/5'}`}>
                                {asset.asset_type}
                              </span>
                              <span className="text-[10px] text-white/30 ml-0.5">{asset.quantity || 0} und.</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex flex-col">
                              <span className="font-mono text-white/80 font-bold">
                                {(() => {
                                  const quote = asset.ticker ? marketQuotes[asset.ticker.toUpperCase()] : null;
                                  const price = quote?.price || 0;
                                  const val = (asset.quantity && price > 0) ? (asset.quantity * price) : asset.value_eur;
                                  return val.toLocaleString("es-ES", { maximumFractionDigits: 0 });
                                })()}
                                <span className="text-[10px] opacity-40 ml-1">€</span>
                              </span>
                              <span className="text-[10px] text-white/30">
                                {asset.ticker ? `${marketQuotes[asset.ticker.toUpperCase()]?.price?.toLocaleString("es-ES") || '--'} €/u` : `${asset.value_eur} €`}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex flex-col items-end">
                              {(() => {
                                const quote = asset.ticker ? marketQuotes[asset.ticker.toUpperCase()] : null;
                                const currentPrice = quote?.price || 0;
                                if (!asset.purchase_price || !currentPrice) return <span className="text-white/20 text-xs">--</span>;
                                
                                const profit = currentPrice - asset.purchase_price;
                                const profitPercent = (profit / asset.purchase_price) * 100;
                                const totalProfitEur = profit * (asset.quantity || 0);

                                return (
                                  <>
                                    <span className={`text-xs font-black flex items-center gap-1 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {profit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                      {Math.abs(profitPercent).toFixed(1)}%
                                    </span>
                                    <span className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-500/50' : 'text-red-500/50'}`}>
                                      {profit >= 0 ? '+' : ''}{totalProfitEur.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-white font-black text-xs">
                                {(() => {
                                  const quote = asset.ticker ? marketQuotes[asset.ticker.toUpperCase()] : null;
                                  const currentPrice = quote?.price || 0;
                                  const val = (asset.quantity && currentPrice > 0) ? (asset.quantity * currentPrice) : asset.value_eur;
                                  return ((val / totalValue) * 100).toFixed(1);
                                })()}%
                              </span>
                              <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500" 
                                  style={{ width: `${(asset.value_eur / totalValue) * 100}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => asset.id && handleDeleteAsset(asset.id)}
                              className="w-10 h-10 rounded-xl bg-red-400/5 text-red-400/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}

                      {assets.length === 0 && !isAdding && (
                        <tr>
                          <td colSpan={6} className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative">
                                <Briefcase className="w-10 h-10 text-white/10" />
                                <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-white font-bold text-lg">Tu cartera está vacía</p>
                                <p className="text-white/30 text-xs">Añade tu primer activo para empezar a gestionar tu patrimonio.</p>
                              </div>
                              <button 
                                onClick={() => setIsAdding(true)}
                                className="mt-4 px-8 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-2xl text-xs font-bold transition-all border border-emerald-500/20"
                              >
                                Añadir mi primer activo
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tips Section */}
              <div className="glass-card p-8 rounded-3xl border border-indigo-500/10 flex items-start gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                  <RefreshCcw className="w-7 h-7 text-indigo-400 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg mb-2">Estrategia: Rebalanceo</h4>
                  <p className="text-sm text-white/40 leading-relaxed max-w-xl">
                    El rebalanceo automático permite mantener tu perfil de riesgo bajo control. 
                    Vender activos sobreponderados y comprar infravalorados es la clave para maximizar 
                    el interés compuesto a largo plazo.
                  </p>
                </div>
              </div>
            </div>

            {/* Charts & Analysis */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
                <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-emerald-400" />
                  Distribución Actual
                </h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-white/60">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name} ({entry.percent}%)
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/5 h-[300px] flex flex-col">
                <h4 className="font-semibold text-white mb-6">Deriva de Cartera (Drift)</h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rebalanceData}>
                      <XAxis dataKey="name" hide />
                      <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual %" />
                      <Bar dataKey="objetivo" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Objetivo %" />
                      <Tooltip 
                         cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                         contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-white/40 mt-4 text-center">Compara tu asignación real vs la deseada.</p>
              </div>

              <Link 
                href="/dashboard/asesor"
                className="group w-full glass-card p-6 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center justify-between text-left"
              >
                <div>
                  <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Asesoramiento Experto
                  </h4>
                  <p className="text-xs text-white/60 mt-1">Pregúntale a la IA cómo optimizar hoy.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
