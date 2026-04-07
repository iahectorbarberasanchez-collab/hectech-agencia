import { FinancialSummary, FinancialTable } from "@/context/FinancialContext";
import { PortfolioAsset, Transaction } from "./supabase";

const safeNum = (val: any): number => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

/** Returns true if a string looks purely numeric (e.g. "1433.542898") */
function isNumericString(s: string): boolean {
  if (!s || s.trim() === '') return false;
  return !isNaN(Number(s.replace(/[,. ]/g, '')));
}

/** Aggregate/category row type labels that should NOT be imported as individual assets */
const AGGREGATE_TYPES = new Set([
  'PATRIMONIO TOTAL', 'PATRIMONIO', 'TOTAL CARTERA', 'TOTAL PORTFOLIO',
  'CARTERA TOTAL', 'RESUMEN', 'CONSOLIDADO', 'TOTAL ACTIVOS', 'ACTIVOS TOTAL',
  'TOTAL GENERAL', 'SUBTOTAL', 'GRAND TOTAL',
]);

/** Category labels that are groupings of assets, not individual holdings */
const CATEGORY_TYPES = new Set([
  'CRIPTOMONEDAS', 'CRIPTO', 'ACCIONES', 'RENTA VARIABLE',
  'RENTA FIJA', 'FONDOS', 'ETF', 'INMUEBLES', 'MATERIAS PRIMAS',
  'COMMODITIES', 'DERIVADOS', 'OPCIONES', 'FUTUROS',
]);

/** Known broker / exchange names — should NOT appear as asset names */
const KNOWN_BROKERS = new Set([
  'QUANTFURY', 'BINANCE', 'TRADE REPUBLIC', 'TRADEREPUBLIC',
  'DEGIRO', 'DE GIRO', 'INTERACTIVE BROKERS', 'INTERACTIVEBROKERS', 'IBKR',
  'MYINVESTOR', 'MY INVESTOR', 'ETORO', 'REVOLUT', 'COINBASE', 'KRAKEN',
  'BITSTAMP', 'BITFINEX', 'BYBIT', 'KUCOIN', 'HUOBI', 'OKX', 'GATE.IO',
  'RENTA 4', 'BANKINTER', 'SELFBANK', 'SELF BANK', 'XTB', 'PLUS500',
  'IG', 'CAPITAL.COM', 'SWISSQUOTE', 'SAXO', 'SAXOBANK', 'FIDELITY',
  'CHARLES SCHWAB', 'TD AMERITRADE', 'ROBINHOOD', 'WEBULL', 'MOOMOO',
]);

/** Crypto ticker patterns */
const CRYPTO_TICKERS = new Set([
  // Layer 1 / Major
  'BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOGE', 'DOT', 'AVAX', 'MATIC',
  'LINK', 'UNI', 'LTC', 'BCH', 'ATOM', 'ALGO', 'XLM', 'VET', 'FIL',
  'TRX', 'ETC', 'XMR', 'DASH', 'ZEC', 'NEAR', 'ICP', 'SAND', 'MANA',
  'AXS', 'THETA', 'EOS', 'CAKE', 'CRO', 'FTM', 'LUNA', 'SHIB', 'PEPE',
  'ARB', 'OP', 'APT', 'SUI', 'SEI', 'INJ', 'TIA', 'BLUR', 'WLD',
  'BNB', 'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP',
  // Gaming / NFT / Meme
  'ENJ', 'POPCAT', 'BONK', 'WIF', 'FLOKI', 'TURBO', 'MEME', 'BOME',
  'MYRO', 'SLERF', 'SILLY', 'CATS', 'NEIRO', 'MOG', 'CATI',
  // DeFi
  'AAVE', 'COMP', 'MKR', 'SNX', 'YFI', 'BAL', 'SUSHI', 'CRV', 'LDO',
  'RPL', '1INCH', 'DYDX', 'GMX', 'PERP', 'RUNE', 'OSMO', 'LRC',
  // AI / Data
  'FET', 'OCEAN', 'RNDR', 'GRT', 'NMR', 'AGIX', 'TAO', 'WLD',
  // Older altcoins / Trade Republic listed
  'BEAM', 'QTUM', 'HBAR', 'EGLD', 'FLOW', 'IMX', 'ROSE', 'KAVA',
  'ONE', 'CELO', 'XTZ', 'BAT', 'ZRX', 'BAND', 'ANKR', 'CHZ',
  'HOT', 'OMG', 'IOTA', 'ICX', 'ZIL', 'ONT', 'WAVES', 'SC', 'DCR',
  'LSK', 'NANO', 'STMX', 'REP', 'MLN', 'PIXEL', 'PYTH', 'JUP',
  'STRK', 'MANTA', 'ALT', 'DYM', 'ACE', 'PORTAL', 'MAVIA', 'SAGA',
  'NOT', 'DOGS', 'HMSTR', 'EIGEN', 'SCR', 'CELO', 'POL',
  // Common pair suffixes stripped: BTC-USD → BTC, ETH-EUR → ETH
]);

