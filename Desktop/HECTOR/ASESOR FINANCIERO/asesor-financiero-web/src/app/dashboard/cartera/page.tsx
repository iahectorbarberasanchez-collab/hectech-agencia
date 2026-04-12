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
  "Criptomoneda": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  "Materias Primas": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  "Oro": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  "Cash": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "Inmuebles": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  "Inversión": { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
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
  const [showAll, setShowAll] = useState(false);
  const [filterType, setFilterType] = useState<string>("Todos");
  const [sortBy, setSortBy] = useState<string>("valor_desc");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const PAGE_SIZE = 20;

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

  // Tickers that are currencies/stablecoins — never fetch a market price for these
  const CASH_TICKERS = new Set(['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD',
    'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'CASH']);

  async function syncMarketPrices(tickers: string[]) {
    setIsRefreshing(true);
    try {
      // Extract raw tickers, handling "Bitcoin · Trade Republic" format
      // Skip cash/stablecoin tickers — their value never changes
      const rawTickers = tickers.map(t =>
        t.toUpperCase().split('·')[0].trim().split(' ')[0]
      ).filter(t => t && !CASH_TICKERS.has(t));

      const res = await fetch(`/api/market?symbols=${rawTickers.join(',')}`);
      const json = await res.json();

      if (json.success && json.data) {
        const quotesMap: Record<string, MarketQuote> = {};
        json.data.forEach((q: MarketQuote) => {
          const sym = q.symbol.toUpperCase();
          quotesMap[sym] = q;
          // Also map base ticker without exchange suffix: BTC-EUR → BTC, ASML.AS → ASML
          const base = sym.split('.')[0].split('-')[0];
          quotesMap[base] = q;
          // Map crypto-EUR back: BTC-EUR → BTCEUR
          if (sym.includes('-')) {
            const [cryptoBase, curr] = sym.split('-');
            quotesMap[`${cryptoBase}${curr}`] = q; // BTCEUR, BTCUSD
            quotesMap[`${cryptoBase}USDT`] = q;    // BTCUSDT
          }
        });
        setMarketQuotes(quotesMap);
      }
    } catch (e) {
      console.error("Error syncing prices:", e);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Helper: look up market quote for an asset, handling raw tickers like BTCEUR/ETHEUR
  const getQuoteForAsset = (asset: PortfolioAsset): MarketQuote | null => {
    if (!asset.ticker) return null;
    const t = asset.ticker.toUpperCase().split('·')[0].trim().split(' ')[0];

    // Try direct lookup first
    if (marketQuotes[t]) return marketQuotes[t];

    // Try with suffix stripped
    const base = t.replace(/USDT$/, '').replace(/USDC$/, '').replace(/EUR$/, '').replace(/USD$/, '');
    if (marketQuotes[`${base}-EUR`]) return marketQuotes[`${base}-EUR`];
    if (marketQuotes[`${base}-USD`]) return marketQuotes[`${base}-USD`];
    if (marketQuotes[base]) return marketQuotes[base];

    return null;
  };

  // Helper: split "Bitcoin · Trade Republic" into { name, platform }
  const parseName = (asset: PortfolioAsset) => {
    const parts = (asset.asset_name || '').split('·');
    return {
      name: parts[0].trim(),
      platform: parts[1]?.trim() || null,
    };
  };

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

  async function handleClearPortfolio() {
    const { error } = await supabase
      .from("user_portfolio")
      .delete()
      .eq("user_id", userId);
    if (!error) {
      setAssets([]);
      setShowClearConfirm(false);
    }
  }

  const totalValue = assets.reduce((sum, a) => {
    const quote = getQuoteForAsset(a);
    const currentPrice = quote?.price || 0;
    const value = (a.quantity && currentPrice > 0) ? (a.quantity * currentPrice) : a.value_eur;
    return sum + value;
  }, 0);

  const totalInvested = assets.reduce((sum, a) => {
    return sum + ((a.quantity || 0) * (a.purchase_price || 0) || a.value_eur);
  }, 0);

  const totalProfit = totalValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const filteredAssets = filterType === "Todos"
    ? assets
    : assets.filter(a => {
        const t = (a.asset_type || "").toLowerCase();
        const f = filterType.toLowerCase();
        return t === f || t.includes(f) || (f === 'cripto' && (t === 'criptomoneda' || t === 'crypto'));
      });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const getVal = (asset: PortfolioAsset) => {
      const quote = getQuoteForAsset(asset);
      const price = quote?.price || 0;
      return (asset.quantity && price > 0) ? (asset.quantity * price) : asset.value_eur;
    };
    if (sortBy === 'valor_desc') return getVal(b) - getVal(a);
    if (sortBy === 'valor_asc') return getVal(a) - getVal(b);
    if (sortBy === 'nombre') return (a.asset_name || '').localeCompare(b.asset_name || '');
    if (sortBy === 'tipo') return (a.asset_type || '').localeCompare(b.asset_type || '');
    return 0;
  });

  const calculatePercent = (val: number) => {
    if (totalValue === 0) return 100;
    return (val / (totalValue + (isAdding ? (newAsset.value_eur || 0) : 0))) * 100;
  };

  const chartData = assets.map(a => {
    const quote = getQuoteForAsset(a);
    const currentPrice = quote?.price || 0;
    const val = (a.quantity && currentPrice > 0) ? (a.quantity * currentPrice) : a.value_eur;
    return {
      name: parseName(a).name,
      value: val,
      percent: totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0"
    };
  });

  const rebalanceData = assets.map(a => {
    const quote = getQuoteForAsset(a);
    const currentPrice = quote?.price || 0;
    const val = (a.quantity && currentPrice > 0) ? (a.quantity * currentPrice) : a.value_eur;
    return {
      name: parseName(a).name,
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
                onClick={() => setShowClearConfirm(true)}
                className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Limpiar toda la cartera"
              >
                <Trash2 className="w-5 h-5" />
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

          {/* Portfolio KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="glass-card p-4 rounded-2xl border border-white/5"
            >
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">💰 Capital Invertido</div>
              <div className="text-xl font-black text-white">{totalInvested.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-4 rounded-2xl border border-white/5"
            >
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">📈 Valor Actual</div>
              <div className="text-xl font-black text-white">{totalValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`glass-card p-4 rounded-2xl border ${totalProfit >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}
            >
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">
                {totalProfit >= 0 ? '✅' : '❌'} Ganancia / Pérdida
              </div>
              <div className={`text-xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
              </div>
              <div className={`text-[11px] ${totalProfit >= 0 ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-4 rounded-2xl border border-white/5"
            >
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">🗂️ Activos</div>
              <div className="text-xl font-black text-white">{assets.length}</div>
              <div className="text-[11px] text-white/30">{new Set(assets.map(a => a.asset_type)).size} tipos</div>
            </motion.div>
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
                <div className="p-6 border-b border-white/5 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">Mis Activos</h4>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mt-1">
                        {filteredAssets.length} activos · Distribución en tiempo real
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white/60 outline-none cursor-pointer hover:bg-white/10 transition-all"
                      >
                        <option value="valor_desc" className="bg-slate-900">Valor ↓</option>
                        <option value="valor_asc" className="bg-slate-900">Valor ↑</option>
                        <option value="nombre" className="bg-slate-900">Nombre A-Z</option>
                        <option value="tipo" className="bg-slate-900">Tipo</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Todos", "Acción", "ETF", "Cripto", "Materias Primas", "Cash"].map(type => (
                      <button
                        key={type}
                        onClick={() => { setFilterType(type); setShowAll(false); }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          filterType === type
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10 hover:text-white/60'
                        }`}
                      >
                        {type}
                        {type !== "Todos" && (
                          <span className="ml-1 opacity-60">
                            ({assets.filter(a => {
                              const t = (a.asset_type || '').toLowerCase();
                              const f = type.toLowerCase();
                              return t === f || t.includes(f) || (f === 'cripto' && (t === 'criptomoneda' || t === 'crypto'));
                            }).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black italic border-b border-white/5">
                        <th className="px-6 py-5">Activo</th>
                        <th className="px-4 py-5 text-right">Precio Compra</th>
                        <th className="px-4 py-5 text-right">Precio Actual</th>
                        <th className="px-4 py-5 text-right">Valor (€)</th>
                        <th className="px-4 py-5 text-right">P&amp;L</th>
                        <th className="px-4 py-5 text-right">Peso %</th>
                        <th className="px-4 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                      {(showAll ? sortedAssets : sortedAssets.slice(0, PAGE_SIZE)).map((asset, idx) => {
                        const isCash = asset.asset_type === 'Cash' || CASH_TICKERS.has((asset.ticker || '').toUpperCase());
                        const quote = isCash ? null : getQuoteForAsset(asset);
                        const currentPrice = quote?.price || 0;
                        // Cash: value is fixed — no revaluation, no P&L
                        const currentValue = isCash
                          ? (asset.value_eur || 0)
                          : (asset.quantity && currentPrice > 0) ? asset.quantity * currentPrice : asset.value_eur;
                        // Only calculate P&L when we have a real purchase price — never fall back to value_eur as cost
                        const hasCost = !isCash && !!(asset.quantity && asset.purchase_price && asset.purchase_price > 0);
                        const invested = hasCost ? asset.quantity! * asset.purchase_price! : (asset.value_eur || 0);
                        const pnl = hasCost ? currentValue - invested : 0;
                        const pnlPct = hasCost && invested > 0 ? (pnl / invested) * 100 : 0;
                        const actualPct = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
                        const targetPct = asset.target_percent || 0;
                        const drift = actualPct - targetPct;
                        const { name: displayName, platform } = parseName(asset);
                        const colors = ASSET_TYPE_COLORS[asset.asset_type] || ASSET_TYPE_COLORS['Inversión'];

                        return (
                          <motion.tr
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            key={asset.id}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            {/* Activo */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white text-sm">{displayName}</span>
                                  {platform && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 text-white/30 border border-white/10">
                                      {platform}
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                                    {asset.asset_type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/30 font-mono uppercase">{asset.ticker || 'N/A'}</span>
                                  {asset.quantity ? <span className="text-[10px] text-white/20">{asset.quantity} und.</span> : null}
                                </div>
                              </div>
                            </td>
                            {/* Precio Compra */}
                            <td className="px-4 py-4 text-right">
                              {asset.purchase_price ? (
                                <span className="font-mono text-white/40 text-xs">
                                  {asset.purchase_price.toLocaleString('es-ES', { maximumFractionDigits: 2 })} €
                                </span>
                              ) : (
                                <span className="text-white/20 text-xs">--</span>
                              )}
                            </td>
                            {/* Precio Actual */}
                            <td className="px-4 py-4 text-right">
                              {currentPrice > 0 ? (
                                <div className="flex flex-col items-end">
                                  <span className="font-mono text-white/80 text-xs font-bold">
                                    {currentPrice.toLocaleString('es-ES', { maximumFractionDigits: currentPrice < 1 ? 6 : 2 })} €
                                  </span>
                                  {quote && (
                                    <span className={`text-[9px] font-bold ${quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-white/20 text-xs">--</span>
                              )}
                            </td>
                            {/* Valor */}
                            <td className="px-4 py-4 text-right">
                              <span className="font-mono text-white/80 font-bold text-sm">
                                {currentValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                <span className="text-[10px] opacity-40 ml-1">€</span>
                              </span>
                            </td>
                            {/* P&L */}
                            <td className="px-4 py-4 text-right">
                              {hasCost ? (
                                <div className="flex flex-col items-end">
                                  <span className={`text-xs font-black flex items-center gap-1 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €
                                  </span>
                                  <span className={`text-[9px] font-bold ${pnl >= 0 ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                                    {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-white/20 text-xs">--</span>
                              )}
                            </td>
                            {/* Peso % */}
                            <td className="px-4 py-4 text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-white font-black text-xs">{actualPct.toFixed(1)}%</span>
                                {targetPct > 0 && (
                                  <span className={`text-[9px] font-bold ${Math.abs(drift) > 5 ? (drift > 0 ? 'text-amber-400' : 'text-blue-400') : 'text-white/30'}`}>
                                    obj {targetPct.toFixed(1)}%
                                  </span>
                                )}
                                <div className="w-14 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(actualPct * 3, 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            {/* Delete */}
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => asset.id && handleDeleteAsset(asset.id)}
                                className="w-10 h-10 rounded-xl bg-red-400/5 text-red-400/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}

                      {!showAll && sortedAssets.length > PAGE_SIZE && (
                        <tr>
                          <td colSpan={7} className="px-8 py-4 text-center">
                            <button onClick={() => setShowAll(true)} className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2">
                              Ver todos los {sortedAssets.length} activos ({sortedAssets.length - PAGE_SIZE} más)
                            </button>
                          </td>
                        </tr>
                      )}

                      {assets.length === 0 && !isAdding && (
                        <tr>
                          <td colSpan={7} className="px-8 py-24 text-center">
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
              <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-emerald-400" />
                  Distribución Actual
                </h4>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.slice(0, 12)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.slice(0, 12).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#12121a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: 11 }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(v: any) => [`${Number(v).toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {chartData.slice(0, 12).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-white/60 truncate max-w-[120px]">{entry.name}</span>
                      </div>
                      <span className="text-white/40 shrink-0 ml-1">{entry.percent}%</span>
                    </div>
                  ))}
                  {chartData.length > 12 && (
                    <p className="text-[9px] text-white/20 text-center pt-1">+{chartData.length - 12} activos más</p>
                  )}
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

          {/* Clear Portfolio Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-8 rounded-3xl border border-red-500/20 max-w-md w-full mx-4 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Limpiar Cartera</h3>
                    <p className="text-white/40 text-sm">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                  Se eliminarán <strong className="text-white">{assets.length} activos</strong> de tu cartera.
                  Podrás volver a importarlos subiendo tu archivo Excel de nuevo.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-bold transition-all border border-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearPortfolio}
                    className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
                  >
                    Sí, limpiar todo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
      </main>
    </div>
  );
}
