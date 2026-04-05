/**
 * Datos de mercado macro en tiempo real vía Yahoo Finance.
 * Complementa el macro-snapshot.ts (indicadores económicos estáticos) con
 * precios de mercado en directo: VIX, yields, índices, FX y commodities.
 */

import { getMarketData, MarketQuote } from './market-data';

// Símbolos Yahoo Finance para los indicadores macro clave
export const MACRO_MARKET_SYMBOLS = [
  // Volatilidad
  '^VIX',       // CBOE Volatility Index — "el termómetro del miedo"

  // Yields USA (bonos como porcentaje, no precio)
  '^TNX',       // 10Y US Treasury Yield
  '^TYX',       // 30Y US Treasury Yield
  '^FVX',       // 5Y US Treasury Yield
  '^IRX',       // 13-week T-Bill (proxy tipo corto)

  // Commodities estratégicos
  'GC=F',       // Oro (Gold Futures)
  'CL=F',       // Petróleo WTI
  'BZ=F',       // Petróleo Brent

  // FX
  'EURUSD=X',   // Euro / Dólar
  'DX-Y.NYB',   // USD Index (DXY) — fortaleza del dólar vs cesta divisas

  // Índices bursátiles globales
  '^GSPC',      // S&P 500
  '^IXIC',      // NASDAQ Composite
  '^STOXX50E',  // Euro Stoxx 50
  '^IBEX',      // IBEX 35
  '^GDAXI',     // DAX (Alemania)
  '^FTSE',      // FTSE 100 (UK)
  '^N225',      // Nikkei 225 (Japón)
] as const;

export interface MacroMarketData {
  quotes: MarketQuote[];
  vix?: MarketQuote;
  bonds: {
    us10y?: MarketQuote;
    us30y?: MarketQuote;
    us5y?: MarketQuote;
    usTBill?: MarketQuote;
  };
  commodities: {
    gold?: MarketQuote;
    oilWTI?: MarketQuote;
    oilBrent?: MarketQuote;
  };
  indices: {
    sp500?: MarketQuote;
    nasdaq?: MarketQuote;
    eurostoxx50?: MarketQuote;
    ibex35?: MarketQuote;
    dax?: MarketQuote;
    ftse?: MarketQuote;
    nikkei?: MarketQuote;
  };
  fx: {
    eurusd?: MarketQuote;
    usdIndex?: MarketQuote;
  };
  timestamp: string;
  /** Lectura rápida del sentimiento de mercado basada en VIX */
  marketSentiment: 'extreme-fear' | 'fear' | 'neutral' | 'greed' | 'extreme-greed';
}

function classifyVix(vixPrice?: number): MacroMarketData['marketSentiment'] {
  if (!vixPrice) return 'neutral';
  if (vixPrice >= 40) return 'extreme-fear';
  if (vixPrice >= 28) return 'fear';
  if (vixPrice >= 20) return 'neutral';
  if (vixPrice >= 14) return 'greed';
  return 'extreme-greed';
}

export async function getMacroMarketData(): Promise<MacroMarketData> {
  const quotes = await getMarketData([...MACRO_MARKET_SYMBOLS]);
  const bySymbol: Record<string, MarketQuote> = Object.fromEntries(
    quotes.map(q => [q.symbol, q])
  );

  const vix = bySymbol['^VIX'];

  return {
    quotes,
    vix,
    bonds: {
      us10y: bySymbol['^TNX'],
      us30y: bySymbol['^TYX'],
      us5y: bySymbol['^FVX'],
      usTBill: bySymbol['^IRX'],
    },
    commodities: {
      gold: bySymbol['GC=F'],
      oilWTI: bySymbol['CL=F'],
      oilBrent: bySymbol['BZ=F'],
    },
    indices: {
      sp500: bySymbol['^GSPC'],
      nasdaq: bySymbol['^IXIC'],
      eurostoxx50: bySymbol['^STOXX50E'],
      ibex35: bySymbol['^IBEX'],
      dax: bySymbol['^GDAXI'],
      ftse: bySymbol['^FTSE'],
      nikkei: bySymbol['^N225'],
    },
    fx: {
      eurusd: bySymbol['EURUSD=X'],
      usdIndex: bySymbol['DX-Y.NYB'],
    },
    timestamp: new Date().toISOString(),
    marketSentiment: classifyVix(vix?.price),
  };
}