/** Well-known ETF tickers */
const ETF_TICKERS = new Set([
  // Vanguard
  'VUAA', 'VWCE', 'VWRL', 'VUSA', 'VAGP', 'VGWL', 'VNRT', 'VFEM', 'VEUR',
  'VERX', 'VJPN', 'VFEA', 'VHYL', 'VAGF', 'VDPX', 'VOO', 'VTI', 'VEA', 'VWO',
  'VIG', 'VYM', 'VNQ', 'VB', 'VO', 'VV',
  // iShares
  'IWDA', 'SWRD', 'CSPX', 'IUSA', 'IUKD', 'IDVY', 'EMIM', 'IQQQ', 'IQQH',
  'IBTA', 'IBTM', 'IBTS', 'AGGH', 'AGGU', 'IEAG', 'IGLN',
  // US ETFs
  'QQQ', 'SPY', 'IVV', 'TQQQ', 'SQQQ', 'SPXL', 'UPRO',
  'TLT', 'IEF', 'SHY', 'LQD', 'HYG', 'JNK', 'BND', 'BNDW', 'AGG',
  'GLD', 'IAU', 'SLV', 'PHGP', 'SGLN', 'PHPP',
  // Sector SPDR (US)
  'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLC', 'XLRE', 'XLU', 'XLB', 'XLP',
  // Sector ETFs (Europe / Trade Republic)
  'DFEN', 'ITA', 'PPA', 'FITE', 'WAR', 'NATO',   // Aerospace & Defense
  'XXX',                                            // Trade Republic Aerospace & Defense ETF
  'EQQQ', 'NQSE',
  // ARK
  'ARKK', 'ARKG', 'ARKQ', 'ARKW', 'ARKF',
  // Other
  'ACWI', 'EEM', 'EFA', 'MSCI',
]);

/** Precious metals */
const METAL_TICKERS = new Set([
  'XAU', 'XAG', 'XPT', 'XPD', 'GOLD', 'SILVER', 'PLAT', 'PALL',
  'GLD', 'IAU', 'SLV', 'PHGP', 'SGLN', 'PHPP', 'GLDA', 'GOLDA',
]);

const CRYPTO_DISPLAY_NAMES: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', XRP: 'Ripple', ADA: 'Cardano',
  DOT: 'Polkadot', LINK: 'Chainlink', AVAX: 'Avalanche', MATIC: 'Polygon',
  DOGE: 'Dogecoin', LTC: 'Litecoin', BCH: 'Bitcoin Cash', ATOM: 'Cosmos',
  UNI: 'Uniswap', AAVE: 'Aave', BNB: 'BNB', NEAR: 'NEAR', ICP: 'Internet Computer',
  SAND: 'The Sandbox', MANA: 'Decentraland', AXS: 'Axie Infinity', ENJ: 'Enjin',
  BEAM: 'Beam', QTUM: 'Qtum', HBAR: 'Hedera', EGLD: 'MultiversX', FLOW: 'Flow',
  IMX: 'Immutable X', GRT: 'The Graph', FET: 'Fetch.ai', RNDR: 'Render',
  ARB: 'Arbitrum', OP: 'Optimism', SUI: 'Sui', APT: 'Aptos', INJ: 'Injective',
  TIA: 'Celestia', JUP: 'Jupiter', POPCAT: 'Popcat', CHZ: 'Chiliz',
  XLM: 'Stellar', VET: 'VeChain', FIL: 'Filecoin', TRX: 'TRON',
  SNX: 'Synthetix', LRC: 'Loopring',
};

