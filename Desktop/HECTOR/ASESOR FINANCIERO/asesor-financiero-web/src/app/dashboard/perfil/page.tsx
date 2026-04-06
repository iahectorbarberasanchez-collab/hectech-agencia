"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Briefcase, TrendingUp, ShieldCheck,
  Wallet, PiggyBank, Save, Edit3, CheckCircle2,
  Loader2, RefreshCw, Bot, AlertCircle, User,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

type UserProfile = {
  user_id?: string;
  financial_goal?: string;
  knowledge_level?: string;
  risk_tolerance?: string;
  monthly_income_range?: string;
  occupation?: string;
  monthly_income_exact?: number | null;
  family_status?: string;
  age_range?: string;
  monthly_savings_percent?: string;
  emergency_fund_status?: string;
  investment_horizon?: string;
  investment_priority?: string;
  preferred_assets?: string[];
  other_notes?: string;
  updated_at?: string;
};

const GOAL_MAP: Record<string, { label: string; icon: any; color: string }> = {
  emergency: { label: "Fondo de Emergencia", icon: ShieldCheck, color: "text-blue-400" },
  house:     { label: "Comprar una casa",     icon: Wallet,      color: "text-amber-400" },
  retirement:{ label: "Inversión Long-Term",  icon: PiggyBank,   color: "text-emerald-400" },
  growth:    { label: "Crecimiento Agresivo", icon: TrendingUp,  color: "text-emerald-400" },
};

const KNOWLEDGE_MAP: Record<string, string> = {
  beginner:     "Principiante",
  intermediate: "Básico (Ahorro / Presupuestos)",
  advanced:     "Inversor Activo (Acciones / Cripto)",
};

const RISK_MAP: Record<string, { label: string; color: string }> = {
  sell: { label: "Conservador — vendería en caída",   color: "text-red-400" },
  hold: { label: "Moderado — aguantaría la caída",    color: "text-amber-400" },
  buy:  { label: "Agresivo — compraría más barato",   color: "text-emerald-400" },
};

const INCOME_MAP: Record<string, string> = {
  low:      "< 1.500 €",
  mid:      "1.500 – 3.000 €",
  high:     "3.000 – 5.000 €",
  very_high:"> 5.000 €",
};

const FAMILY_MAP: Record<string, string> = {
  single:   "Soltero/a",
  couple:   "En pareja / Casado/a",
  children: "Con hijos/as",
};

const SAVINGS_MAP: Record<string, string> = {
  none: "No ahorro",
  low:  "< 10%",
  mid:  "10% – 20%",
  high: "> 20%",
};

const EMERGENCY_MAP: Record<string, string> = {
  none: "Sin fondo",
  "1-3m":"1 a 3 meses",
  "3-6m":"3 a 6 meses",
  "6m+": "+6 meses",
};

const HORIZON_MAP: Record<string, string> = {
  short:  "Corto (< 2 años)",
  medium: "Medio (2-7 años)",
  long:   "Largo (+7 años)",
};

