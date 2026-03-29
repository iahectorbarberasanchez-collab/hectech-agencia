"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Sparkles, TrendingUp, Wallet, ShieldAlert } from "lucide-react";
import { FinancialInsight } from "@/lib/insight-rules";

interface AIInsightsPanelProps {
  insights: FinancialInsight[];
}

export default function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center opacity-40">
        <Sparkles className="w-8 h-8 mb-2 text-white/20" />
        <p className="text-sm font-medium">Sube tus datos para que pueda darte consejos de asesoría real.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-black uppercase tracking-widest text-white/60">Notificaciones del Asesor</h4>
      </div>

      <AnimatePresence mode="popLayout">
        {insights.map((insight, idx) => (
          <motion.div
            key={`${insight.title}-${idx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-4 rounded-2xl border relative overflow-hidden group ${
              insight.type === 'alert' ? 'border-red-500/20' : 
              insight.type === 'success' ? 'border-emerald-500/20' : 'border-blue-500/20'
            }`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 transition-opacity group-hover:opacity-20 ${
              insight.type === 'alert' ? 'bg-red-500' : 
              insight.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />

            <div className="flex gap-4 relative z-10">
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                insight.type === 'alert' ? 'bg-red-500/10 text-red-400' : 
                insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {insight.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> : 
                 insight.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {insight.title}
                  </h5>
                  {insight.impact && (
                    <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${
                      insight.type === 'alert' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    }`}>
                      {insight.impact}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-medium">
                  {insight.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