const PLATFORM_SHEET_NAMES = new Set([
  'BINANCE', 'TRADE REPUBLIC', 'TRADEREPUBLIC', 'QUANTFURY', 'REVOLUT',
  'BITGET', 'GOIN', 'BITMART', 'GATE', 'GATE.IO', 'MEXC',
  'COINBASE', 'KRAKEN', 'BYBIT', 'KUCOIN',
]);

function detectPlatformFromTicker(rawTicker: string): string | null {
  const t = rawTicker.toUpperCase().trim();
  if (/[A-Z]{2,8}EUR$/.test(t) && !t.endsWith('USDT') && !t.endsWith('USDC')) {
    return 'Trade Republic';
  }
  if (/[A-Z]{2,8}USDT$/.test(t) || /[A-Z]{2,8}USDC$/.test(t)) return 'Binance';
  if (/[A-Z]{2,8}BTC$/.test(t) && t !== 'BTC') return 'Binance';
  return null;
}

function detectPlatformFromSheet(sheetName: string): string | null {
  const s = sheetName.toUpperCase().replace(/\s+/g, ' ').trim();
  for (const platform of PLATFORM_SHEET_NAMES) {
    if (s.includes(platform)) {
      if (platform === 'TRADEREPUBLIC' || platform === 'TRADE REPUBLIC') return 'Trade Republic';
      if (platform === 'GATE' || platform === 'GATE.IO') return 'Gate.io';
      return platform.charAt(0) + platform.slice(1).toLowerCase();
    }
  }
  return null;
}

/**
 * Auto-classifies an asset based on its ticker and/or name.
 * Returns one of: "Cripto", "ETF", "Acción", "Oro", "Cash", "Inversión"
 *
 * Handles Trade Republic crypto pairs without separator:
 *   BTCEUR, ETHEUR, XRPEUR, LINKEUR, ADAEUR, UNIEUR, BEAMEUR, etc.
 */
