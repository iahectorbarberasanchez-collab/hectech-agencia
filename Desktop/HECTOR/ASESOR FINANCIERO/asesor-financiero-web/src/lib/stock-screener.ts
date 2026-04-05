/**
 * Screener de acciones usando Yahoo Finance (ya integrado).
 * No requiere API key adicional.
 * Filtra por criterios fundamentales básicos via yahoo-finance2.
 */

import yahooFinance from 'yahoo-finance2';

export interface ScreenerCriteria {
  max_pe?: number;           // P/E ratio máximo
  min_pe?: number;           // P/E ratio mínimo
  min_dividend_yield?: number; // rentabilidad por dividendo mínima (%)
  max_debt_equity?: number;  // deuda/patrimonio máximo
  min_roe?: number;          // ROE mínimo (%)
  market?: 'spain' | 'usa' | 'europe' | 'global';
  sector?: string;           // sector en inglés (Technology, Financial, etc.)
  min_market_cap?: number;   // capitalización mínima en millones €
  max_market_cap?: number;
}

export interface ScreenerResult {
  ticker: string;
  name: string;
  price: number;
  currency: string;
  pe_ratio: number | null;
  forward_pe: number | null;
  dividend_yield: number | null;
  market_cap: number | null;   // en millones
  sector: string | null;
  industry: string | null;
  roe: number | null;
  debt_equity: number | null;
  analyst_rating: string | null;
  target_price: number | null;
  upside_percent: number | null;
  score: number; // puntuación de calidad 0-100
}

// Universos de acciones por mercado (tickers conocidos)
const UNIVERSE: Record<string, string[]> = {
  spain: [
    'SAN.MC','BBVA.MC','TEF.MC','REP.MC','IBE.MC','AMS.MC','ENG.MC',
    'FER.MC','MAP.MC','ANA.MC','MEL.MC','IAG.MC','LOG.MC','BKT.MC',
    'CABK.MC','GRF.MC','VIS.MC','ACX.MC',
  ],
  usa_mega: [
    'AAPL','MSFT','GOOGL','AMZN','META','NVDA','TSLA','AVGO','LLY',
    'JPM','UNH','V','MA','HD','PG','COST','ABBV','MRK','WMT','XOM',
  ],
  usa_value: [
    'BRK-B','JNJ','KO','PEP','MCD','T','VZ','PFE','CVX','IBM',
    'BAC','WFC','C','GS','MS','USB','TRV','AFL','AIG',
  ],
  europe: [
    'ASML.AS','NOVO-B.CO','SAP.DE','NESN.SW','MC.PA','OR.PA','TTE.PA',
    'LVMH','SIE.DE','DTE.DE','BAS.DE','BAYER.DE','ALV.DE','MUV2.DE',
    'HSBA.L','BP.L','AZN.L','ULVR.L','RIO.L','SHEL.L',
  ],
};

function getUniverse(market: string): string[] {
  if (market === 'spain') return UNIVERSE.spain;
  if (market === 'usa') return [...UNIVERSE.usa_mega, ...UNIVERSE.usa_value];
  if (market === 'europe') return UNIVERSE.europe;
  return [...UNIVERSE.spain, ...UNIVERSE.usa_mega, ...UNIVERSE.europe];
}

function scoreStock(s: Partial<ScreenerResult>): number {
  let score = 50;
  // P/E razonable
  if (s.pe_ratio && s.pe_ratio > 0 && s.pe_ratio < 15) score += 15;
  else if (s.pe_ratio && s.pe_ratio < 25) score += 8;
  else if (s.pe_ratio && s.pe_ratio > 40) score -= 10;
  // Dividendo
  if (s.dividend_yield && s.dividend_yield > 3) score += 10;
  else if (s.dividend_yield && s.dividend_yield > 1.5) score += 5;
  // Upside
  if (s.upside_percent && s.upside_percent > 20) score += 15;
  else if (s.upside_percent && s.upside_percent > 10) score += 8;
  // ROE
  if (s.roe && s.roe > 20) score += 10;
  else if (s.roe && s.roe > 10) score += 5;
  // Deuda
  if (s.debt_equity !== null && s.debt_equity !== undefined) {
    if (s.debt_equity < 0.5) score += 10;
    else if (s.debt_equity > 2) score -= 10;
  }
  return Math.max(0, Math.min(100, score));
}

export async function screenStocks(criteria: ScreenerCriteria, maxResults = 10): Promise<ScreenerResult[]> {
  const universe = getUniverse(criteria.market || 'global');

  const results: ScreenerResult[] = [];

  // Fetch in batches of 5 to avoid hammering Yahoo Finance
  const batchSize = 5;
  for (let i = 0; i < Math.min(universe.length, 40); i += batchSize) {
    const batch = universe.slice(i, i + batchSize);

    await Promise.allSettled(batch.map(async (ticker) => {
      try {
        const quote = await yahooFinance.quoteSummary(ticker, {
          modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
        }) as any;

        const price_data = quote.price as any;
        const summary = quote.summaryDetail as any;
        const financial = quote.financialData as any;
        const stats = quote.defaultKeyStatistics as any;

        const price = price_data?.regularMarketPrice ?? 0;
        const pe = summary?.trailingPE ?? stats?.trailingEps ?? null;
        const forwardPe = summary?.forwardPE ?? null;
        const divYield = summary?.dividendYield ? summary.dividendYield * 100 : null;
        const marketCap = price_data?.marketCap ? price_data.marketCap / 1_000_000 : null;
        const sector = price_data?.sector ?? null;
        const roe = financial?.returnOnEquity ? financial.returnOnEquity * 100 : null;
        const debtEquity = financial?.debtToEquity ?? null;
        const targetPrice = financial?.targetMeanPrice ?? null;
        const upside = targetPrice && price ? ((targetPrice - price) / price) * 100 : null;
        const analystRating = financial?.recommendationKey ?? null;

        // Apply filters
        if (criteria.max_pe && pe && pe > criteria.max_pe) return;
        if (criteria.min_pe && pe && pe < criteria.min_pe) return;
        if (criteria.min_dividend_yield && (!divYield || divYield < criteria.min_dividend_yield)) return;
        if (criteria.max_debt_equity && debtEquity && debtEquity > criteria.max_debt_equity) return;
        if (criteria.min_roe && (!roe || roe < criteria.min_roe)) return;
        if (criteria.sector && sector && !sector.toLowerCase().includes(criteria.sector.toLowerCase())) return;
        if (criteria.min_market_cap && marketCap && marketCap < criteria.min_market_cap) return;

        const partial: Partial<ScreenerResult> = {
          ticker, pe_ratio: pe, forward_pe: forwardPe, dividend_yield: divYield,
          market_cap: marketCap, roe, debt_equity: debtEquity, upside_percent: upside,
        };

        results.push({
          ticker,
          name: price_data?.longName ?? price_data?.shortName ?? ticker,
          price,
          currency: price_data?.currency ?? 'USD',
          pe_ratio: pe !== undefined ? pe : null,
          forward_pe: forwardPe !== undefined ? forwardPe : null,
          dividend_yield: divYield,
          market_cap: marketCap,
          sector,
          industry: price_data?.industry ?? null,
          roe,
          debt_equity: debtEquity !== undefined ? debtEquity : null,
          analyst_rating: analystRating ?? null,
          target_price: targetPrice ?? null,
          upside_percent: upside !== null ? Math.round((upside ?? 0) * 10) / 10 : null,
          score: scoreStock(partial),
        });
      } catch {
        // Ticker not available — skip
      }
    }));
  }

  // Sort by score descending and return top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
