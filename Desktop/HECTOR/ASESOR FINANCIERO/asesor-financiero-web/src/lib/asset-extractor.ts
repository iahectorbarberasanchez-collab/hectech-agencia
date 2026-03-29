import { FinancialSummary, FinancialTable } from "@/context/FinancialContext";
import { PortfolioAsset, Transaction } from "./supabase";

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
        const quantity = Number(row[colMap.quantity] || 0);
        const price = Number(row[colMap.avg_price] || row[colMap.current_price] || 0);
        const value = Number(row[valueCol] || 0);

        // Filter out clearly invalid rows (empty names AND tickers, or zero values)
        if (!name && !ticker) return;
        if (value <= 0 && quantity <= 0) return;

        // Dedup within the same file extraction
        const dedupKey = `${ticker || 'NO_TICKER'}_${name}`.toUpperCase();
        if (seenKeys.has(dedupKey)) return;
        seenKeys.add(dedupKey);

        detectedAssets.push({
          asset_name: name || ticker || "Activo detectado",
          ticker: ticker || "",
          quantity: quantity > 0 ? quantity : undefined,
          purchase_price: price > 0 ? price : undefined,
          value_eur: value > 0 ? value : (quantity * price),
          asset_type: row[colMap.asset_type] || "Inversión",
          allocation_percent: Number(row[colMap.weight] || 0),
          target_percent: 0
        });
      });
    });
  });

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
        const amount = Number(row[amountCol] || row['IMPORTE'] || row['AMOUNT'] || 0);

        if (!dateRaw || amount === 0) return;

        // Dedup key: Date + Amount + Desc (normalized)
        let dateStr = "";
        try {
           dateStr = new Date(dateRaw).toISOString().split('T')[0];
        } catch(e) {
           dateStr = String(dateRaw).split(' ')[0];
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