export function classifyAssetType(ticker: string, name: string): string {
  const rawT = (ticker || '').toUpperCase().trim();

  // ── EXCHANGE:TICKER format (EPA:ASML, ASX:DRO, ETR:P911, FRA:3IB) ──────────
  // These are always equities listed on a specific stock exchange
  if (/^[A-Z]{2,4}:[A-Z0-9]{1,8}$/.test(rawT)) return 'Acción';

  // ── Underscore tickers (MSCI_INDO, CLEAN_NRG) are custom ETF names ──────────
  if (rawT.includes('_')) return 'ETF';

  // Strip exchange prefix for further classification (e.g., EPA:ASML → ASML)
  const afterColon = rawT.includes(':') ? rawT.split(':')[1] : rawT;

  // Strip pair suffixes — both with separator (BTC-USD) and without (BTCEUR, BTCUSDT)
  // Order matters: strip longer suffixes first
  const t = afterColon
    .replace(/[-/](USDT|USDC|USD|EUR|GBP|CHF|BTC|ETH)$/, '')  // with separator
    .replace(/(USDT|USDC)$/, '')                                  // without separator — USDT first (longer)
    .replace(/(EUR|USD|GBP|CHF)$/, '');                           // without separator — fiat suffix

  const n = (name || '').toUpperCase().trim();

  // 1. Cash / Liquidity (check raw ticker before stripping too)
  if (['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CASH', 'EFECTIVO', 'LIQUIDEZ'].includes(rawT)) return 'Cash';
  if (['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CASH', 'EFECTIVO', 'LIQUIDEZ'].includes(t)) return 'Cash';
  if (['CASH', 'EFECTIVO', 'LIQUIDEZ', 'MONEY MARKET'].some(k => n.includes(k))) return 'Cash';

  // 2. Precious metals
  if (METAL_TICKERS.has(t) || METAL_TICKERS.has(rawT)) return 'Oro';
  if (['ORO', 'GOLD', 'PLATA', 'SILVER', 'PLATINO', 'PALADIO'].some(k => n.includes(k))) return 'Oro';

  // 3. Crypto — check stripped ticker first (handles BTCEUR → BTC, ETHEUR → ETH, etc.)
  if (CRYPTO_TICKERS.has(t)) return 'Cripto';
  if (CRYPTO_TICKERS.has(rawT)) return 'Cripto';
  // Crypto name patterns
  if (['BITCOIN', 'ETHEREUM', 'RIPPLE', 'CARDANO', 'SOLANA', 'DOGECOIN', 'LITECOIN',
       'POLKADOT', 'CHAINLINK', 'AVALANCHE', 'POLYGON', 'BINANCE COIN',
       'ENJIN', 'POPCAT', 'BEAM PROTOCOL', 'QTUM',
       'SYNTHETIX', 'LOOPRING'].some(k => n.includes(k))) return 'Cripto';
  // Extra fallback: if afterColon matches XXXEUR/XXXUSDT pattern → Trade Republic / Binance crypto
  if (/^[A-Z]{2,8}(EUR|USDT|USDC|USD|BTC)$/.test(afterColon) && t.length >= 2 && t.length <= 8) {
    return 'Cripto';
  }

  // 4. ETF (check before Acción to catch known ETFs)
  if (ETF_TICKERS.has(t) || ETF_TICKERS.has(rawT)) return 'ETF';
  // Common ETF name patterns
  if (['ISHARES', 'VANGUARD', 'AMUNDI', 'LYXOR', 'XTRACKERS', 'INVESCO', 'SPDR',
       'WISDOMTREE', 'VANECK', 'PIMCO', 'DIREXION', 'PROSHARES'].some(k => n.includes(k))) return 'ETF';
  // UCITS = almost always ETF (European regulation)
  if (n.includes('UCITS') || n.includes('SICAV') || n.includes('INDEX FUND') || n.includes('INDEX ETF')) return 'ETF';

  // 5. Stocks — short tickers (1-6 chars) that didn't match crypto/ETF
  if (t && t.length >= 1 && t.length <= 6) return 'Acción';

  // 6. Fallback
  return 'Inversión';
}

/**
 * Scans the financial summary and extracts potential portfolio assets.
 */
