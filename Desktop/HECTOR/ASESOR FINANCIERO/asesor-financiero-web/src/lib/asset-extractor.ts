import { FinancialSummary, FinancialTable } from "@/context/FinancialContext";
import { PortfolioAsset, Transaction } from "./supabase";

const safeNum = (val: any): number => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

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
        const name = String(row[nameCol] || "").trim();
        const ticker = String(row[tickerCol] || "").trim().toUpperCase();
        const quantity = safeNum(row[colMap.quantity]);
        const avgPrice = safeNum(row[colMap.avg_price]);
        const currentPrice = safeNum(row[colMap.current_price]);
        // Best price for purchase: avg_price first, then current_price
        const purchasePrice = avgPrice > 0 ? avgPrice : 0;

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

        detectedAssets.push({
          asset_name: name || ticker || "Activo detectado",
          ticker: ticker || "",
          quantity: quantity > 0 ? quantity : undefined,
          purchase_price: purchasePrice > 0 ? purchasePrice : undefined,
          value_eur: valueEur > 0 ? valueEur : 0,
          asset_type: String(row[colMap.asset_type] || "Inversión").trim(),
          allocation_percent: safeNum(row[colMap.weight]),
          target_percent: 0, // will be recalculated below from real weights
        });
      });
    });
  });

  // Set target_percent = current allocation weight so rebalancing uses real distribution.
  // If the Excel already provided explicit weight, use that; otherwise calculate from value_eur.
  const totalValue = detectedAssets.reduce((s, a) => s + (a.value_eur ?? 0), 0);
  if (totalValue > 0) {
    detectedAssets.forEach(a => {
      const explicitWeight = a.allocation_percent ?? 0;
      a.target_percent = explicitWeight > 0
        ? Math.round(explicitWeight * 100) / 100
        : Math.round(((a.value_eur ?? 0) / totalValue) * 10000) / 100; // 2-decimal %
    });
  }

  return detectedAssets;
}

/**
 * Classifies a transaction based on keywords in its description.
 */
function classifyTransaction(desc: string, amount: number): string {
  const d = desc.toUpperCase();
  
  // High priority: Passive Income / Dividends
  if (d.includes('DIVIDENDO') || d.includes('DIVIDEND') || d.includes('COUPON') || d.includes('CUPON') || d.includes('INTERES')) {
    return "Ingreso Pasivo";
  }

  // Expenses / Fees
  if (d.includes('COMISION') || d.includes('COMMISSION') || d.includes('FEE') || d.includes('GASTO') || d.includes('TAX') || d.includes('IMPUESTO')) {
    return "Gastos Operativos";
  }

  // Deposits / Savings
  if (d.includes('DEPOSITO') || d.includes('DEPOSIT') || d.includes('TRANSFERENCIA') || d.includes('APORTACION') || d.includes('SALDO')) {
    return "Ahorro / Depósito";
  }

  // Buy / Sell
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
    // For transactions, we want 'detailed' tables (movements, buy/sell logs)
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

        // Dedup key: Date + Amount + Desc (normalized)
        let dateStr = "";
        if (typeof dateRaw === 'number') {
          // Excel serial number (days since 1900-01-01)
          const jsDate = new Date((dateRaw - 25569) * 86400 * 1000);
          dateStr = isNaN(jsDate.getTime()) ? new Date().toISOString().split('T')[0] : jsDate.toISOString().split('T')[0];
        } else if (typeof dateRaw === 'string') {
          // DD/MM/YYYY text format
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
