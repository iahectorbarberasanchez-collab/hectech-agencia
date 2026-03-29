import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

// Nota: En v2/v3 de yahoo-finance2, la configuración se maneja de forma distinta si fuese necesaria.

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  name: string;
  type: string;
  timestamp: Date;
}

/**
 * Normaliza los símbolos para Yahoo Finance (especialmente Cripto y Bolsa Española).
 */
function normalizeSymbol(symbol: string): string {
  const s = symbol.toUpperCase().trim();
  // Mapeo común de Cripto: Yahoo espera -USD para criptoactivos
  if (['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'DOGE'].includes(s)) {
    return `${s}-USD`;
  }
  // Valores españoles (IBEX 35) suelen necesitar el sufijo .MC
  if (['SAN', 'BBVA', 'TEF', 'ITX', 'REP', 'IBE'].includes(s)) {
    return `${s}.MC`;
  }
  return s;
}

/**
 * Obtiene datos de mercado en tiempo real para uno o varios símbolos.
 */
export async function getMarketData(symbols: string[]): Promise<MarketQuote[]> {
  try {
    const normalized = symbols.map(normalizeSymbol);
    
    const results = await Promise.all(
      normalized.map(async (s) => {
        try {
          // Usamos 'any' para el retorno de quote para evitar conflictos con los tipos internos
          // que a veces fallan al detectar propiedades opcionales.
          const quote: any = await yahooFinance.quote(s);
          
          if (!quote || (quote.regularMarketPrice === undefined && quote.regularMarketPreviousClose === undefined)) {
            return null;
          }
          
          return {
            symbol: s,
            name: quote.longName || quote.shortName || s,
            price: quote.regularMarketPrice || quote.regularMarketPreviousClose || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            currency: quote.currency || 'USD',
            exchange: quote.fullExchangeName || 'Unknown',
            type: quote.quoteType || 'EQUITY',
            timestamp: quote.regularMarketTime ? new Date(quote.regularMarketTime) : new Date()
          } as MarketQuote;
        } catch (e) {
          console.error(`Error fetching quote for ${s}:`, e);
          return null;
        }
      })
    );

    return results.filter((r): r is MarketQuote => r !== null);
  } catch (error) {
    console.error("Critical error in getMarketData:", error);
    return [];
  }
}
