import YahooFinance from 'yahoo-finance2';
import { z } from 'zod';

const yahooFinance = new YahooFinance();

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
}).passthrough();

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

// All known crypto base tickers — will be normalized to BASE-USD or BASE-EUR
const CRYPTO_BASE_TICKERS = new Set([
  // Layer 1 / Major
  'BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE', 'AVAX', 'MATIC', 'LINK',
  'UNI', 'LTC', 'BCH', 'ATOM', 'ALGO', 'XLM', 'VET', 'FIL', 'NEAR', 'ICP',
  'APT', 'ARB', 'OP', 'INJ', 'SUI', 'BNB', 'TRX', 'ETC', 'XMR', 'DASH', 'ZEC',
  'TON', 'QNT', 'XCN', 'BGB', 'PI',
  // DeFi
  'SAND', 'MANA', 'AXS', 'THETA', 'CRO', 'FTM', 'SHIB', 'PEPE', 'WLD', 'TIA',
  'SEI', 'BLUR', 'AAVE', 'COMP', 'MKR', 'CRV', 'LDO', 'GRT', 'FET', 'RNDR',
  'SNX', 'LRC', 'BAL', 'RUNE', 'CAKE', 'RAY', 'UMA',
  // Gaming / NFT / Meme
  'ENJ', 'GALA', 'APE', 'ILV', 'MANA',
  'BEAM', 'HBAR', 'EGLD', 'FLOW', 'IMX', 'ROSE', 'KAVA', 'ONE',
  'CELO', 'XTZ', 'BAT', 'ZRX', 'ANKR', 'CHZ', 'HOT', 'OMG', 'IOTA', 'ICX',
  'ZIL', 'ONT', 'WAVES', 'DCR', 'NANO', 'NMR', 'JUP', 'PYTH', 'STRK', 'POPCAT',
  'BONK', 'WIF', 'FLOKI', 'BOME', 'PEPE', 'PNUT', 'WLFI', 'AVAL', 'PEAQ',
  'PUMP', 'MICHI', 'SPX',
  // AI / Data
  'RENDER', 'AITECH',
  // Infrastructure / newer
  'AIXBT', 'KUJI', 'SAUCE', 'GFAL', 'NEUR', 'METAL', 'XCN',
]);

// Spanish IBEX 35 tickers → .MC suffix
const IBEX_SYMBOLS = new Set([
  'SAN', 'BBVA', 'TEF', 'ITX', 'REP', 'IBE', 'ACS', 'FER', 'ANA',
  'MAP', 'MTS', 'CABK', 'CLNX', 'ELE', 'GRF', 'ACX', 'AENA', 'COL',
  'ENG', 'LOG', 'MEL', 'NTGY', 'PHM', 'RED', 'SGRE',
]);

// European stocks on specific exchanges
const EURONEXT_SYMBOLS: Record<string, string> = {
  'ASML': 'ASML.AS', // Amsterdam
  'ADYEN': 'ADYEN.AS',
  'HEIA': 'HEIA.AS',
  'PHIA': 'PHIA.AS',
  'UNA': 'UNA.AS',
  'BAYN': 'BAYN.DE', // Frankfurt XETRA
  'BMW': 'BMW.DE',
  'SAP': 'SAP.DE',
  'SIE': 'SIE.DE',
  'ALV': 'ALV.DE',
  'DAI': 'MBG.DE',
  'BAS': 'BAS.DE',
  'VOW3': 'VOW3.DE',
  'ADS': 'ADS.DE',
  'P911': 'P911.DE',  // Porsche (ETR:P911)
  '3IB': '3IB.F',    // iShares MSCI Indonesia (FRA:3IB)
  'AIR': 'AIR.PA', // Paris
  'OR': 'OR.PA',
  'MC': 'MC.PA',
  'SAN.PA': 'SAN.PA',
  'DRO': 'DRO.AX',   // DroneShield (ASX:DRO)
};

// Full token name → canonical ticker (for users who enter the full name as ticker)
const FULL_NAME_TO_TICKER: Record<string, string> = {
  'SYNTHETIX': 'SNX',
  'LOOPRING':  'LRC',
  'CURVE':     'CRV',
  'ORIGIN':    'OGN',
  'KYBER':     'KNC',
  'RENDER':    'RNDR',   // Render Token rebranded but RNDR still works on Yahoo
};

// Map exchange prefixes to Yahoo Finance suffixes
// Handles tickers in EXCHANGE:TICKER format (e.g., EPA:ASML, ASX:DRO, ETR:P911)
const EXCHANGE_SUFFIX_MAP: Record<string, string> = {
  'EPA': '.PA',   // Euronext Paris
  'ETR': '.DE',   // XETRA Frankfurt
  'FRA': '.F',    // Frankfurt
  'ASX': '.AX',   // Australian Stock Exchange
  'AMS': '.AS',   // Euronext Amsterdam
  'BIT': '.MI',   // Borsa Italiana
  'LSE': '.L',    // London Stock Exchange
  'TSE': '.T',    // Tokyo Stock Exchange
  'HKG': '.HK',  // Hong Kong
  'NSE': '.NS',   // India NSE
  'BME': '.MC',   // Spanish BME (same as IBEX)
};

