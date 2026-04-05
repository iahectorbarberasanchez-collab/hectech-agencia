"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { History, Bot, User, MessageSquare, Trash2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/lib/supabase/client";

interface ChatSession {
  id: string;
  created_at: string;
  messages: { role: string; content: string }[];
  message_count: number;
}

export default function HistorialPage() {
  const router = useRouter();
  const { user, userId, isLoading: isUserLoading } = useUser();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/auth");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!userId) return;
    const fetchSessions = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) {
        setSessions(
          data.map((row: any) => ({
            id: row.id,
            created_at: row.created_at,
            messages: row.messages ?? [],
            message_count: (row.messages ?? []).length,
          }))
        );
      }
      setIsLoading(false);
    };
    fetchSessions();
  }, [userId]);

  const deleteSession = async (id: string) => {
    const supabase = createClient();
    await supabase.from("user_chat_history").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <History className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Historial de Conversaciones</h1>
            <p className="text-xs text-white/40">{sessions.length} sesiones guardadas</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-white/30">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando historial...
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-white/5 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-white/20 mx-auto" />
            <p className="text-white/40">No hay conversaciones guardadas todavía.</p>
            <p className="text-white/20 text-sm">Las próximas sesiones con el Asesor IA se guardarán automáticamente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sessions.map((session) => {
                const isExpanded = expandedId === session.id;
                const date = new Date(session.created_at);
                const preview = session.messages.find(m => m.role === 'user')?.content?.slice(0, 100) ?? '—';

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="glass-card rounded-2xl border border-white/5 overflow-hidden"
                  >
                    {/* Session header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10">
                          <Bot className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5 truncate max-w-xs">{preview}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-white/30 font-bold">{session.message_count} mensajes</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                      </div>
                    </div>

                    {/* Messages */}
                    {isExpanded && (
                      <div className="border-t border-white/5 p-4 space-y-3 max-h-96 overflow-y-auto">
                        {session.messages.map((msg, i) => (
                          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-500/20 text-green-400'}`}>
                              {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            </div>
                            <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[80%] whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-white/5 text-white/80' : 'bg-emerald-600/70 text-white'}`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
