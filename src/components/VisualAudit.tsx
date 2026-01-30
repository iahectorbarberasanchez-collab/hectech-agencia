'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, Monitor, AlertCircle, ArrowRight } from 'lucide-react';
import { generateVisualAuditAction } from '../app/actions';

export function VisualAudit() {
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ data: string; screenshot: string; mockupPrompt?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAudit = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateVisualAuditAction(url, email);
            if (response.success && 'data' in response) {
                setResult({
                    data: response.data,
                    screenshot: response.screenshot || '',
                    mockupPrompt: response.mockupPrompt
                });
            } else if (!response.success && 'error' in response) {
                setError(response.error || "⚠️ No pudimos analizar esta web. Revisa que la URL sea correcta.");
            }
        } catch {
            setError("⚠️ Error de conexión. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Monitor size={16} className="text-[#00FF94]" />
                    URL de tu sitio web (ej: midominio.com)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="https://tuweb.com"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-colors"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Tu email (para enviarte el análisis)"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FF94] focus:outline-none transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        onClick={handleAudit}
                        disabled={loading || !url || !email}
                        className="bg-[#00FF94] text-black px-8 py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Escaneando...
                            </>
                        ) : (
                            <>
                                <Camera size={20} />
                                Analizar Diseño
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#00FF94] flex items-center gap-2">
                            <Monitor size={14} /> Captura detectada
                        </h4>
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                            <img
                                src={result.screenshot}
                                alt="Capture"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#00FF94] flex items-center gap-2">
                            <Sparkles size={14} /> Análisis de Gemini Vision
                        </h4>
                        <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 whitespace-pre-line text-gray-200 leading-relaxed italic">
                            {result.data}
                        </div>

                        {result.mockupPrompt && (
                            <div className="p-4 bg-[#00FF94]/5 border border-[#00FF94]/20 rounded-xl flex items-center gap-3">
                                <Sparkles size={20} className="text-[#00FF94] shrink-0" />
                                <p className="text-sm text-gray-300">
                                    <span className="text-[#00FF94] font-bold">Espejo IA Activado:</span> Hemos diseñado un concepto visual exclusivo para tu rediseño. Solicita tu propuesta PDF para verlo.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <a href="#contacto" className="bg-[#00FF94] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 group hover:scale-105 transition-all">
                                Ver mi Web del Futuro
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
