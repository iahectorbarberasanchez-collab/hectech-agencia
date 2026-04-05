/**
 * Snapshot estático de indicadores macroeconómicos globales.
 * Actualizar mensualmente con los últimos datos publicados.
 *
 * Fuentes: Federal Reserve, BLS, BEA, ECB, BCE, INE, BdE, Bloomberg
 * Última actualización: Abril 2026
 */

export interface EconIndicator {
  label: string;
  value: string;
  trend: 'rising' | 'falling' | 'stable';
  /** Interpretación para política monetaria / apetito de riesgo */
  signal: 'hawkish' | 'dovish' | 'neutral' | 'risk-on' | 'risk-off';
  note: string;
  asOf: string;
}

export interface MacroSnapshot {
  lastUpdated: string;
  us: Record<string, EconIndicator>;
  europe: Record<string, EconIndicator>;
  spain: Record<string, EconIndicator>;
  globalThemes: string[];
  keyRisks: string[];
}

export const MACRO_SNAPSHOT: MacroSnapshot = {
  lastUpdated: '2026-04-05',

  // ── ESTADOS UNIDOS ──────────────────────────────────────────────────────────
  us: {
    fedFundsRate: {
      label: 'Fed Funds Rate',
      value: '4.25–4.50%',
      trend: 'stable',
      signal: 'hawkish',
      note: 'Fed en pausa. Mercados anticipan 2 recortes en 2026 (junio + septiembre). La Fed es data-dependent. Desinflación sigue su curso pero más lento de lo esperado.',
      asOf: '2026-04',
    },
    cpiYoY: {
      label: 'CPI Headline YoY',
      value: '2.8%',
      trend: 'falling',
      signal: 'neutral',
      note: 'Feb 2026. Tendencia bajista confirmada. Energía y alimentos moderándose. Componente "Shelter" +4.2% todavía caliente.',
      asOf: '2026-02',
    },
    coreCpiYoY: {
      label: 'Core CPI YoY (sin energía/alimentos)',
      value: '3.1%',
      trend: 'falling',
      signal: 'hawkish',
      note: 'Servicios siguen rígidos. Salarios USA creciendo al +4.1% — presión estructural sobre precios de servicios.',
      asOf: '2026-02',
    },
    corePce: {
      label: 'Core PCE YoY (target Fed: 2%)',
      value: '3.1%',
      trend: 'falling',
      signal: 'hawkish',
      note: 'Métrica favorita de la Fed. Todavía >50pb por encima del objetivo. No hay prisa para recortar.',
      asOf: '2026-02',
    },
    gdpGrowth: {
      label: 'PIB EEUU Q4 2025 (anualizado)',
      value: '+1.4%',
      trend: 'falling',
      signal: 'neutral',
      note: 'Muy por debajo del consenso (+2.5%). Ralentización sin recesión. Consumo aguanta pero inversión empresarial frena.',
      asOf: '2025-Q4',
    },
    unemployment: {
      label: 'Tasa de Desempleo EEUU',
      value: '4.1%',
      trend: 'rising',
      signal: 'dovish',
      note: 'Feb 2026. Mercado laboral enfriándose. NFP +150K (feb) vs 180K esperado. Sahm Rule: no activada pero vigilar.',
      asOf: '2026-02',
    },
    ismManufacturing: {
      label: 'ISM Manufacturing PMI',
      value: '49.0',
      trend: 'stable',
      signal: 'risk-off',
      note: '<50 = contracción. Sector industrial en recesión técnica. Aranceles Trump generan incertidumbre en capex.',
      asOf: '2026-02',
    },
    ismServices: {
      label: 'ISM Services PMI',
      value: '52.4',
      trend: 'falling',
      signal: 'neutral',
      note: '>50 = expansión. El sector servicios aguanta el ciclo, aunque tendencia bajista desde 56. Crucial para 70% del PIB USA.',
      asOf: '2026-02',
    },
    consumerConfidence: {
      label: 'CB Consumer Confidence',
      value: '91.2',
      trend: 'falling',
      signal: 'risk-off',
      note: 'Mínimo desde el COVID. Consumidores preocupados por empleo, inflación y política arancelaria. Señal de alerta máxima para gasto.',
      asOf: '2026-02',
    },
    umichSentiment: {
      label: 'UMich Consumer Sentiment',
      value: '55.3',
      trend: 'falling',
      signal: 'risk-off',
      note: 'Caída pronunciada. Inflación de larga duración esperada al 4.3% (vs 2.9% hace 6 meses). Riesgo deanchoring expectations.',
      asOf: '2026-02',
    },
    yieldSpread: {
      label: 'Spread 10Y-2Y (curva de tipos)',
      value: '+56pb (normalizada)',
      trend: 'rising',
      signal: 'neutral',
      note: '10Y: ~4.12% / 2Y: ~3.56%. Curva re-empinando tras la inversión de 2022-2024. Final de ciclo clásico.',
      asOf: '2026-03',
    },
    fiscalDeficit: {
      label: 'Déficit Fiscal USA',
      value: '~6.2% del PIB',
      trend: 'rising',
      signal: 'risk-off',
      note: 'CBO proyecta déficit estructural >$1.5T anuales. Presión alcista secular en tipos largos. Riesgo soberano a vigilar.',
      asOf: '2026',
    },
  },

  // ── EUROPA ──────────────────────────────────────────────────────────────────
  europe: {
    ecbRate: {
      label: 'Tipo de Depósito BCE',
      value: '2.50%',
      trend: 'falling',
      signal: 'dovish',
      note: 'BCE ha recortado 200pb desde el pico de 4.50%. Ciclo agresivo de bajadas por inflación controlada y economía débil. Próximo recorte: junio 2026.',
      asOf: '2026-03',
    },
    euribor12m: {
      label: 'Euribor 12 meses',
      value: '2.60%',
      trend: 'falling',
      signal: 'dovish',
      note: 'Desde máximos de 4.16% (oct 2023). Alivio real para hipotecas variables en España. Previsión: 2.0–2.2% a finales de 2026.',
      asOf: '2026-04',
    },
    europeanCpi: {
      label: 'IPC Eurozona YoY',
      value: '2.3%',
      trend: 'falling',
      signal: 'neutral',
      note: 'Cercano al objetivo del 2% del BCE. Mucho más controlado que EEUU. Servicios en Europa: +3.9% (resistentes).',
      asOf: '2026-02',
    },
    euGdp: {
      label: 'PIB Eurozona Q4 2025',
      value: '+0.9% (anualizado)',
      trend: 'stable',
      signal: 'neutral',
      note: 'Crecimiento anémico. Alemania en recesión técnica (-0.2%). Francia estancada. España y Portugal lideran el crecimiento europeo.',
      asOf: '2025-Q4',
    },
    euUnemployment: {
      label: 'Tasa de Paro Eurozona',
      value: '6.2%',
      trend: 'stable',
      signal: 'neutral',
      note: 'Mínimo histórico para Europa. Mercado laboral resistente pese al bajo crecimiento. Alemania sube (5.7%).',
      asOf: '2026-01',
    },
    euFiscal: {
      label: 'Déficits fiscales Europa',
      value: 'Francia 5.5% / Italia 4.2% / España 3.1%',
      trend: 'stable',
      signal: 'neutral',
      note: 'Francia e Italia superan el límite de Maastricht (3%). Procedimiento de déficit excesivo en curso. España: notable consolidación.',
      asOf: '2025',
    },
  },

  // ── ESPAÑA ──────────────────────────────────────────────────────────────────
  spain: {
    ipc: {
      label: 'IPC España YoY',
      value: '2.9%',
      trend: 'stable',
      signal: 'neutral',
      note: 'Feb 2026. Ligeramente por encima de la media europea. Servicios: +3.8%. Alimentos: +3.1%. Sin señal de alarma.',
      asOf: '2026-02',
    },
    pib: {
      label: 'PIB España Q4 2025',
      value: '+3.5% (anualizado)',
      trend: 'stable',
      signal: 'risk-on',
      note: 'España lidera el crecimiento en las grandes economías europeas. FMI proyecta +2.7% para 2026. Motor: turismo, servicios y consumo interno.',
      asOf: '2025-Q4',
    },
    paro: {
      label: 'Tasa de Paro España',
      value: '11.4%',
      trend: 'falling',
      signal: 'neutral',
      note: 'Q4 2025. Mínimo histórico. Reducción sostenida. La dualidad del mercado laboral (temporal vs fijo) persiste.',
      asOf: '2025-Q4',
    },
    euribor: {
      label: 'Euribor 12M (hipotecas)',
      value: '2.60%',
      trend: 'falling',
      signal: 'dovish',
      note: 'Bajada de 156pb desde máximos. Hipoteca de 200.000€ a 30 años → ahorro ~250€/mes vs el pico de 2023. Motor de consumo e inmobiliario.',
      asOf: '2026-04',
    },
    ibex35Contexto: {
      label: 'IBEX 35 (contexto)',
      value: 'Bancos + utilities dominan el índice',
      trend: 'stable',
      signal: 'neutral',
      note: 'IBEX muy bancarizado (SAN, BBVA, CABK, SAB = ~30%). Beneficiado por años de tipos altos. Ahora sensible a las bajadas del BCE. Bajo descuento vs Europa.',
      asOf: '2026-04',
    },
    inmobiliario: {
      label: 'Mercado inmobiliario España',
      value: '+8.3% YoY precio vivienda',
      trend: 'rising',
      signal: 'neutral',
      note: 'Desequilibrio oferta/demanda estructural. Bajada Euribor impulsa compras. Ciudades saturadas (Madrid, BCN, Málaga). Sin burbuja en métricas de esfuerzo vs renta.',
      asOf: '2026-Q1',
    },
  },

  // ── TEMAS GLOBALES ───────────────────────────────────────────────────────────
  globalThemes: [
    '🇺🇸 FED EN PAUSA: tipos altos por más tiempo, inflación >2% pero mercado laboral cede',
    '🇪🇺 BCE DOVISH: ciclo agresivo de bajadas, Euribor cae → alivio para hipotecas variables en España',
    '🇪🇸 ESPAÑA OUTPERFORMS: mejor PIB entre las grandes economías europeas (+3.5%), turismo y servicios fuertes',
    '🏛️ ARANCELES TRUMP 2.0: riesgo inflacionario vía importaciones y guerra comercial EEUU-China-Europa',
    '🇨🇳 CHINA ESTÍMULOS: paquetes fiscales y monetarios para reactivar consumo interno; deuda local elevada',
    '🤖 IA E INFRAESTRUCTURA: capex masivo en data centers impulsa semiconductores (NVDA, ASML) y energía',
    '📉 DEUDA SOBERANA USA: déficit estructural >6% PIB → presión alcista secular en yields largos',
    '🥇 ORO EN MÁXIMOS: demanda de bancos centrales emergentes + hedge geopolítico/deuda; >$3000',
    '💰 PRIVATE CREDIT: mercado de $1.7T, alternativa al crédito bancario; riesgo sistémico emergente',
  ],

  // ── RIESGOS CLAVE ────────────────────────────────────────────────────────────
  keyRisks: [
    'RECESIÓN USA: si confianza consumidor colapsa (CB: 91.2) y empleo deteriora → mercados -20%',
    'REIGNICIÓN INFLACIONARIA: aranceles Trump + represalias → CPI repunta → Fed no puede recortar',
    'CONTAGIO BANCARIO: bancos regionales USA con riesgo CRE (Commercial Real Estate); similares a SVB',
    'ESCALADA ORIENTE MEDIO: petróleo >$100/barril → estanflación global',
    'HARD LANDING CHINA: deuda inmobiliaria + deuda local → contagio commodities y exportadores europeos',
    'JAPÓN: si BoJ normaliza tipos agresivamente → desapalancamiento yen carry trade global → caída activos',
    'DEUDA SOBERANA ITALIANA: spreads BTP-Bund se amplían en escenarios de riesgo; €500B en riesgo',
  ],
};

/**
 * Genera un texto compacto del snapshot macro para inyectar en el contexto de la IA.
 */
export function getMacroSummaryText(): string {
  const s = MACRO_SNAPSHOT;

  const formatSection = (title: string, indicators: Record<string, EconIndicator>) =>
    `=== ${title} ===\n${Object.values(indicators)
      .map(i => `• ${i.label}: ${i.value} [${i.trend.toUpperCase()} | ${i.signal.toUpperCase()}]\n  → ${i.note}`)
      .join('\n')}`;

  return `
ENTORNO MACROECONÓMICO GLOBAL (Actualizado: ${s.lastUpdated})

${formatSection('ESTADOS UNIDOS', s.us)}

${formatSection('EUROPA', s.europe)}

${formatSection('ESPAÑA', s.spain)}

=== TEMAS GLOBALES CLAVE ===
${s.globalThemes.join('\n')}

=== RIESGOS PRINCIPALES ===
${s.keyRisks.map(r => `⚠️ ${r}`).join('\n')}
  `.trim();
}
