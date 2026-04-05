"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Globe, Sparkles, AlertTriangle, Zap, Landmark, BarChart2 } from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

// --- MARKET QUOTE CARD ---
export function MarketQuoteCard({ data }: { data: any[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-2 w-full">
      {data.map((item, i) => {
        const isPositive = item.change >= 0;
        return (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 rounded-2xl border border-white/5 min-w-[200px] flex-1 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 blur-3xl opacity-20 -z-10 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">{item.exchange} | {item.type}</h4>
                <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{item.symbol}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-black text-white">
                {item.price.toLocaleString("es-ES", { style: "currency", currency: item.currency })}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className={isPositive ? 'text-emerald-400' : 'text-red-500'}>
                  {isPositive ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                </span>
                <span className="text-white/20">hoy</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
               <span className="text-[10px] text-white/30 truncate max-w-[120px]">{item.name}</span>
               <Globe className="w-3 h-3 text-white/20" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// --- PORTFOLIO DONUT CHART ---
export function PortfolioDistribution({ data }: { data: any[] }) {
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];
  
  const chartData = data.map(item => ({
    name: item.asset_name || item.name || item.symbol,
    value: item.value_eur || item.value || 0
  })).sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl border border-white/5 mt-2 w-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-white">Distribución de Cartera</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <ReTooltip 
                 contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid #ffffff10', borderRadius: '12px' }}
                 itemStyle={{ color: '#fff' }}
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] text-white/40 uppercase font-bold">Total</p>
            <p className="text-xl font-black text-white">{total.toLocaleString("es-ES", { maximumFractionDigits: 0 })}€</p>
          </div>
        </div>

        <div className="space-y-3">
          {chartData.slice(0, 5).map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-white/70 truncate max-w-[100px]">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-white">
                {((item.value / (total || 1)) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- ASSET COMPARISON TABLE ---
export function AssetComparison({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const metrics = [
    { label: "Precio", key: "price", formatter: (v: any) => `${v.toLocaleString("es-ES")}€` },
    { label: "Cambio %", key: "changePercent", formatter: (v: any) => `${v.toFixed(2)}%` },
    { label: "Mercado", key: "exchange", formatter: (v: any) => v },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-2xl border border-white/5 mt-2 overflow-hidden w-full"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-4 py-3 text-[10px] font-black uppercase text-white/40 tracking-widest">Métrica</th>
              {data.map(item => (
                <th key={item.symbol} className="px-4 py-3 text-xs font-bold text-emerald-400 min-w-[100px]">{item.symbol}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {metrics.map(metric => (
              <tr key={metric.key} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-xs text-white/60 font-medium">{metric.label}</td>
                {data.map(item => (
                  <td key={item.symbol} className="px-4 py-3 text-xs font-bold text-white">
                    {metric.formatter(item[metric.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// --- TAX OPTIMIZATION CARD ---
export function TaxOptimizationCard({ data }: { data: any }) {
  const { current, optimized, savings, suggestions } = data;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 rounded-2xl border border-emerald-500/20 mt-2 relative overflow-hidden w-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -z-10" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white uppercase text-xs tracking-widest">Optimización Fiscal 2025</h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
          ESTIMACIÓN
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] text-white/40 font-bold uppercase">Impacto Actual</p>
          <div className="text-2xl font-black text-white/60 line-through decoration-red-500/50">
            {Math.round(current.totalTax).toLocaleString("es-ES")} €
          </div>
          <p className="text-xs text-white/40">Tipo efectivo: {(current.effectiveRate * 100).toFixed(1)}%</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-emerald-400 font-bold uppercase">Tras Optimización</p>
          <div className="text-3xl font-black text-emerald-400">
            {Math.round(optimized.totalTax).toLocaleString("es-ES")} €
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
            <ArrowDownRight className="w-4 h-4" />
            Ahorro de {Math.round(savings).toLocaleString("es-ES")} €
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sugerencias Estratégicas</h4>
        {suggestions.map((s: any, i: number) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">{s.title}</p>
              <p className="text-[10px] text-white/50 leading-relaxed mb-1.5">{s.description}</p>
              <div className="text-[10px] text-emerald-400 font-bold">
                 Impacto: ~{Math.round(s.impact)}€
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <p className="text-[9px] text-white/20 italic leading-tight">
          Disclaimer: Estos cálculos son simulaciones basadas en la normativa de 2025. Se recomienda siempre validar con un asesor fiscal certificado.
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MACRO CONTEXT PANEL
// ─────────────────────────────────────────────────────────────────────────────

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  'extreme-fear':  { label: '😱 MIEDO EXTREMO', color: 'text-red-400',    bg: 'bg-red-500/10',     border: 'border-red-500/30',    icon: '💀' },
  'fear':          { label: '😰 MIEDO',          color: 'text-orange-400', bg: 'bg-orange-500/10',  border: 'border-orange-500/30', icon: '⚠️' },
  'neutral':       { label: '😐 NEUTRAL',         color: 'text-yellow-400', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30', icon: '⚖️' },
  'greed':         { label: '🤑 CODICIA',          color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '📈' },
  'extreme-greed': { label: '🔥 CODICIA EXTREMA', color: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: '🚀' },
};

function MacroQuote({ label, value, change, isYield = false }: { label: string; value?: number; change?: number; isYield?: boolean }) {
  if (!value) return null;
  const isPos = (change ?? 0) >= 0;
  const formatted = isYield
    ? `${value.toFixed(2)}%`
    : value >= 10000
      ? value.toLocaleString('es-ES', { maximumFractionDigits: 0 })
      : value >= 100
        ? value.toLocaleString('es-ES', { maximumFractionDigits: 2 })
        : value.toFixed(4);

  return (
    <div className="glass-card p-3 rounded-xl border border-white/5 flex flex-col gap-1 min-w-[110px]">
      <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold truncate">{label}</span>
      <span className="text-sm font-black text-white">{formatted}</span>
      {change !== undefined && (
        <span className={`text-[10px] font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPos ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </div>
  );
}

export function MacroPanel({ data }: { data: any }) {
  const { liveMarket, snapshot, sentiment } = data;

  const sentimentCfg = SENTIMENT_CONFIG[sentiment] ?? SENTIMENT_CONFIG['neutral'];

  // Build yield curve data for chart
  const yieldData = liveMarket?.bonds ? [
    { label: '3M', yield: liveMarket.bonds.usTBill?.price },
    { label: '5A', yield: liveMarket.bonds.us5y?.price },
    { label: '10A', yield: liveMarket.bonds.us10y?.price },
    { label: '30A', yield: liveMarket.bonds.us30y?.price },
  ].filter(d => d.yield != null) : [];

  const indices = liveMarket?.indices;
  const bonds = liveMarket?.bonds;
  const commodities = liveMarket?.commodities;
  const fx = liveMarket?.fx;
  const vix = liveMarket?.vix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-2 space-y-4"
    >
      {/* Header + Sentiment */}
      <div className={`flex items-center justify-between p-4 rounded-2xl ${sentimentCfg.bg} border ${sentimentCfg.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${sentimentCfg.bg} border ${sentimentCfg.border} flex items-center justify-center text-lg`}>
            {sentimentCfg.icon}
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Sentimiento Global de Mercado</p>
            <p className={`text-base font-black ${sentimentCfg.color}`}>{sentimentCfg.label}</p>
          </div>
        </div>
        {vix && (
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase">VIX</p>
            <p className={`text-2xl font-black ${vix.price >= 28 ? 'text-red-400' : vix.price >= 20 ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {vix.price.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {/* Indices */}
      {indices && (
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3" /> Índices Bursátiles
          </p>
          <div className="flex flex-wrap gap-2">
            <MacroQuote label="S&P 500" value={indices.sp500?.price} change={indices.sp500?.changePercent} />
            <MacroQuote label="NASDAQ" value={indices.nasdaq?.price} change={indices.nasdaq?.changePercent} />
            <MacroQuote label="IBEX 35" value={indices.ibex35?.price} change={indices.ibex35?.changePercent} />
            <MacroQuote label="Euro Stoxx 50" value={indices.eurostoxx50?.price} change={indices.eurostoxx50?.changePercent} />
            <MacroQuote label="DAX" value={indices.dax?.price} change={indices.dax?.changePercent} />
            <MacroQuote label="Nikkei 225" value={indices.nikkei?.price} change={indices.nikkei?.changePercent} />
          </div>
        </div>
      )}

      {/* Bonds + FX + Commodities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bonds && (
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Landmark className="w-3 h-3" /> Tipos USA
            </p>
            <div className="flex flex-col gap-2">
              <MacroQuote label="10A Treasury" value={bonds.us10y?.price} change={bonds.us10y?.changePercent} isYield />
              <MacroQuote label="30A Treasury" value={bonds.us30y?.price} change={bonds.us30y?.changePercent} isYield />
              <MacroQuote label="5A Treasury"  value={bonds.us5y?.price}  change={bonds.us5y?.changePercent}  isYield />
              <MacroQuote label="3M T-Bill"    value={bonds.usTBill?.price} change={bonds.usTBill?.changePercent} isYield />
            </div>
          </div>
        )}

        {commodities && (
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Materias Primas
            </p>
            <div className="flex flex-col gap-2">
              <MacroQuote label="Oro (USD/oz)"     value={commodities.gold?.price}     change={commodities.gold?.changePercent} />
              <MacroQuote label="Petróleo WTI"     value={commodities.oilWTI?.price}   change={commodities.oilWTI?.changePercent} />
              <MacroQuote label="Petróleo Brent"   value={commodities.oilBrent?.price} change={commodities.oilBrent?.changePercent} />
            </div>
          </div>
        )}

        {fx && (
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Divisas
            </p>
            <div className="flex flex-col gap-2">
              <MacroQuote label="EUR/USD" value={fx.eurusd?.price}    change={fx.eurusd?.changePercent} />
              <MacroQuote label="DXY (USD Index)" value={fx.usdIndex?.price} change={fx.usdIndex?.changePercent} />
            </div>
          </div>
        )}
      </div>

      {/* Yield Curve Chart */}
      {yieldData.length >= 3 && (
        <div className="glass-card p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">Curva de Tipos USA</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={yieldData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="label" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <ReTooltip
                contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '11px' }}
                formatter={(v: number) => [`${v.toFixed(2)}%`, 'Yield']}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Economic Snapshot — Temas y Riesgos */}
      {snapshot && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Temas Globales Clave
            </p>
            <ul className="space-y-2">
              {(snapshot.globalThemes as string[]).slice(0, 5).map((t, i) => (
                <li key={i} className="text-[11px] text-white/70 leading-snug">{t}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Riesgos Principales
            </p>
            <ul className="space-y-2">
              {(snapshot.keyRisks as string[]).slice(0, 5).map((r, i) => (
                <li key={i} className="text-[11px] text-amber-400/80 leading-snug">{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="text-[9px] text-white/20 text-right">
        Datos de mercado en tiempo real · Snapshot macro actualizado: {snapshot?.lastUpdated ?? '—'}
      </p>
    </motion.div>
  );
}
