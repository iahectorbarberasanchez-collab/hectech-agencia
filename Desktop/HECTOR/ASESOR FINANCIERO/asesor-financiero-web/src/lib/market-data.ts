import YahooFinance from 'yahoo-finance2';
import { z } from 'zod';

const yahooFinance = new YahooFinance();

// Zod schema for the relevant fields we use from Yahoo Finance quotes
const YahooQuoteSchema = z.object({
  longName: z.string().optional(),
  shortName: z.string().optional(),
  regularMarketPrice: z.number().optional(),
  regularMarketPreviousClose: z.number().optional(),
  regularMarketChange: z.number().optional(),
  regularMarketChangePercent: z.number().optional(),
  currency: z.string().optional(),
  fullExchangeName: z.string().optional(),
  quoteType: z.string().optional(),
  regularMarketTime: z.union([z.number(), z.date()]).optional(),
}).passthrough(); // allow extra fields from Yahoo without breaking

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

// Top 20 most popular cryptos — Yahoo Finance requires the -USD suffix
const CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'DOGE', 'XRP', 'AVAX', 'MATIC',
  'LTC', 'LINK', 'BNB', 'UNI', 'ATOM', 'ALGO', 'XLM', 'FIL', 'NEAR',
  'APT', 'ARB', 'OP', 'INJ', 'SUI',
]);

// Spanish IBEX 35 tickers that need the .MC suffix
const IBEX_SYMBOLS = new Set([
  'SAN', 'BBVA', 'TEF', 'ITX', 'REP', 'IBE', 'ACS', 'FER', 'ANA',
  'MAP', 'MTS', 'CABK', 'CLNX', 'ELE', 'GRF',
]);

/**
 * Normaliza los símbolos para Yahoo Finance (criptos y bolsa española).
 */
function normalizeSymbol(symbol: string): string {
  const s = symbol.toUpperCase().trim();
  if (CRYPTO_SYMBOLS.has(s)) return `${s}-USD`;
  if (IBEX_SYMBOLS.has(s) && !s.includes('.')) return `${s}.MC`;
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
          const rawQuote = await yahooFinance.quote(s);

          // Validate with Zod — if Yahoo changes schema we get a clear error, not a silent crash
          const parsed = YahooQuoteSchema.safeParse(rawQuote);
          if (!parsed.success) {
            console.warn(`Yahoo Finance schema mismatch for ${s}:`, parsed.error.issues.map(i => i.message).join(', '));
            return null;
          }
          const quote = parsed.data;

          if (quote.regularMarketPrice === undefined && quote.regularMarketPreviousClose === undefined) {
            return null;
          }

          return {
            symbol: s,
            name: quote.longName || quote.shortName || s,
            price: quote.regularMarketPrice ?? quote.regularMarketPreviousClose ?? 0,
            change: quote.regularMarketChange ?? 0,
            changePercent: quote.regularMarketChangePercent ?? 0,
            currency: quote.currency ?? 'USD',
            exchange: quote.fullExchangeName ?? 'Unknown',
            type: quote.quoteType ?? 'EQUITY',
            timestamp: quote.regularMarketTime
              ? new Date(typeof quote.regularMarketTime === 'number' ? quote.regularMarketTime * 1000 : quote.regularMarketTime)
              : new Date()
          } satisfies MarketQuote;
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

