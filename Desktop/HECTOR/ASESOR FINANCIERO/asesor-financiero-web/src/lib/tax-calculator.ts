import { FISCAL_DATA_ES } from './fiscal-data-es';

export interface TaxBreakdown {
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  byType: {
    general: { base: number; tax: number; rate: number };
    savings: { base: number; tax: number; rate: number };
  };
}

export interface OptimizationScenario {
  current: TaxBreakdown;
  optimized: TaxBreakdown;
  savings: number;
  suggestions: { title: string; description: string; impact: number }[];
}

/**
 * Calculates progressive tax based on brackets.
 */
function calculateProgressive(amount: number, brackets: { hasta?: number; tipo: number; superior?: number }[]): number {
  let tax = 0;
  let remaining = amount;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const limit = bracket.hasta || Infinity;
    const taxableInThisBracket = Math.min(remaining, limit - previousLimit);
    
    if (taxableInThisBracket <= 0) break;

    tax += taxableInThisBracket * bracket.tipo;
    remaining -= taxableInThisBracket;
    previousLimit = limit;
  }

  return tax;
}

/**
 * Main tax calculation engine.
 */
export function calculateTax(generalBase: number, savingsBase: number): TaxBreakdown {
  const generalTax = calculateProgressive(generalBase, FISCAL_DATA_ES.irpf.tramos_estatales);
  const savingsTax = calculateProgressive(savingsBase, FISCAL_DATA_ES.irpf.ahorro);

  const totalBase = generalBase + savingsBase;
  const totalTax = generalTax + savingsTax;

  // Find marginal rates
  const generalMarginal = FISCAL_DATA_ES.irpf.tramos_estatales.find(b => !b.hasta || generalBase < b.hasta)?.tipo || 0.47;
  const savingsMarginal = FISCAL_DATA_ES.irpf.ahorro.find(b => !b.hasta || savingsBase < b.hasta)?.tipo || 0.30;

  return {
    totalTax,
    effectiveRate: totalBase > 0 ? (totalTax / totalBase) : 0,
    marginalRate: generalMarginal, // Usamos la general como referencia principal
    byType: {
      general: { base: generalBase, tax: generalTax, rate: generalBase > 0 ? generalTax / generalBase : 0 },
      savings: { base: savingsBase, tax: savingsTax, rate: savingsBase > 0 ? savingsTax / savingsBase : 0 }
    }
  };
}

/**
 * Runs optimization simulations.
 */
export function runOptimization(income: number, gains: number, losses: number = 0): OptimizationScenario {
  // Scenario 1: Current
  const netGains = Math.max(0, gains - losses);
  const current = calculateTax(income, netGains);

  // Scenario 2: Optimized
  // Leverage 1: Pension Plan (Max 1500€ deduction)
  const pensionContribution = 1500;
  const optimizedGeneralBase = Math.max(0, income - pensionContribution);
  
  // Leverage 2: More loss harvesting (simulated or actual)
  // If user has gains and no losses, suggest 25% compensation if they have pending losses
  // For this mock, we just use the current losses but we can "force" a scenario
  const optimized = calculateTax(optimizedGeneralBase, netGains);

  const savings = current.totalTax - optimized.totalTax;

  const suggestions = [];
  if (income > 15000) {
    suggestions.push({
      title: "Plan de Pensiones",
      description: `Aporta 1.500€ (máximo legal) para reducir tu base imponible. Te ahorrarías el ${Math.round(current.marginalRate * 100)}% de esa aportación.`,
      impact: pensionContribution * current.marginalRate
    });
  }

  if (gains > 0 && losses < gains) {
    suggestions.push({
      title: "Venta de Activos en Pérdida",
      description: "Si tienes posiciones en pérdidas, venderlas ahora compensaría tus ganancias del año, reduciendo el impuesto del ahorro.",
      impact: (gains - netGains) * 0.19 // Simplificado al tramo mínimo
    });
  }

  return {
    current,
    optimized,
    savings,
    suggestions
  };
}
