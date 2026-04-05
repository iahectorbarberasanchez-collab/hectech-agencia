/**
 * Análisis de correlación de cartera y solapamiento de ETFs.
 * Usa datos históricos de Yahoo Finance (ya integrado en market-data.ts).
 */

import yahooFinance from 'yahoo-finance2';

export interface CorrelationResult {
  tickers: string[];
  matrix: number[][];           // correlación entre cada par [-1, 1]
  highCorrelations: {
    ticker1: string;
    ticker2: string;
    correlation: number;
    warning: string;
  }[];
  diversificationScore: number; // 0-100, mayor = más diversificado
  concentrationRisk: string;
  suggestions: string[];
}

/**
 * Descarga retornos diarios para los últimos N días de cada ticker.
 */
async function fetchReturns(tickers: string[], days = 252): Promise<Map<string, number[]>> {
  const returnsMap = new Map<string, number[]>();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days - 10); // buffer para días no bursátiles

  await Promise.allSettled(
    tickers.map(async (ticker) => {
      try {
        const history = await yahooFinance.chart(ticker, {
          period1: startDate.toISOString().split('T')[0],
          period2: endDate.toISOString().split('T')[0],
          interval: '1d',
        }) as any;

        const closes = ((history.quotes || []) as any[])
          .filter((q: any) => q.close != null)
          .map((q: any) => q.close as number);

        if (closes.length < 20) return;

        const returns: number[] = [];
        for (let i = 1; i < closes.length; i++) {
          returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
        }
        returnsMap.set(ticker, returns);
      } catch {
        // Yahoo Finance puede fallar con algunos tickers — los ignoramos
      }
    })
  );

  return returnsMap;
}

/** Correlación de Pearson entre dos series de retornos */
function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 10) return NaN;

  const sliceA = a.slice(-n);
  const sliceB = b.slice(-n);
  const meanA = sliceA.reduce((s, v) => s + v, 0) / n;
  const meanB = sliceB.reduce((s, v) => s + v, 0) / n;

  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const dA = sliceA[i] - meanA;
    const dB = sliceB[i] - meanB;
    num  += dA * dB;
    denA += dA * dA;
    denB += dB * dB;
  }

  const den = Math.sqrt(denA * denB);
  return den === 0 ? NaN : Math.round((num / den) * 1000) / 1000;
}

export async function analyzePortfolioCorrelation(tickers: string[]): Promise<CorrelationResult> {
  // Filtrar tickers válidos (no vacíos, no cryptos con formato raro para Yahoo)
  const validTickers = tickers.filter(t => t && t.length > 0 && t !== '—');

  if (validTickers.length < 2) {
    return {
      tickers: validTickers,
      matrix: [],
      highCorrelations: [],
      diversificationScore: 50,
      concentrationRisk: 'Insuficientes activos para análisis',
      suggestions: ['Necesitas al menos 2 activos con ticker para calcular correlaciones.'],
    };
  }

  const returnsMap = await fetchReturns(validTickers);
  const availableTickers = [...returnsMap.keys()];

  if (availableTickers.length < 2) {
    return {
      tickers: availableTickers,
      matrix: [],
      highCorrelations: [],
      diversificationScore: 50,
      concentrationRisk: 'No se pudieron obtener datos históricos',
      suggestions: ['No se encontraron datos históricos suficientes para calcular correlaciones.'],
    };
  }

  // Construir matriz de correlación
  const n = availableTickers.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(NaN));
  const highCorrelations: CorrelationResult['highCorrelations'] = [];

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1.0;
    for (let j = i + 1; j < n; j++) {
      const rA = returnsMap.get(availableTickers[i])!;
      const rB = returnsMap.get(availableTickers[j])!;
      const corr = pearsonCorrelation(rA, rB);
      matrix[i][j] = corr;
      matrix[j][i] = corr;

      if (!isNaN(corr) && Math.abs(corr) >= 0.75) {
        let warning = '';
        if (corr >= 0.90) warning = `Correlación muy alta (${corr}): estos activos se mueven casi idénticamente. Estás duplicando exposición sin diversificar.`;
        else if (corr >= 0.75) warning = `Correlación alta (${corr}): poca diversificación real entre estos dos activos.`;
        else if (corr <= -0.75) warning = `Correlación negativa fuerte (${corr}): excelente cobertura natural entre estos activos.`;

        highCorrelations.push({
          ticker1: availableTickers[i],
          ticker2: availableTickers[j],
          correlation: corr,
          warning,
        });
      }
    }
  }

  // Score de diversificación: promedio de 1 - |corr| para todos los pares
  const pairs = highCorrelations.length > 0 ? highCorrelations : [];
  let sumAbsCorr = 0, pairCount = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isNaN(matrix[i][j])) {
        sumAbsCorr += Math.abs(matrix[i][j]);
        pairCount++;
      }
    }
  }
  const avgAbsCorr = pairCount > 0 ? sumAbsCorr / pairCount : 0.5;
  const diversificationScore = Math.round((1 - avgAbsCorr) * 100);

  // Riesgo de concentración
  let concentrationRisk: string;
  if (diversificationScore >= 70) concentrationRisk = '✅ Buena diversificación';
  else if (diversificationScore >= 50) concentrationRisk = '⚠️ Diversificación moderada — algunos activos se mueven juntos';
  else concentrationRisk = '🔴 Baja diversificación — alta concentración de riesgo correlacionado';

  // Sugerencias
  const suggestions: string[] = [];
  const highCorrPairs = pairs.filter(p => p.correlation >= 0.80);
  if (highCorrPairs.length > 0) {
    suggestions.push(`Considera reducir uno de estos pares con alta correlación: ${highCorrPairs.map(p => `${p.ticker1}/${p.ticker2}`).join(', ')}.`);
  }
  if (diversificationScore < 50) {
    suggestions.push('Añadir activos con baja correlación: bonos, oro, REITs o mercados emergentes reducirían el riesgo global.');
  }
  if (availableTickers.filter(t => t.includes('.MC')).length === availableTickers.length) {
    suggestions.push('Toda tu cartera está en mercado español. Diversifica geográficamente con ETFs globales (MSCI World, S&P500).');
  }

  return {
    tickers: availableTickers,
    matrix,
    highCorrelations: pairs,
    diversificationScore,
    concentrationRisk,
    suggestions,
  };
}

