"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, Cell,
  PieChart as RechartsPieChart, Pie
} from "recharts";
import { 
  Plus, Trash2, Save, X, Wallet, TrendingUp, TrendingDown, 
  Search, Filter, Calendar, Receipt, ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { supabase, Transaction } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

const CATEGORY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  "Vivienda": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  "Alimentación": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  "Transporte": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  "Ocio": { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  "Salario": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "Inversiones": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  "Suscripciones": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  "Salud": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  "Educación": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  "Otros": { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" }
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#06b6d4", "#2dd4bf", "#fbbf24", "#9ca3af"];

export default function TransaccionesPage() {
  const router = useRouter();
  const { user, userId, isLoading: isUserLoading } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    description: "",
    amount: 0,
    type: "expense",
    category: "Otros",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userId) fetchTransactions();
  }, [userId]);

  async function fetchTransactions() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setIsLoading(false);
  }

  async function handleAddTransaction() {
    if (!newTransaction.description || !newTransaction.amount) return;

    const { data, error } = await supabase
      .from("user_transactions")
      .insert([{
        ...newTransaction,
        user_id: userId
      }])
      .select();

    if (!error && data) {
      setTransactions([data[0], ...transactions]);
      setIsAdding(false);
      setNewTransaction({
        description: "",
        amount: 0,
        type: "expense",
        category: "Otros",
        date: new Date().toISOString().split('T')[0]
      });
    } else if (error) {
      console.error("Error adding transaction:", error);
      alert(`Error al añadir la transacción: ${error.message}. Si acabas de ejecutar el script SQL, por favor refresca la página.`);
    }
  }

  async function handleDeleteTransaction(id: string) {
    const { error } = await supabase
      .from("user_transactions")
      .delete()
      .eq("id", id);

    if (!error) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const balance = totalIncome - totalExpenses;

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => (b.value as number) - (a.value as number));

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="p-8 max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Mis Finanzas</h2>
              </motion.div>
              <p className="text-white/40 text-sm max-w-md">Controla y optimiza tu flujo de caja con análisis inteligente en tiempo real.</p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-2 ${isAdding ? 'bg-white/10 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/10 border border-white/10`}
            >
              {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isAdding ? 'Cancelar' : 'Nuevo Movimiento'}
            </motion.button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Ingresos Totales", value: totalIncome, icon: TrendingUp, color: "emerald" },
              { label: "Gastos Totales", value: totalExpenses, icon: TrendingDown, color: "red" },
              { label: "Balance Neto", value: balance, icon: Receipt, color: "indigo" }
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
                  <h3 className={`text-4xl font-black ${stat.label === 'Balance Neto' ? (balance >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
                    {Math.abs(stat.value).toLocaleString("es-ES")}
                  </h3>
                  <span className={`text-xl font-bold ${stat.color === 'emerald' ? 'text-emerald-400/50' : stat.color === 'red' ? 'text-red-400/50' : 'text-indigo-400/50'}`}>€</span>
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
                      <h4 className="font-bold text-white text-lg">Nuevo Movimiento</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Descripción</label>
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Ej: Suscripción Netflix"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                          value={newTransaction.description}
                          onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Cantidad (€)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                            value={newTransaction.amount || ""}
                            onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Fecha</label>
                        <input 
                          type="date" 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                          value={newTransaction.date}
                          onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Categoría</label>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all appearance-none"
                            value={newTransaction.category}
                            onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                          >
                            {CATEGORIES.map(t => <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Tipo</label>
                          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl h-[46px]">
                            <button 
                              onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                              className={`flex-1 rounded-xl text-[10px] font-bold uppercase transition-all ${newTransaction.type === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-white/30 hover:text-white/60'}`}
                            >Gasto</button>
                            <button 
                              onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                              className={`flex-1 rounded-xl text-[10px] font-bold uppercase transition-all ${newTransaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/30 hover:text-white/60'}`}
                            >Ingreso</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handleAddTransaction}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Guardar Movimiento
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-lg">Historial Reciente</h4>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mt-1">Últimos {transactions.length} movimientos</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative group">
                      <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Buscar por descripción..." 
                        className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500/50 w-full md:w-64 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-black italic border-b border-white/5">
                        <th className="px-8 py-5">Fecha</th>
                        <th className="px-8 py-5">Movimiento</th>
                        <th className="px-8 py-5">Estado</th>
                        <th className="px-8 py-5 text-right">Monto</th>
                        <th className="px-8 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                      {transactions.map((t, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={t.id} 
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-8 py-5 text-xs text-white/40 font-medium">
                            {new Date(t.date).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{t.description}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[t.category]?.bg || 'bg-white/5'} ${CATEGORY_COLORS[t.category]?.text || 'text-white/40'} border ${CATEGORY_COLORS[t.category]?.border || 'border-white/5'}`}>
                                  {t.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {t.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={`font-mono text-lg font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString("es-ES")} <span className="text-xs opacity-50 italic">€</span>
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => t.id && handleDeleteTransaction(t.id)}
                              className="w-10 h-10 rounded-xl bg-red-400/5 text-red-400/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}

                      {transactions.length === 0 && !isAdding && (
                        <tr>
                          <td colSpan={5} className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative">
                                <AlertCircle className="w-10 h-10 text-white/10" />
                                <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-white font-bold text-lg">Sin movimientos registrados</p>
                                <p className="text-white/30 text-xs">Comienza registrando tu primer ingreso o gasto.</p>
                              </div>
                              <button 
                                onClick={() => setIsAdding(true)}
                                className="mt-4 px-8 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-2xl text-xs font-bold transition-all border border-emerald-500/20"
                              >
                                Registrar mi primer movimiento
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Analysis Panel */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
                <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  Gastos por Categoría
                </h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value: any) => `${value?.toLocaleString("es-ES") || '0'} €`}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[9px] text-white/60">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-emerald-500/10">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Insight del mes
                </h4>
                {transactions.length > 0 ? (
                  <p className="text-sm text-white/60 leading-relaxed">
                    {balance >= 0 
                      ? `Vas por buen camino. Tienes un excedente de ${balance.toLocaleString("es-ES")}€ este mes. ¿Por qué no lo inviertes para acelerar tu libertad financiera?`
                      : `Tus gastos han superado tus ingresos este mes por ${Math.abs(balance).toLocaleString("es-ES")}€. Revisa tus categorías de mayor gasto como ${pieData[0]?.name || 'otros'}.`}
                  </p>
                ) : (
                  <p className="text-sm text-white/60 italic">Comienza a registrar tus movimientos para obtener insights personalizados.</p>
                )}
                
                <Link 
                  href="/dashboard/asesor"
                  className="mt-6 group w-full flex items-center justify-between text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Consultar plan de ahorro con IA
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
