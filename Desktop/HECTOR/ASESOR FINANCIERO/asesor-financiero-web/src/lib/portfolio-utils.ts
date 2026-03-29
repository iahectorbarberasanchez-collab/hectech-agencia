/**
 * Portfolio Enrichment Utilities
 */

export interface EnrichedAsset {
  name: string;
  type: string;
  quantity: number;
  avgPrice: number;
  investedCapital: number;
  currentPrice: number;
  currentValue: number;
  profitEur: number;
  profitPercent: number;
  weightPortfolio: number;
}

/**
 * Enriches a financial row with calculated metrics.
 */
export function enrichRow(row: any, columnMap: Record<string, string>, currentPrice: number): EnrichedAsset {
  const quantity = Number(row[columnMap.quantity] || 0);
  const avgPrice = Number(row[columnMap.avg_price] || 0);
  const investedCapital = Number(row[columnMap.total_invested] || (quantity * avgPrice));
  
  const currentValue = quantity * currentPrice;
  const profitEur = currentValue - investedCapital;
  const profitPercent = investedCapital > 0 ? (profitEur / investedCapital) * 100 : 0;

  return {
    name: String(row[columnMap.asset_name] || 'Activo'),
    type: String(row[columnMap.asset_type] || 'Inversión'),
    quantity,
    avgPrice,
    investedCapital,
    currentPrice,
    currentValue,
    profitEur,
    profitPercent,
    weightPortfolio: 0 // Will be calculated after summing all assets
  };
}

/**
 * Batch enriches assets and calculates weights.
 */
export function processPortfolio(assets: EnrichedAsset[]): EnrichedAsset[] {
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  
  return assets.map(a => ({
    ...a,
    weightPortfolio: totalValue > 0 ? (a.currentValue / totalValue) * 100 : 0
  }));
}

/**
 * Extracts key financial metrics for the Dashboard Hub.
 */
export function getDashboardSummary(summary: any) {
  if (!summary || !summary.sheets || summary.sheets.length === 0) {
    return { netWorth: 0, monthlyIncome: 0, monthlyExpenses: 0, savingsRate: 0 };
  }

  let netWorth = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  // Scan all sheets for totals
  summary.sheets.forEach((sheet: any) => {
    const totals = sheet.numericTotals || {};
    
    Object.entries(totals).forEach(([col, val]) => {
      const c = col.toLowerCase();
      const v = Number(val);

      // Patrimonio / Saldo
      if (c.includes('saldo') || c.includes('total') || c.includes('patrimonio') || c.includes('valor')) {
        netWorth += v;
      }
      // Ingresos
      if (c.includes('ingreso') || c.includes('sueldo') || c.includes('cobro')) {
        monthlyIncome += v;
      }
      // Gastos
      if (c.includes('gasto') || c.includes('pago') || c.includes('factura')) {
        monthlyExpenses += v;
      }
    });
  });

  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  return {
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    savingsRate
  };
}
