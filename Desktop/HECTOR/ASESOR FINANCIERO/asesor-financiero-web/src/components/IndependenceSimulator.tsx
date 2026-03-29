"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Euro, TrendingUp, PiggyBank, Calendar } from "lucide-react";
import { useFinancial } from "@/context/FinancialContext";
import { getDashboardSummary } from "@/lib/portfolio-utils";
import { useEffect } from "react";

export default function IndependenceSimulator() {
  const { summary } = useFinancial();
  const [initialCapital, setInitialCapital] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(25);
  const [expectedReturn, setExpectedReturn] = useState(7); // % anual

  // Auto-fill from real data
  useEffect(() => {
    if (summary) {
      const stats = getDashboardSummary(summary);
      if (stats.netWorth > 0) setInitialCapital(Math.round(stats.netWorth));
      if (stats.monthlyIncome > 0) {
        const savings = stats.monthlyIncome - stats.monthlyExpenses;
        setMonthlyContribution(Math.max(0, Math.round(savings)));
      }
    }
  }, [summary]);

  const data = useMemo(() => {
    let currentCapital = initialCapital;
    const result = [];
    const monthlyRate = expectedReturn / 100 / 12;

    for (let i = 0; i <= years; i++) {
      if (i > 0) {
        for (let m = 0; m < 12; m++) {
          currentCapital = currentCapital * (1 + monthlyRate) + monthlyContribution;
        }
      }
      
      const aportado = initialCapital + monthlyContribution * 12 * i;
      const interes = currentCapital - aportado;
      
      result.push({
        year: i,
        total: Math.round(currentCapital),
        aportado: Math.round(aportado),
        interes: Math.round(interes)
      });
    }
    return result;
  }, [initialCapital, monthlyContribution, years, expectedReturn]);

  const finalAmount = data[data.length - 1].total;
  const targetIndependence = finalAmount * 0.04; // Regla del 4% (renta anual)
  const monthlyIndependence = targetIndependence / 12;

  // Formatter para números de la gráfica
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `€ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `€ ${(val / 1000).toFixed(0)}k`;
    return `€ ${val}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Simulador de Independencia Financiera
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Descubre el poder del interés compuesto y proyecta tu patrimonio futuro.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
          <p className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider mb-0.5">Patrimonio Proyectado</p>
          <p className="text-2xl font-bold text-emerald-400">
            {finalAmount.toLocaleString("es-ES")} €
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controles */}
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-white/70 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-emerald-400" /> Capital Inicial
              </label>
              <span className="text-sm font-medium">{initialCapital.toLocaleString("es-ES")} €</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-white/70 flex items-center gap-1.5">
                <Euro className="w-4 h-4 text-emerald-400" /> Ahorro Mensual
              </label>
              <span className="text-sm font-medium">{monthlyContribution.toLocaleString("es-ES")} €</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-white/70 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> Años vista
              </label>
              <span className="text-sm font-medium">{years} años</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-white/70 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Rentabilidad Anual Estimada
              </label>
              <span className="text-sm font-medium">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Resultado Mensual ("Sueldo" pasivo) */}
          <motion.div 
            key={monthlyIndependence}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
          >
            <p className="text-xs text-white/60 mb-1">Renta pasiva estimada (Regla 4%)</p>
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
              {monthlyIndependence.toLocaleString("es-ES", { maximumFractionDigits: 0 })} € / mes
            </p>
            <p className="text-[10px] text-white/40 mt-1 leading-tight">
              Calculado extrayendo un 4% anual de tu patrimonio total al final del periodo proyectado.
            </p>
          </motion.div>
        </div>

        {/* Gráfica */}
        <div className="lg:col-span-2 h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAportado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis 
                dataKey="year" 
                tickFormatter={(val) => `Año ${val}`} 
                stroke="#ffffff40" 
                fontSize={12} 
                tickMargin={10} 
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                stroke="#ffffff40" 
                fontSize={12} 
                tickMargin={10}
                width={70} 
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#ffffff20", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: any, name: any) => {
                  const label = name === "total" ? "Capital Total" : name === "aportado" ? "Capital Aportado" : "Interés Generado";
                  return [`${Number(value).toLocaleString("es-ES")} €`, label];
                }}
                labelFormatter={(label) => `Año ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="2"
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="total"
              />
              <Area 
                type="monotone" 
                dataKey="aportado" 
                stackId="1"
                stroke="#34d399" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAportado)" 
                name="aportado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