export function extractAssetsFromSummary(summary: FinancialSummary): Partial<PortfolioAsset>[] {
  const detectedAssets: Partial<PortfolioAsset>[] = [];
  const seenKeys = new Set<string>();

  summary.sheets.forEach(sheet => {
    const allTables = sheet.tables;
    // Prioritize 'summary' tables if they exist in the sheet
    const summaryTables = allTables.filter(t => t.type === 'summary');
    const tablesToProcess = summaryTables.length > 0 ? summaryTables : allTables;

    const sheetPlatform = detectPlatformFromSheet(sheet.name);

    tablesToProcess.forEach(table => {
      const colMap = (table as any).columnMap || {};

      // We need at least a name or a ticker to consider it an asset row
      const nameCol = colMap.asset_name;
      const tickerCol = colMap.ticker;
      const valueCol = colMap.current_value || colMap.total_invested || colMap.value_eur;

      if (!nameCol && !tickerCol) return;

      table.data.forEach((row: any) => {
        let name = String(row[nameCol] || "").trim();
        const ticker = String(row[tickerCol] || "").trim().toUpperCase();
        const rawAssetType = String(row[colMap.asset_type] || "").trim().toUpperCase();

        // Detect platform
        const tickerPlatform = detectPlatformFromTicker(ticker);
        const platform = tickerPlatform ?? sheetPlatform ?? null;
        const quantity = safeNum(row[colMap.quantity]);
        const avgPrice = safeNum(row[colMap.avg_price]);
        const currentPrice = safeNum(row[colMap.current_price]);
        // Best price for purchase: avg_price first, then current_price
        const purchasePrice = avgPrice > 0 ? avgPrice : 0;

        // ── Skip aggregate/total rows ────────────────────────────────
        if (AGGREGATE_TYPES.has(rawAssetType)) return;
        // Skip category rows that have no ticker (e.g. "CRIPTOMONEDAS" group row)
        if (CATEGORY_TYPES.has(rawAssetType) && !ticker) return;

        // ── Reject broker/exchange names used as asset names ─────────
        const nameUpper = name.toUpperCase();
        if (KNOWN_BROKERS.has(nameUpper)) {
          if (ticker) {
            name = ticker; // Use ticker as fallback
          } else {
            return; // Cannot identify the asset — skip
          }
        }

        // ── Recover name if it's numeric ─────────────────────────────
        if (isNumericString(name)) {
          if (ticker) {
            name = ticker;
          } else {
            return;
          }
        }

        // ── If name is empty but ticker exists, use ticker ────────────
        if (!name && ticker) name = ticker;

        // Format a human-readable name that includes the platform (so BTC·TR ≠ BTC·Binance)
        if (platform) {
          const baseTicker = ticker
            .replace(/[-/](USDT|USDC|USD|EUR|GBP|CHF|BTC|ETH)$/, '')
            .replace(/(USDT|USDC)$/, '')
            .replace(/(EUR|USD|GBP|CHF)$/, '')
            .toUpperCase();
          const cryptoDisplayName = CRYPTO_DISPLAY_NAMES[baseTicker];
          if (cryptoDisplayName && (CRYPTO_TICKERS.has(baseTicker) || classifyAssetType(ticker, name) === 'Cripto')) {
            name = `${cryptoDisplayName} · ${platform}`;
          } else if (name && name !== ticker) {
            name = `${name} · ${platform}`;
          } else {
            name = `${ticker} · ${platform}`;
          }
        }

        // Total invested: explicit column, or calculate from qty × price
        const totalInvestedCol = colMap.total_invested;
        let totalInvested = totalInvestedCol ? safeNum(row[totalInvestedCol]) : 0;
        if (totalInvested <= 0 && quantity > 0 && purchasePrice > 0) {
          totalInvested = quantity * purchasePrice;
        }

        // Current value: explicit column, or calculate from qty × current_price
        const currentValueCol = colMap.current_value;
        let currentValue = currentValueCol ? safeNum(row[currentValueCol]) : 0;
        if (currentValue <= 0 && quantity > 0 && currentPrice > 0) {
          currentValue = quantity * currentPrice;
        }

        // value_eur for display: prefer current value, then invested
        const valueEur = currentValue > 0 ? currentValue : totalInvested;

        // Filter out clearly invalid rows
        if (!name && !ticker) return;
        if (valueEur <= 0 && quantity <= 0) return;

        // Dedup within the same file extraction
        const dedupKey = `${ticker || 'NO_TICKER'}_${platform || 'NO_PLATFORM'}_${name}`.toUpperCase();
        if (seenKeys.has(dedupKey)) return;
        seenKeys.add(dedupKey);

        // ── Auto-classify asset type ──────────────────────────────────
        // Priority: explicit column value → auto-classify from ticker/name
        let assetType = String(row[colMap.asset_type] || "").trim();
        // Normalize common raw type values from Spanish spreadsheets
        const assetTypeUpper = assetType.toUpperCase();
        if (!assetType
          || assetTypeUpper === 'INVERSIÓN'
          || assetTypeUpper === 'INVERSION'
          || assetTypeUpper === 'ACTIVO'
          || assetTypeUpper === 'ASSET'
          || assetTypeUpper === 'N/A'
          || assetTypeUpper === '-'
        ) {
          assetType = classifyAssetType(ticker, name);
        }

        detectedAssets.push({
          asset_name: name || ticker || "Activo detectado",
          ticker: ticker || "",
          quantity: quantity > 0 ? quantity : undefined,
          purchase_price: purchasePrice > 0 ? purchasePrice : undefined,
          value_eur: valueEur > 0 ? valueEur : 0,
          asset_type: assetType,
          allocation_percent: safeNum(row[colMap.weight]),
          target_percent: 0,
        });
      });
    });
  });

  // Set target_percent = current allocation weight
  const totalValue = detectedAssets.reduce((s, a) => s + (a.value_eur ?? 0), 0);
  if (totalValue > 0) {
    detectedAssets.forEach(a => {
      const explicitWeight = a.allocation_percent ?? 0;
      a.target_percent = explicitWeight > 0
        ? Math.round(explicitWeight * 100) / 100
        : Math.round(((a.value_eur ?? 0) / totalValue) * 10000) / 100;
    });
  }

  return detectedAssets;
}