/** Formatea el spread de tipos para análisis de curva */
function formatSpread(long?: MarketQuote, short?: MarketQuote): string {
  if (!long || !short) return 'N/A';
  const spread = long.price - short.price;
  const label = spread > 0
    ? `+${(spread * 100).toFixed(0)}pb (curva normal)`
    : `${(spread * 100).toFixed(0)}pb (curva INVERTIDA ⚠️)`;
  return label;
}

/** Describe el VIX en términos cualitativos */
function describeVix(vix?: MarketQuote): string {
  if (!vix) return 'No disponible';
  const v = vix.price;
  const change = vix.changePercent > 0 ? `↑${vix.changePercent.toFixed(1)}%` : `↓${Math.abs(vix.changePercent).toFixed(1)}%`;
  if (v >= 40) return `${v.toFixed(1)} ${change} — MIEDO EXTREMO: alta volatilidad, venta masiva en mercados`;
  if (v >= 28) return `${v.toFixed(1)} ${change} — MIEDO ELEVADO: inversores cubriendo riesgo`;
  if (v >= 20) return `${v.toFixed(1)} ${change} — NERVIOSISMO: incertidumbre moderada`;
  if (v >= 14) return `${v.toFixed(1)} ${change} — COMPLACENCIA: mercados tranquilos`;
  return `${v.toFixed(1)} ${change} — COMPLACENCIA EXTREMA: posible exceso de optimismo`;
}

/** Formatea los datos macro de mercado en texto legible para la IA */
export function formatMacroForAI(data: MacroMarketData): string {
  const fmt = (q?: MarketQuote, digits = 2, prefix = '') => {
    if (!q) return 'N/D';
    const chg = q.changePercent >= 0 ? `+${q.changePercent.toFixed(2)}%` : `${q.changePercent.toFixed(2)}%`;
    return `${prefix}${q.price.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits })} (${chg})`;
  };

  const sentimentLabels: Record<MacroMarketData['marketSentiment'], string> = {
    'extreme-fear': '😱 MIEDO EXTREMO',
    'fear': '😰 MIEDO',
    'neutral': '😐 NEUTRAL',
    'greed': '🤑 CODICIA',
    'extreme-greed': '🔥 CODICIA EXTREMA',
  };

  const lines: string[] = [
    `DATOS DE MERCADO EN TIEMPO REAL — ${new Date(data.timestamp).toLocaleString('es-ES')}`,
    `Sentimiento global: ${sentimentLabels[data.marketSentiment]}`,
    '',
    '📊 VOLATILIDAD',
    `• VIX: ${describeVix(data.vix)}`,
    '',
    '🏛️ RENTA FIJA USA (yields, no precio)',
    `• T-Bill 13W: ${fmt(data.bonds.usTBill, 2)}%`,
    `• Bono 5A:   ${fmt(data.bonds.us5y, 2)}%`,
    `• Bono 10A:  ${fmt(data.bonds.us10y, 2)}%`,
    `• Bono 30A:  ${fmt(data.bonds.us30y, 2)}%`,
    `• Spread 10A-TBill: ${formatSpread(data.bonds.us10y, data.bonds.usTBill)}`,
    '',
    '💱 DIVISAS',
    `• EUR/USD: ${fmt(data.fx.eurusd, 4)}`,
    `• USD Index (DXY): ${fmt(data.fx.usdIndex, 2)}`,
    '',
    '🛢️ COMMODITIES',
    `• Oro:            ${fmt(data.commodities.gold, 0, '$')}`,
    `• Petróleo WTI:   ${fmt(data.commodities.oilWTI, 2, '$')}`,
    `• Petróleo Brent: ${fmt(data.commodities.oilBrent, 2, '$')}`,
    '',
    '📈 ÍNDICES BURSÁTILES',
    `• S&P 500:      ${fmt(data.indices.sp500, 2)}`,
    `• NASDAQ:       ${fmt(data.indices.nasdaq, 2)}`,
    `• IBEX 35:      ${fmt(data.indices.ibex35, 2)}`,
    `• Euro Stoxx 50: ${fmt(data.indices.eurostoxx50, 2)}`,
    `• DAX:          ${fmt(data.indices.dax, 2)}`,
    `• FTSE 100:     ${fmt(data.indices.ftse, 2)}`,
    `• Nikkei 225:   ${fmt(data.indices.nikkei, 2)}`,
  ];

  return lines.join('\n');
}
