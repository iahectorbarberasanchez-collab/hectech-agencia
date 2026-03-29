/**
 * Rules engine for generating proactive financial insights.
 */

export interface FinancialInsight {
  type: 'alert' | 'success' | 'info';
  title: string;
  message: string;
  impact?: string;
  category: 'savings' | 'investment' | 'tax' | 'general';
}

export function generateInsightsFromData(stats: {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
}): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const { netWorth, monthlyIncome, monthlyExpenses, savingsRate } = stats;

  if (monthlyIncome <= 0) return [];

  // Rule 1: Emergency Fund
  const monthlyBurn = monthlyExpenses || (monthlyIncome * 0.7); // Fallback estimate
  const monthsCovered = netWorth / monthlyBurn;
  
  if (monthsCovered < 3 && netWorth > 0) {
    insights.push({
      type: 'alert',
      category: 'general',
      title: 'Colchón de Emergencia insuficiente',
      message: `Tu patrimonio actual solo cubre ${monthsCovered.toFixed(1)} meses de gastos. Lo ideal es tener 6 meses.`,
      impact: 'Alto Riesgo'
    });
  } else if (monthsCovered >= 6) {
    insights.push({
      type: 'success',
      category: 'general',
      title: 'Salud Financiera Sólida',
      message: 'Tienes un colchón de seguridad de más de 6 meses. ¡Excelente gestión!',
    });
  }

  // Rule 2: Savings Rate
  if (savingsRate < 10) {
    insights.push({
      type: 'alert',
      category: 'savings',
      title: 'Tasa de Ahorro Baja',
      message: `Tu tasa de ahorro del ${savingsRate.toFixed(1)}% está por debajo del recomendado (20%). Intenta recortar gastos variables.`,
      impact: 'Lento Crecimiento'
    });
  } else if (savingsRate >= 25) {
    insights.push({
      type: 'success',
      category: 'savings',
      title: 'Super-Ahorrador Detectado',
      message: `Estás ahorrando un ${savingsRate.toFixed(1)}% de tus ingresos. Esto acelerará tu libertad financiera exponencialmente.`,
    });
  }

  // Rule 3: Investment Opportunity
  if (netWorth > 5000 && savingsRate > 0) {
    insights.push({
      type: 'info',
      category: 'investment',
      title: 'Exceso de Liquidez',
      message: 'Tienes capital acumulado que podría estar perdiendo valor frente a la inflación. ¿Has considerado fondos indexados?',
      impact: 'Oportunidad'
    });
  }

  // Rule 4: Tax Optimization
  if (monthlyIncome * 12 > 40000) {
    insights.push({
      type: 'info',
      category: 'tax',
      title: 'Optimización Fiscal Prioritaria',
      message: 'Tus ingresos brutos anuales estiman un tramo de IRPF del 37%+. Aportar a un Plan de Pensiones te ahorraría miles de euros.',
      impact: 'Impuestos'
    });
  }

  return insights;
}