const PRIORITY_MAP: Record<string, string> = {
  safety:   "Seguridad",
  balanced: "Equilibrio",
  profit:   "Rentabilidad",
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [isEditing, setIsEditing]   = useState(false);
  const [isSaving,  setIsSaving]    = useState(false);
  const [saveOk,    setSaveOk]      = useState(false);
  const [editForm,  setEditForm]    = useState<UserProfile>({});

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_financial_profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) console.error("Profile fetch error:", error.message);
    const loaded = data ?? {};
    setProfile(loaded);
    setEditForm(loaded);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_financial_profile")
        .upsert(
          { ...editForm, user_id: user.id, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      setProfile({ ...editForm, updated_at: new Date().toISOString() });
      setSaveOk(true);
      setIsEditing(false);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert("❌ Error al guardar perfil: " + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const set = (field: keyof UserProfile, value: string | number) =>
    setEditForm((p) => ({ ...p, [field]: value }));

  const lastUpdated = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleDateString("es-ES", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  const goalInfo = profile?.financial_goal ? GOAL_MAP[profile.financial_goal] : null;
  const GoalIcon = goalInfo?.icon ?? Wallet;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 relative overflow-y-auto">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="p-8 max-w-4xl mx-auto">
          {/* ── Header ── */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-10 gap-4 flex-wrap"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Mi Perfil Financiero</h1>
              <p className="text-white/50 text-sm">
                La memoria que tu Asesor IA tiene de ti.
                {lastUpdated && (
                  <span className="ml-2">
                    Actualizado:{" "}
                    <span className="text-emerald-400">{lastUpdated}</span>
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <AnimatePresence>
                {saveOk && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Guardado
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                onClick={fetchProfile}
                title="Refrescar datos"
                className="p-2.5 rounded-xl glass hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (isEditing) setIsEditing(false);
                  else setIsEditing(true);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isEditing
                    ? "glass text-white/60 hover:bg-white/5"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
                }`}
              >
                {isEditing
                  ? <><AlertCircle className="w-4 h-4" /> Cancelar</>
                  : <><Edit3 className="w-4 h-4" /> Editar Perfil</>}
              </button>
            </div>
          </motion.header>

          {/* ── Content ── */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!isEditing ? (
                /* ════ READ VIEW ════ */
                <motion.div
                  key="read"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* AI Memory banner */}
                  <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Brain className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        Memoria del Asesor IA
                        <span className="text-xs font-normal px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                          Activa
                        </span>
                      </h2>
                      <p className="text-white/50 text-sm leading-relaxed">
                        Tu asesor IA usa estos datos en cada consulta para darte consejos 100% personalizados.
                        Puedes editarlos aquí o simplemente decírselos en el chat — él los actualizará solo.
                      </p>
                    </div>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <ProfileCard
                      icon={<GoalIcon className={`w-5 h-5 ${goalInfo?.color ?? "text-white/30"}`} />}
                      label="Objetivo Principal"
                      value={goalInfo?.label}
                      empty="Sin definir"
                    />
                    <ProfileCard
                      icon={<Briefcase className="w-5 h-5 text-amber-400" />}
                      label="Ocupación"
                      value={profile?.occupation}
                      empty="No especificada"
                    />
                    <ProfileCard
                      icon={<User className="w-5 h-5 text-emerald-400" />}
                      label="Rango de Edad"
                      value={profile?.age_range}
                      empty="No específica"
                    />
                    <ProfileCard
                      icon={<Brain className="w-5 h-5 text-pink-400" />}
                      label="Situación Familiar"
                      value={profile?.family_status ? FAMILY_MAP[profile.family_status] : undefined}
                      empty="No especificada"
                    />
                    <ProfileCard
                      icon={<Wallet className="w-5 h-5 text-emerald-400" />}
                      label="Ingresos"
                      value={profile?.monthly_income_range ? INCOME_MAP[profile.monthly_income_range] : undefined}
                      empty="No especificado"
                    />
                    <ProfileCard
                      icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                      label="Ingresos Exactos"
                      value={
                        profile?.monthly_income_exact
                          ? `${profile.monthly_income_exact.toLocaleString("es-ES")} €/mes`
                          : undefined
                      }
                      empty="No especificados"
                    />
                    <ProfileCard
                      icon={<PiggyBank className="w-5 h-5 text-emerald-400" />}
                      label="Ahorro Mensual"
                      value={profile?.monthly_savings_percent ? SAVINGS_MAP[profile.monthly_savings_percent] : undefined}
                      empty="No especificado"
                    />
                    <ProfileCard
                      icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
                      label="Fondo Emergencia"
                      value={profile?.emergency_fund_status ? EMERGENCY_MAP[profile.emergency_fund_status] : undefined}
                      empty="No definido"
                    />
                    <ProfileCard
                      icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                      label="Horizonte Temporal"
                      value={profile?.investment_horizon ? HORIZON_MAP[profile.investment_horizon] : undefined}
                      empty="No definido"
                    />
                    <ProfileCard
                      icon={<Bot className="w-5 h-5 text-emerald-400" />}
                      label="Conocimiento"
                      value={profile?.knowledge_level ? KNOWLEDGE_MAP[profile.knowledge_level] : undefined}
                      empty="No especificado"
                    />
                    <ProfileCard
                      icon={
                        <ShieldCheck
                          className={`w-5 h-5 ${
                            profile?.risk_tolerance ? RISK_MAP[profile.risk_tolerance]?.color : "text-white/30"
                          }`}
                        />
                      }
                      label="Perfil de Riesgo"
                      value={profile?.risk_tolerance ? RISK_MAP[profile.risk_tolerance]?.label : undefined}
                      empty="No especificada"
                    />
                    <ProfileCard
                      icon={<Bot className="w-5 h-5 text-emerald-400" />}
                      label="Prioridad"
                      value={profile?.investment_priority ? PRIORITY_MAP[profile.investment_priority] : undefined}
                      empty="No definida"
                    />
                  </div>

                  {/* Notes */}
                  <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <h3 className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">
                      Notas adicionales de la IA
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        profile?.other_notes ? "text-white/80" : "text-white/25 italic"
                      }`}
                    >
                      {profile?.other_notes ||
                        "Sin notas. Cuéntale al asesor tus deudas, dependientes o situación actual — él las guardará aquí automáticamente."}
                    </p>
                  </div>

                  {/* Completion tip */}
                  {!profile?.occupation && !profile?.monthly_income_exact && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-4"
                    >
                      <User className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-white/70 font-medium mb-1">
                          Completa tu perfil para consejos más precisos
                        </p>
                        <p className="text-xs text-white/45 leading-relaxed">
                          Ve al chat y dile: <em>"Soy diseñador freelance y gano unos 2.800 € al mes"</em>. El asesor
                          lo guardará aquí de forma permanente.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* ════ EDIT VIEW ════ */
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="glass-card rounded-2xl p-8 border border-emerald-500/20 space-y-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-emerald-400" /> Edición Manual del Perfil
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FieldText
                        label="Ocupación / Profesión"
                        hint="Ej: Médico, Diseñador freelance..."
                        value={editForm.occupation ?? ""}
                        onChange={(v) => set("occupation", v)}
                        placeholder="Tu ocupación actual"
                      />
                      <FieldNumber
                        label="Ingresos netos exactos (€/mes)"
                        hint="Cantidad exacta si la conoces"
                        value={editForm.monthly_income_exact ?? ""}
                        onChange={(v) => set("monthly_income_exact", Number(v))}
                        placeholder="Ej: 2800"
                      />
                      <FieldSelect
                        label="Rango de ingresos"
                        value={editForm.monthly_income_range ?? ""}
                        onChange={(v) => set("monthly_income_range", v)}
                        options={[
                          { value: "low",      label: "< 1.500 €" },
                          { value: "mid",      label: "1.500 – 3.000 €" },
                          { value: "high",     label: "3.000 – 5.000 €" },
                          { value: "very_high",label: "> 5.000 €" },
                        ]}
                      />
                      <FieldSelect
                        label="Objetivo financiero"
                        value={editForm.financial_goal ?? ""}
                        onChange={(v) => set("financial_goal", v)}
                        options={[
                          { value: "emergency", label: "Fondo de Emergencia" },
                          { value: "house",     label: "Comprar una Casa" },
                          { value: "retirement",label: "Inversión a Largo Plazo" },
                          { value: "growth",    label: "Crecimiento Agresivo" },
                        ]}
                      />
                      <FieldSelect
                        label="Nivel de conocimiento"
                        value={editForm.knowledge_level ?? ""}
                        onChange={(v) => set("knowledge_level", v)}
                        options={[
                          { value: "beginner",     label: "Principiante absoluto" },
                          { value: "intermediate", label: "Conozco lo básico" },
                          { value: "advanced",     label: "Invierto activamente" },
                        ]}
                      />
                      <FieldSelect
                        label="Tolerancia al riesgo"
                        value={editForm.risk_tolerance ?? ""}
                        onChange={(v) => set("risk_tolerance", v)}
                        options={[
                          { value: "sell", label: "Conservador (vendería)" },
                          { value: "hold", label: "Moderado (aguantaría)" },
                          { value: "buy",  label: "Agresivo (compraría más)" },
                        ]}
                      />
                      <FieldSelect
                        label="Situación familiar"
                        value={editForm.family_status ?? ""}
                        onChange={(v) => set("family_status", v)}
                        options={[
                          { value: "single",   label: "Soltero/a" },
                          { value: "couple",   label: "En pareja / Casado/a" },
                          { value: "children", label: "Con hijos/as" },
                        ]}
                      />
                      <FieldSelect
                        label="Rango de edad"
                        value={editForm.age_range ?? ""}
                        onChange={(v) => set("age_range", v)}
                        options={[
                          { value: "18-25", label: "18-25 años" },
                          { value: "26-35", label: "26-35 años" },
                          { value: "36-50", label: "36-50 años" },
                          { value: "51-65", label: "51-65 años" },
                          { value: "65+",   label: "+65 años" },
                        ]}
                      />
                      <FieldSelect
                        label="Ahorro mensual"
                        value={editForm.monthly_savings_percent ?? ""}
                        onChange={(v) => set("monthly_savings_percent", v)}
                        options={[
                          { value: "none", label: "No ahorro" },
                          { value: "low",  label: "Menos del 10%" },
                          { value: "mid",  label: "10% – 20%" },
                          { value: "high", label: "Más del 20%" },
                        ]}
                      />
                      <FieldSelect
                        label="Fondo de emergencia"
                        value={editForm.emergency_fund_status ?? ""}
                        onChange={(v) => set("emergency_fund_status", v)}
                        options={[
                          { value: "none",  label: "Sin fondo" },
                          { value: "1-3m",  label: "1 a 3 meses" },
                          { value: "3-6m",  label: "3 a 6 meses" },
                          { value: "6m+",   label: "+6 meses" },
                        ]}
                      />
                      <FieldSelect
                        label="Horizonte temporal"
                        value={editForm.investment_horizon ?? ""}
                        onChange={(v) => set("investment_horizon", v)}
                        options={[
                          { value: "short",  label: "Corto (< 2 años)" },
                          { value: "medium", label: "Medio (2-7 años)" },
                          { value: "long",   label: "Largo (+7 años)" },
                        ]}
                      />
                      <FieldSelect
                        label="Prioridad de inversión"
                        value={editForm.investment_priority ?? ""}
                        onChange={(v) => set("investment_priority", v)}
                        options={[
                          { value: "safety",   label: "Seguridad" },
                          { value: "balanced", label: "Equilibrio" },
                          { value: "profit",   label: "Rentabilidad" },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/70">
                        Notas adicionales
                        <span className="ml-2 text-xs text-white/30 font-normal">
                          Deudas, dependientes, situación especial...
                        </span>
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.other_notes ?? ""}
                        onChange={(e) => set("other_notes", e.target.value)}
                        placeholder="Ej: Tengo hipoteca de 800€/mes. 2 hijos. Préstamo de coche a 5 años..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-colors resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isSaving
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                          : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Reusable sub-components ── */

function ProfileCard({ icon, label, value, empty }: {
  icon: React.ReactNode; label: string; value?: string; empty: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="glass-card rounded-2xl p-5 border border-white/5 flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-sm font-medium ${value ? "text-white" : "text-white/25 italic"}`}>
          {value ?? empty}
        </p>
      </div>
    </motion.div>
  );
}

function FieldText({ label, hint, value, onChange, placeholder }: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/70">
        {label}
        {hint && <span className="ml-2 text-xs text-white/30 font-normal">{hint}</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-colors"
      />
    </div>
  );
}

function FieldNumber({ label, hint, value, onChange, placeholder }: {
  label: string; hint?: string; value: number | string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/70">
        {label}
        {hint && <span className="ml-2 text-xs text-white/30 font-normal">{hint}</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-colors"
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
      >
        <option value="">-- Seleccionar --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
