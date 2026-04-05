/**
 * Calculadora de Plusvalías FIFO (First In, First Out)
 * Sistema fiscal español: base del ahorro IRPF 2025
 * Tramos: 0-6k€ → 19%, 6k-50k€ → 21%, 50k-200k€ → 23%, 200k-300k€ → 27%, >300k€ → 28%
 */

export interface BuyLot {
  date: string;        // YYYY-MM-DD
  quantity: number;
  price: number;       // precio por unidad en el momento de compra
  fees?: number;       // comisiones de compra (se suman al coste)
}

export interface SellOrder {
  date: string;
  ticker: string;
  asset_name: string;
  quantity: number;
  price: number;       // precio de venta por unidad
  fees?: number;       // comisiones de venta
}

export interface FIFOLot {
  buy_date: string;
  quantity_sold: number;
  buy_price: number;
  sell_price: number;
  cost_basis: number;
  proceeds: number;
  gain_loss: number;
  holding_days: number;
}

export interface FIFOResult {
  ticker: string;
  asset_name: string;
  sell_date: string;
  quantity_sold: number;
  sell_price: number;
  total_proceeds: number;
  total_cost_basis: number;
  total_gain_loss: number;
  is_gain: boolean;
  lots: FIFOLot[];
  // Fiscal español
  tax_base: number;             // base imponible (ganancias - pérdidas)
  estimated_tax: number;        // IRPF estimado
  effective_tax_rate: number;   // tipo efectivo %
  net_after_tax: number;
  // Regla 2 meses (washsale española)
  wash_sale_warning: boolean;
}

export interface FIFOSummary {
  results: FIFOResult[];
  total_gains: number;
  total_losses: number;
  net_gain_loss: number;
  total_tax: number;
  compensated_base: number; // ganancias - pérdidas compensadas
  remaining_losses: number; // pérdidas que pasan a los 4 años siguientes
}

// Tipo impositivo IRPF base del ahorro España 2025
function calcSpanishTax(gainLoss: number): number {
  if (gainLoss <= 0) return 0;
  let tax = 0;
  let remaining = gainLoss;

  const brackets = [
    { limit: 6000,   rate: 0.19 },
    { limit: 44000,  rate: 0.21 }, // 6k→50k
    { limit: 150000, rate: 0.23 }, // 50k→200k
    { limit: 100000, rate: 0.27 }, // 200k→300k
    { limit: Infinity, rate: 0.28 },
  ];

  for (const bracket of brackets) {
    const taxable = Math.min(remaining, bracket.limit);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }
  return Math.round(tax * 100) / 100;
}

function daysBetween(d1: string, d2: string): number {
  const diff = new Date(d2).getTime() - new Date(d1).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calcula plusvalías/minusvalías con método FIFO para una venta.
 * @param buyLots - Lista de lotes de compra ordenados por fecha (FIFO = primero en entrar)
 * @param sell - Datos de la venta
 */
export function calculateFIFO(buyLots: BuyLot[], sell: SellOrder): FIFOResult {
  // Ordenar por fecha de compra (FIFO)
  const lots = [...buyLots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let remainingQty = sell.quantity;
  const matchedLots: FIFOLot[] = [];
  let totalCostBasis = 0;

  for (const lot of lots) {
    if (remainingQty <= 0) break;
    if (lot.quantity <= 0) continue;

    const qtyFromLot = Math.min(remainingQty, lot.quantity);
    const lotCostPerUnit = lot.price + (lot.fees ? lot.fees / lot.quantity : 0);
    const costBasis = qtyFromLot * lotCostPerUnit;
    const proceeds = qtyFromLot * sell.price;
    const gainLoss = proceeds - costBasis;

    matchedLots.push({
      buy_date: lot.date,
      quantity_sold: qtyFromLot,
      buy_price: lot.price,
      sell_price: sell.price,
      cost_basis: Math.round(costBasis * 100) / 100,
      proceeds: Math.round(proceeds * 100) / 100,
      gain_loss: Math.round(gainLoss * 100) / 100,
      holding_days: daysBetween(lot.date, sell.date),
    });

    totalCostBasis += costBasis;
    remainingQty -= qtyFromLot;
  }

  const totalProceeds = sell.quantity * sell.price - (sell.fees || 0);
  const totalGainLoss = totalProceeds - totalCostBasis;
  const isGain = totalGainLoss > 0;
  const estimatedTax = isGain ? calcSpanishTax(totalGainLoss) : 0;
  const effectiveTaxRate = isGain && totalGainLoss > 0 ? (estimatedTax / totalGainLoss) * 100 : 0;

  // Regla 2 meses: si venta con pérdida y hay recompra en ±2 meses, pierde ventaja fiscal
  const washSaleWarning = !isGain; // aviso genérico cuando hay pérdida

  return {
    ticker: sell.ticker,
    asset_name: sell.asset_name,
    sell_date: sell.date,
    quantity_sold: sell.quantity,
    sell_price: sell.price,
    total_proceeds: Math.round(totalProceeds * 100) / 100,
    total_cost_basis: Math.round(totalCostBasis * 100) / 100,
    total_gain_loss: Math.round(totalGainLoss * 100) / 100,
    is_gain: isGain,
    lots: matchedLots,
    tax_base: Math.round(totalGainLoss * 100) / 100,
    estimated_tax: estimatedTax,
    effective_tax_rate: Math.round(effectiveTaxRate * 10) / 10,
    net_after_tax: Math.round((totalProceeds - estimatedTax) * 100) / 100,
    wash_sale_warning: washSaleWarning,
  };
}

/** Consolida múltiples operaciones de venta con compensación de G/P */
export function summarizeFIFO(results: FIFOResult[]): FIFOSummary {
  const gains  = results.filter(r => r.total_gain_loss > 0).reduce((s, r) => s + r.total_gain_loss, 0);
  const losses = results.filter(r => r.total_gain_loss < 0).reduce((s, r) => s + Math.abs(r.total_gain_loss), 0);
  const netGainLoss = gains - losses;

  // Compensación: las pérdidas reducen la base imponible de las ganancias (hasta el 100% desde 2015)
  const compensatedBase = Math.max(0, netGainLoss);
  const remainingLosses = netGainLoss < 0 ? Math.abs(netGainLoss) : 0;
  const totalTax = calcSpanishTax(compensatedBase);

  return {
    results,
    total_gains: Math.round(gains * 100) / 100,
    total_losses: Math.round(losses * 100) / 100,
    net_gain_loss: Math.round(netGainLoss * 100) / 100,
    total_tax: totalTax,
    compensated_base: Math.round(compensatedBase * 100) / 100,
    remaining_losses: Math.round(remainingLosses * 100) / 100,
  };
}
