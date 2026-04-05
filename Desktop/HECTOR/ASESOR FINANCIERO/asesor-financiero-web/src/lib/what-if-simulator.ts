/**
 * What-If Scenario Simulator
 * Projects financial trajectories with and without hypothetical events
 */

export interface WhatIfEvent {
  description: string;
  /** One-time cost (negative = expense, positive = income/windfall) */
  oneTimeCost?: number;
  /** Monthly change in expenses/income starting from month `monthsFromNow` */
  monthlyCostChange?: number;
  /** When the event happens (months from today) */
  monthsFromNow: number;
  /** How many months the monthly change lasts (undefined = forever) */
  durationMonths?: number;
}

export interface WhatIfMonth {
  month: number;
  label: string; // "Ene 2025", "Feb 2025", ...
  netWorth: number;
  income: number;
  expenses: number;
  cashFlow: number;
}

export interface WhatIfResult {
  baseline: WhatIfMonth[];
  withEvents: WhatIfMonth[];
  summary: {
    baselineFinalNetWorth: number;
    withEventsFinalNetWorth: number;
    difference: number;
    differencePercent: number;
    breakEvenMonth: number | null; // month index where withEvents surpasses baseline (for positive events)
    worstMonth: { month: number; label: string; cashFlow: number } | null;
    events: WhatIfEvent[];
  };
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getMonthLabel(baseDate: Date, offsetMonths: number): string {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + offsetMonths);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function simulateWhatIf(params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentNetWorth: number;
  events: WhatIfEvent[];
  months?: number; // projection horizon, default 24
}): WhatIfResult {
  const { monthlyIncome, monthlyExpenses, currentNetWorth, events } = params;
  const horizon = params.months ?? 24;
  const baseDate = new Date();

  const baseline: WhatIfMonth[] = [];
  const withEvents: WhatIfMonth[] = [];

  let baselineNetWorth = currentNetWorth;
  let scenarioNetWorth = currentNetWorth;

  for (let m = 1; m <= horizon; m++) {
    const label = getMonthLabel(baseDate, m);

    // Baseline: constant income and expenses
    const baseIncome = monthlyIncome;
    const baseExpenses = monthlyExpenses;
    const baseCashFlow = baseIncome - baseExpenses;
    baselineNetWorth += baseCashFlow;

    baseline.push({
      month: m,
      label,
      netWorth: Math.round(baselineNetWorth),
      income: Math.round(baseIncome),
      expenses: Math.round(baseExpenses),
      cashFlow: Math.round(baseCashFlow),
    });

    // Scenario: apply events
    let scenarioIncome = monthlyIncome;
    let scenarioExpenses = monthlyExpenses;
    let oneTimeThisMonth = 0;

    for (const event of events) {
      if (event.monthsFromNow === m && event.oneTimeCost !== undefined) {
        oneTimeThisMonth += event.oneTimeCost;
      }
      if (m >= event.monthsFromNow && event.monthlyCostChange !== undefined) {
        const elapsed = m - event.monthsFromNow;
        const active = event.durationMonths === undefined || elapsed < event.durationMonths;
        if (active) {
          if (event.monthlyCostChange > 0) {
            // Positive = extra income
            scenarioIncome += event.monthlyCostChange;
          } else {
            // Negative = extra expense
            scenarioExpenses -= event.monthlyCostChange; // subtracting negative = adding
          }
        }
      }
    }

    const scenarioCashFlow = scenarioIncome - scenarioExpenses + oneTimeThisMonth;
    scenarioNetWorth += scenarioCashFlow;

    withEvents.push({
      month: m,
      label,
      netWorth: Math.round(scenarioNetWorth),
      income: Math.round(scenarioIncome),
      expenses: Math.round(scenarioExpenses),
      cashFlow: Math.round(scenarioCashFlow),
    });
  }

  // Break-even: first month where scenario surpasses baseline (for positive scenarios)
  const diff = scenarioNetWorth - baselineNetWorth;
  let breakEvenMonth: number | null = null;
  if (diff > 0) {
    for (let i = 0; i < withEvents.length; i++) {
      if (withEvents[i].netWorth > baseline[i].netWorth) {
        breakEvenMonth = withEvents[i].month;
        break;
      }
    }
  }

  // Worst month (lowest cash flow in scenario)
  const worstEntry = withEvents.reduce((worst, m) =>
    m.cashFlow < (worst?.cashFlow ?? Infinity) ? m : worst,
    withEvents[0]
  );
  const worstMonth = worstEntry && worstEntry.cashFlow < 0
    ? { month: worstEntry.month, label: worstEntry.label, cashFlow: worstEntry.cashFlow }
    : null;

  return {
    baseline,
    withEvents,
    summary: {
      baselineFinalNetWorth: Math.round(baselineNetWorth),
      withEventsFinalNetWorth: Math.round(scenarioNetWorth),
      difference: Math.round(diff),
      differencePercent: baselineNetWorth !== 0 ? Math.round((diff / Math.abs(baselineNetWorth)) * 1000) / 10 : 0,
      breakEvenMonth,
      worstMonth,
      events,
    },
  };
}