/**
 * Classifies a transaction based on keywords in its description.
 */
function classifyTransaction(desc: string, amount: number): string {
  const d = desc.toUpperCase();

  if (d.includes('DIVIDENDO') || d.includes('DIVIDEND') || d.includes('COUPON') || d.includes('CUPON') || d.includes('INTERES')) {
    return "Ingreso Pasivo";
  }
  if (d.includes('COMISION') || d.includes('COMMISSION') || d.includes('FEE') || d.includes('GASTO') || d.includes('TAX') || d.includes('IMPUESTO')) {
    return "Gastos Operativos";
  }
  if (d.includes('DEPOSITO') || d.includes('DEPOSIT') || d.includes('TRANSFERENCIA') || d.includes('APORTACION') || d.includes('SALDO')) {
    return "Ahorro / Depósito";
  }
  if (d.includes('VENTA') || d.includes('SELL') || d.includes('LIQUIDACION')) {
    return "Desinversión";
  }
  if (d.includes('COMPRA') || d.includes('BUY') || d.includes('ADQUISICION')) {
    return "Inversión";
  }
  return "Inversión";
}

/**
 * Scans the financial summary and extracts individual transactions/movements.
 */
export function extractTransactionsFromSummary(summary: FinancialSummary): Partial<Transaction>[] {
  const detectedTransactions: Partial<Transaction>[] = [];
  const seenKeys = new Set<string>();

  summary.sheets.forEach(sheet => {
    const detailedTables = sheet.tables.filter(t => t.type === 'detailed');

    detailedTables.forEach(table => {
      const colMap = (table as any).columnMap || {};
      const dateCol = colMap.date || "FECHA";
      const descCol = colMap.asset_name || colMap.description || "DESCRIPCION";
      const amountCol = colMap.current_value || colMap.total_invested || "IMPORTE";

      table.data.forEach((row: any) => {
        const dateRaw = row[dateCol] || row['FECHA'] || row['DATE'];
        const desc = String(row[descCol] || row['DESCRIPCION'] || row['CONCEPTO'] || "Transacción").trim();
        const amount = safeNum(row[amountCol] || row['IMPORTE'] || row['AMOUNT']);

        if (!dateRaw || amount === 0) return;

        let dateStr = "";
        if (typeof dateRaw === 'number') {
          const jsDate = new Date((dateRaw - 25569) * 86400 * 1000);
          dateStr = isNaN(jsDate.getTime()) ? new Date().toISOString().split('T')[0] : jsDate.toISOString().split('T')[0];
        } else if (typeof dateRaw === 'string') {
          const parts = dateRaw.split(/[/-]/);
          if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else {
            try {
              dateStr = new Date(dateRaw).toISOString().split('T')[0];
            } catch(e) {
              dateStr = new Date().toISOString().split('T')[0];
            }
          }
        } else {
          try {
            dateStr = new Date(dateRaw).toISOString().split('T')[0];
          } catch(e) {
            dateStr = new Date().toISOString().split('T')[0];
          }
        }

        const dedupKey = `${dateStr}_${amount}_${desc.toUpperCase()}`;
        if (seenKeys.has(dedupKey)) return;
        seenKeys.add(dedupKey);

        detectedTransactions.push({
          date: dateStr,
          description: desc,
          amount: Math.abs(amount),
          type: amount >= 0 ? 'income' : 'expense',
          category: row[colMap.asset_type] || classifyTransaction(desc, amount)
        });
      });
    });
  });

  return detectedTransactions;
}
