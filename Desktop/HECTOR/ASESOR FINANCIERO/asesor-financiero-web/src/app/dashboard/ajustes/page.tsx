"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Lock, Palette, Globe, Moon, Sun, ShieldCheck,
  ChevronRight, CheckCircle2, ToggleLeft, ToggleRight
} from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/context/UserContext";

type Toggle = { id: string; label: string; description: string; enabled: boolean };

const initialToggles: Toggle[] = [
  { id: "notifications_email", label: "Alertas por email", description: "Recibe resúmenes financieros semanales en tu correo.", enabled: true },
  { id: "notifications_push", label: "Notificaciones push", description: "Alertas en tiempo real sobre cambios importantes.", enabled: false },
  { id: "ai_suggestions", label: "Sugerencias de la IA", description: "La IA analiza tus patrones para darte consejos proactivos.", enabled: true },
  { id: "two_factor", label: "Autenticación en dos pasos", description: "Añade una capa extra de seguridad a tu cuenta.", enabled: false },
  { id: "anonymous_data", label: "Datos anónimos", description: "Comparte datos anónimos para mejorar nuestros modelos de IA.", enabled: true },
];

type Theme = "dark" | "light" | "system";
type Language = "es" | "en" | "ca";

export default function AjustesPage() {
  const { userId, isLoading: isUserLoading } = useUser();
  const [toggles, setToggles] = useState<Toggle[]>(initialToggles);
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("es");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setToggles([
            { id: "notifications_email", label: "Alertas por email", description: "Recibe resúmenes financieros semanales en tu correo.", enabled: data.notifications_email },
            { id: "notifications_push", label: "Notificaciones push", description: "Alertas en tiempo real sobre cambios importantes.", enabled: data.notifications_push },
            { id: "ai_suggestions", label: "Sugerencias de la IA", description: "La IA analiza tus patrones para darte consejos proactivos.", enabled: data.ai_suggestions },
            { id: "two_factor", label: "Autenticación en dos pasos", description: "Añade una capa extra de seguridad a tu cuenta.", enabled: data.two_factor },
            { id: "anonymous_data", label: "Datos anónimos", description: "Comparte datos anónimos para mejorar nuestros modelos de IA.", enabled: data.anonymous_data },
          ]);
          setTheme(data.theme as Theme);
          setLanguage(data.language as Language);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleToggle = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const settingsData = {
        user_id: userId,
        theme,
        language,
        notifications_email: toggles.find(t => t.id === "notifications_email")?.enabled,
        notifications_push: toggles.find(t => t.id === "notifications_push")?.enabled,
        ai_suggestions: toggles.find(t => t.id === "ai_suggestions")?.enabled,
        two_factor: toggles.find(t => t.id === "two_factor")?.enabled,
        anonymous_data: toggles.find(t => t.id === "anonymous_data")?.enabled,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_settings")
        .upsert(settingsData, { onConflict: "user_id" });

      if (error) throw error;

      // Apply theme and save to localStorage
      if (theme === "light") {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      } else if (theme === "dark") {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      } else {
        // System
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isDark) {
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
        }
        localStorage.setItem("theme", "system");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white mb-1">Ajustes</h1>
            <p className="text-white/50">Personaliza tu experiencia en HecTechAI Advisor.</p>
          </motion.div>

          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-white/40">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm">Cargando tus ajustes...</p>
            </div>
          ) : (
            <>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ajustes guardados correctamente
                </motion.div>
              )}

          {/* Appearance */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Palette className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-white">Apariencia</h2>
            </div>
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-white/70 text-sm mb-3 font-medium">Tema de la interfaz</p>
                <div className="flex gap-3">
                  {(["dark", "light", "system"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all text-sm font-medium ${
                        theme === t
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "glass border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {t === "dark" && <Moon className="w-5 h-5" />}
                      {t === "light" && <Sun className="w-5 h-5" />}
                      {t === "system" && <Globe className="w-5 h-5" />}
                      {t === "dark" ? "Oscuro" : t === "light" ? "Claro" : "Sistema"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Language */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-white">Idioma y región</h2>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {(["es", "en", "ca"] as Language[]).map((lang) => {
                const labels = { es: "🇪🇸 Español", en: "🇬🇧 English", ca: "🏴󠁥󠁳󠁣󠁴󠁿 Català" };
                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/80 text-sm">{labels[lang]}</span>
                    {language === lang && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* Notifications & Privacy toggles */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-white">Notificaciones y privacidad</h2>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {toggles.map((toggle) => (
                <div key={toggle.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex-1 pr-6">
                    <p className="text-white text-sm font-medium">{toggle.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{toggle.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(toggle.id)}
                    className="shrink-0 transition-transform active:scale-95"
                    aria-label={toggle.enabled ? "Desactivar" : "Activar"}
                  >
                    {toggle.enabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-white/25" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Security */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-white">Seguridad</h2>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {[
                { label: "Cambiar contraseña", desc: "Actualiza tu contraseña de acceso" },
                { label: "Dispositivos conectados", desc: "Gestiona las sesiones activas de tu cuenta" },
                { label: "Exportar mis datos", desc: "Descarga una copia completa de tus datos" },
                { label: "Eliminar cuenta", desc: "Elimina permanentemente tu cuenta y datos", danger: true },
              ].map(({ label, desc, danger }) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors text-left group"
                >
                  <div>
                    <p className={`text-sm font-medium ${danger ? "text-rose-400" : "text-white"}`}>{label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${danger ? "text-rose-400" : "text-white/30"}`} />
                </button>
              ))}
            </div>
          </motion.section>

          {/* Save button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