/**
 * Extracts the clean base ticker from display names like "Bitcoin · Trade Republic"
 * or raw tickers like "BTCEUR", "BTCUSDT".
 */
function extractBaseTicker(symbol: string): { base: string; currency: string; yahooSymbol?: string } {
  // Strip platform display suffix: "Bitcoin · Trade Republic" → just the ticker part
  const s = symbol.toUpperCase().trim().split('·')[0].trim().split(' ')[0];

  // ── EXCHANGE:TICKER format (EPA:ASML, ASX:DRO, ETR:P911, FRA:3IB) ──────────
  if (/^[A-Z]{2,4}:[A-Z0-9]{1,8}$/.test(s)) {
    const [exchange, tkr] = s.split(':');
    const suffix = EXCHANGE_SUFFIX_MAP[exchange];
    const yahooSym = suffix ? `${tkr}${suffix}` : tkr;
    return { base: tkr, currency: 'EUR', yahooSymbol: yahooSym };
  }

  // ── Underscore tickers (MSCI_INDO, CLEAN_NRG) — custom ETF names ───────────
  // These likely don't have a standard Yahoo symbol; skip price fetch
  if (s.includes('_')) return { base: s, currency: 'EUR' };

  // EUR suffix without separator (Trade Republic): BTCEUR → BTC/EUR
  if (/^[A-Z]{2,8}EUR$/.test(s) && !['VEUR', 'VERX'].includes(s)) {
    const base = s.replace(/EUR$/, '');
    if (CRYPTO_BASE_TICKERS.has(base)) return { base, currency: 'EUR' };
  }
  // USDT/USDC suffix (Binance): BTCUSDT → BTC/USD
  if (/^[A-Z]{2,8}USDT$/.test(s) || /^[A-Z]{2,8}USDC$/.test(s)) {
    const base = s.replace(/USDT$/, '').replace(/USDC$/, '');
    if (CRYPTO_BASE_TICKERS.has(base)) return { base, currency: 'USD' };
  }
  // BTC pair: ETHBTC → ETH (price in BTC, approximate in USD)
  if (/^[A-Z]{2,8}BTC$/.test(s) && s !== 'BTC') {
    const base = s.replace(/BTC$/, '');
    if (CRYPTO_BASE_TICKERS.has(base)) return { base, currency: 'USD' };
  }
  // With separator: BTC-USD, ETH-EUR
  if (/^[A-Z]+-[A-Z]{3}$/.test(s)) {
    const [base, curr] = s.split('-');
    return { base, currency: curr };
  }

  return { base: s, currency: 'USD' };
}

/**
 * Normalizes any asset ticker to a Yahoo Finance–compatible symbol.
 */
export function normalizeSymbol(symbol: string): string {
  const { base, currency, yahooSymbol } = extractBaseTicker(symbol);

  // If extractBaseTicker already resolved to a Yahoo symbol (e.g., ETR:P911 → P911.DE), use it
  if (yahooSymbol) return yahooSymbol;

  // Resolve full-name aliases (SYNTHETIX → SNX, CURVE → CRV, etc.)
  const resolvedBase = FULL_NAME_TO_TICKER[base] ?? base;

  // Known crypto → add -USD or -EUR suffix
  if (CRYPTO_BASE_TICKERS.has(resolvedBase)) return `${resolvedBase}-${currency}`;

  // IBEX 35 → .MC suffix
  if (IBEX_SYMBOLS.has(resolvedBase)) return `${resolvedBase}.MC`;

  // European stocks
  if (EURONEXT_SYMBOLS[resolvedBase]) return EURONEXT_SYMBOLS[resolvedBase];

  // Return resolved base (US stocks, ETFs, etc.)
  return resolvedBase;
}

/**
 * Obtiene datos de mercado en tiempo real para uno o varios símbolos.
 * Deduplicates and skips empty/invalid symbols.
 */
export async function getMarketData(symbols: string[]): Promise<MarketQuote[]> {
  try {
    // Normalize and deduplicate
    const uniqueNormalized = [...new Set(
      symbols
        .filter(s => s && s.trim().length > 0)
        .map(normalizeSymbol)
        .filter(s => s.length > 0)
    )];

    const results = await Promise.all(
      uniqueNormalized.map(async (s) => {
        try {
          const rawQuote = await yahooFinance.quote(s);
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
          // Don't log 404s as errors — many less-known tickers won't be on Yahoo
          if (!(e instanceof Error && e.message.includes('No fundamentals data'))) {
            console.warn(`Could not fetch quote for ${s}`);
          }
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