// ─── ETF Overlap Analysis ────────────────────────────────────────────────────

export interface ETFOverlapResult {
  etf1: string;
  etf2: string;
  overlapPercent: number;
  commonHoldings: string[];
  explanation: string;
}

// Top holdings de los ETFs más comunes en España (datos reales aproximados)
const ETF_HOLDINGS: Record<string, string[]> = {
  // MSCI World ETFs
  'IWDA': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'SWRD': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'EUNL': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'XDWD': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],

  // S&P 500 ETFs
  'CSPX': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'SXR8': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'VUSA': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'SPY':  ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'IVV':  ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],
  'VOO':  ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','LLY'],

  // NASDAQ
  'CNDX': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','COST'],
  'NQSE': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','COST'],
  'QQQ':  ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','COST'],
  'EQQQ': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','TSLA','AVGO','COST'],

  // Europe / STOXX
  'VEUR': ['NOVO-B.CO','ASML.AS','NESN.SW','ROG.SW','MC.PA','SAP','SAN.MC','DTE.DE','SIE.DE','BNP.PA'],
  'EXSA': ['NOVO-B.CO','ASML.AS','NESN.SW','ROG.SW','MC.PA','SAP','SAN.MC','DTE.DE','SIE.DE','BNP.PA'],

  // Emerging Markets
  'EIMI': ['TSM','005930.KS','BABA','TCEHY','RELIANCE.NS','VALE','PDD','MEITUAN','JD'],
  'VFEM': ['TSM','005930.KS','BABA','TCEHY','RELIANCE.NS','VALE','PDD','MEITUAN','JD'],

  // All-World
  'VWCE': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','TSM','TSLA','AVGO','LLY'],
  'SSAC': ['AAPL','MSFT','NVDA','AMZN','META','GOOGL','TSM','TSLA','AVGO','LLY'],
};

export function analyzeETFOverlap(etfTickers: string[]): ETFOverlapResult[] {
  const results: ETFOverlapResult[] = [];

  for (let i = 0; i < etfTickers.length; i++) {
    for (let j = i + 1; j < etfTickers.length; j++) {
      const t1 = etfTickers[i].toUpperCase();
      const t2 = etfTickers[j].toUpperCase();

      const h1 = ETF_HOLDINGS[t1];
      const h2 = ETF_HOLDINGS[t2];

      if (!h1 || !h2) continue;

      const set1 = new Set(h1);
      const common = h2.filter(h => set1.has(h));
      const unionSize = new Set([...h1, ...h2]).size;
      const overlapPercent = Math.round((common.length / unionSize) * 100);

      let explanation = '';
      if (overlapPercent >= 70) {
        explanation = `⚠️ Solapamiento muy alto (${overlapPercent}%): ${t1} y ${t2} tienen composiciones casi idénticas. Mantener los dos es redundante.`;
      } else if (overlapPercent >= 40) {
        explanation = `⚡ Solapamiento moderado (${overlapPercent}%): comparten las principales posiciones. Considera si aporta diversificación real.`;
      } else {
        explanation = `✅ Solapamiento bajo (${overlapPercent}%): buena complementariedad entre estos ETFs.`;
      }

      results.push({ etf1: t1, etf2: t2, overlapPercent, commonHoldings: common, explanation });
    }
  }

  return results.sort((a, b) => b.overlapPercent - a.overlapPercent);
}
