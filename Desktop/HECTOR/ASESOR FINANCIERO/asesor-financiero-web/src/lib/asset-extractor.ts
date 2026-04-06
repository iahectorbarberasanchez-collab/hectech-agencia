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
  'BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOGE', 'DOT', 'AVAX', 'MATIC',
  'LINK', 'UNI', 'LTC', 'BCH', 'ATOM', 'ALGO', 'XLM', 'VET', 'FIL',
  'TRX', 'ETC', 'XMR', 'DASH', 'ZEC', 'NEAR', 'ICP', 'SAND', 'MANA',
  'AXS', 'THETA', 'EOS', 'CAKE', 'CRO', 'FTM', 'LUNA', 'SHIB', 'PEPE',
  'ARB', 'OP', 'APT', 'SUI', 'SEI', 'INJ', 'TIA', 'BLUR', 'WLD',
  'BNB', 'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP',
  // Common pair suffixes stripped: BTC-USD → BTC, ETH-EUR → ETH
]);

/** Well-known ETF tickers */
const ETF_TICKERS = new Set([
  'VUAA', 'VWCE', 'VWRL', 'VUSA', 'VAGP', 'VGWL', 'VNRT',
  'IWDA', 'SWRD', 'CSPX', 'IUSA', 'IUKD', 'IDVY', 'EMIM',
  'NQSE', 'EQQQ', 'QQQ', 'SPY', 'VOO', 'VTI', 'IVV', 'VEA', 'VWO',
  'AGGH', 'AGGU', 'VAGF', 'TLT', 'IEF', 'LQD', 'HYG',
  'GLD', 'IAU', 'SLV', 'PHGP', 'SGLN', 'PHPP',
  'ARKK', 'ARKG', 'ARKQ', 'ARKW', 'ARKF',
  'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLC', 'XLRE',
  'MSCI', 'ACWI', 'EEM', 'EFA', 'AGG', 'BND', 'BNDW',
  // iShares / Amundi / Lyxor / Xtrackers common patterns
]);

/** Precious metals */
const METAL_TICKERS = new Set([
  'XAU', 'XAG', 'XPT', 'XPD', 'GOLD', 'SILVER', 'PLAT', 'PALL',
  'GLD', 'IAU', 'SLV', 'PHGP', 'SGLN', 'PHPP', 'GLDA', 'GOLDA',
]);

/**
 * Auto-classifies an asset based on its ticker and/or name.
 * Returns one of: "Cripto", "ETF", "Acción", "Oro", "Cash", "Inversión"
 */
export function classifyAssetType(ticker: string, name: string): string {
  const t = (ticker || '').toUpperCase().replace(/[-/](USD|EUR|USDT|BTC|GBP)$/, '').trim();
  const n = (name || '').toUpperCase().trim();

  // 1. Cash / Liquidity
  if (['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CASH', 'EFECTIVO', 'LIQUIDEZ'].includes(t)) return 'Cash';
  if (['CASH', 'EFECTIVO', 'LIQUIDEZ', 'MONEY MARKET'].some(k => n.includes(k))) return 'Cash';

  // 2. Precious metals (check before ETF since GLD/IAU are also ETF tickers but by convention they're metals)
  if (METAL_TICKERS.has(t)) return 'Oro';
  if (['ORO', 'GOLD', 'PLATA', 'SILVER', 'PLATINO', 'PALADIO'].some(k => n.includes(k))) return 'Oro';

  // 3. Crypto
  if (CRYPTO_TICKERS.has(t)) return 'Cripto';
  // Crypto name patterns
  if (['BITCOIN', 'ETHEREUM', 'RIPPLE', 'CARDANO', 'SOLANA', 'DOGECOIN', 'LITECOIN',
       'POLKADOT', 'CHAINLINK', 'AVALANCHE', 'POLYGON', 'BINANCE COIN'].some(k => n.includes(k))) return 'Cripto';
  // Pairs like BTC-USD, ETH-EUR
  if (/^(BTC|ETH|SOL|ADA|XRP|DOGE|DOT|AVAX|MATIC|LTC|BNB)[/-]/.test(ticker.toUpperCase())) return 'Cripto';

  // 4. ETF
  if (ETF_TICKERS.has(t)) return 'ETF';
  // Common ETF name patterns
  if (['ISHARES', 'VANGUARD', 'AMUNDI', 'LYXOR', 'XTRACKERS', 'INVESCO', 'SPDR',
       'WISDOMTREE', 'VANECK', 'PIMCO'].some(k => n.includes(k))) return 'ETF';
  // UCITS = almost always ETF (European regulation)
  if (n.includes('UCITS') || n.includes('SICAV') || n.includes('INDEX FUND')) return 'ETF';
  // Tickers with common ETF suffixes
  if (/^(I|V|S|X|A)[A-Z]{2,4}$/.test(t) && t.length <= 5) {
    // Short uppercase tickers starting with these letters are often ETFs, but not certain
    // Only classify as ETF if we're fairly confident — skip heuristic for now
  }

  // 5. Stocks — if it has a ticker and doesn't match above, assume it's a stock
  if (t && t.length >= 2 && t.length <= 6) return 'Acción';

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
        const dedupKey = `${ticker || 'NO_TICKER'}_${name}`.toUpperCase();
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
