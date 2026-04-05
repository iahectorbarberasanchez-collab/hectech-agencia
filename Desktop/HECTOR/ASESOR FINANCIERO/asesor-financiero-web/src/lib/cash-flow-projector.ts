/**
 * Predictive Cash Flow Projector
 * Projects future cash flow using income history and transaction patterns
 */

export interface IncomeRecord {
  month: number;
  year: number;
  amount: number;
  source?: string;
  description?: string;
}

export interface Transaction {
  date: string; // ISO date
  description?: string;
  type: 'income' | 'expense' | string;
  amount: number;
  category?: string;
}

export interface CashFlowMonth {
  month: number;
  year: number;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedNetFlow: number;
  cumulativeBalance: number;
  isWarning: boolean; // negative net flow
  isCritical: boolean; // cumulative balance goes negative
  confidence: 'high' | 'medium' | 'low';
}

export interface CashFlowProjection {
  months: CashFlowMonth[];
  summary: {
    avgMonthlyIncome: number;
    avgMonthlyExpenses: number;
    avgNetFlow: number;
    worstMonth: { label: string; netFlow: number } | null;
    bestMonth: { label: string; netFlow: number } | null;
    warningMonths: string[];
    criticalMonths: string[];
    incomeVolatility: number; // coefficient of variation 0-1
    expenseVolatility: number;
    projectedSavingsRate: number; // 0-1
    monthsUntilBroke: number | null; // if trend is negative
  };
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = average(arr);
  const variance = arr.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function getMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function projectCashFlow(params: {
  incomeHistory: IncomeRecord[];
  transactions: Transaction[];
  currentBalance?: number;
  months?: number; // forecast horizon, default 12
}): CashFlowProjection {
  const { incomeHistory, transactions } = params;
  const horizon = params.months ?? 12;
  const currentBalance = params.currentBalance ?? 0;

  // --- Analyze income from history ---
  const incomeAmounts = incomeHistory.map(r => r.amount).filter(a => a > 0);
  const avgIncome = average(incomeAmounts);
  const incomeStd = stdDev(incomeAmounts);
  const incomeCV = avgIncome > 0 ? incomeStd / avgIncome : 0;

  // --- Analyze expenses from transactions ---
  const expenseTransactions = transactions.filter(
    t => t.type === 'expense' || (typeof t.amount === 'number' && t.amount < 0)
  );
  const expensesByMonth: Record<string, number> = {};

  for (const tx of expenseTransactions) {
    const d = new Date(tx.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const amt = Math.abs(tx.amount);
    expensesByMonth[key] = (expensesByMonth[key] ?? 0) + amt;
  }

  const monthlyExpenseValues = Object.values(expensesByMonth);
  const avgExpenses = average(monthlyExpenseValues.length > 0 ? monthlyExpenseValues : [0]);
  const expenseStd = stdDev(monthlyExpenseValues);
  const expenseCV = avgExpenses > 0 ? expenseStd / avgExpenses : 0;

  // Detect seasonal patterns (rough: group by month-of-year)
  const incomeByMonthOfYear: Record<number, number[]> = {};
  for (const r of incomeHistory) {
    const m = r.month;
    if (!incomeByMonthOfYear[m]) incomeByMonthOfYear[m] = [];
    incomeByMonthOfYear[m].push(r.amount);
  }

  const expenseByMonthOfYear: Record<number, number[]> = {};
  for (const tx of expenseTransactions) {
    const d = new Date(tx.date);
    if (isNaN(d.getTime())) continue;
    const m = d.getMonth() + 1;
    if (!expenseByMonthOfYear[m]) expenseByMonthOfYear[m] = [];
    expenseByMonthOfYear[m].push(Math.abs(tx.amount));
  }

  // --- Generate projected months ---
  const projectedMonths: CashFlowMonth[] = [];
  let cumulativeBalance = currentBalance;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 2; // start next month
  if (month > 12) { month = 1; year++; }

  for (let i = 0; i < horizon; i++) {
    // Seasonal income adjustment
    const seasonalIncomeData = incomeByMonthOfYear[month];
    const seasonalIncome = seasonalIncomeData && seasonalIncomeData.length > 0
      ? average(seasonalIncomeData)
      : avgIncome;
    const projectedIncome = Math.max(0, Math.round(seasonalIncome || avgIncome));

    // Seasonal expense adjustment
    const seasonalExpenseData = expenseByMonthOfYear[month];
    const seasonalExpense = seasonalExpenseData && seasonalExpenseData.length > 0
      ? average(seasonalExpenseData)
      : avgExpenses;
    const projectedExpenses = Math.max(0, Math.round(seasonalExpense || avgExpenses));

    const netFlow = projectedIncome - projectedExpenses;
    cumulativeBalance += netFlow;

    // Confidence: high if >6 months data, medium if 3-6, low if <3
    const dataPoints = incomeHistory.length;
    const confidence: 'high' | 'medium' | 'low' =
      dataPoints >= 6 ? 'high' : dataPoints >= 3 ? 'medium' : 'low';

    projectedMonths.push({
      month,
      year,
      label: getMonthLabel(year, month),
      projectedIncome,
      projectedExpenses,
      projectedNetFlow: netFlow,
      cumulativeBalance: Math.round(cumulativeBalance),
      isWarning: netFlow < 0,
      isCritical: cumulativeBalance < 0,
      confidence,
    });

    month++;
    if (month > 12) { month = 1; year++; }
  }

  // Summary stats
  const avgNetFlow = projectedMonths.length > 0
    ? average(projectedMonths.map(m => m.projectedNetFlow))
    : 0;

  const worstEntry = projectedMonths.reduce(
    (w, m) => m.projectedNetFlow < (w?.projectedNetFlow ?? Infinity) ? m : w,
    projectedMonths[0]
  );
  const bestEntry = projectedMonths.reduce(
    (b, m) => m.projectedNetFlow > (b?.projectedNetFlow ?? -Infinity) ? m : b,
    projectedMonths[0]
  );

  const warningMonths = projectedMonths.filter(m => m.isWarning).map(m => m.label);
  const criticalMonths = projectedMonths.filter(m => m.isCritical).map(m => m.label);

  // Months until broke: if avg net flow negative and we have a balance
  let monthsUntilBroke: number | null = null;
  if (avgNetFlow < 0 && currentBalance > 0) {
    monthsUntilBroke = Math.floor(currentBalance / Math.abs(avgNetFlow));
  }

  const savingsRate = avgIncome > 0
    ? Math.max(0, Math.min(1, (avgIncome - avgExpenses) / avgIncome))
    : 0;

  return {
    months: projectedMonths,
    summary: {
      avgMonthlyIncome: Math.round(avgIncome),
      avgMonthlyExpenses: Math.round(avgExpenses),
      avgNetFlow: Math.round(avgNetFlow),
      worstMonth: worstEntry ? { label: worstEntry.label, netFlow: worstEntry.projectedNetFlow } : null,
      bestMonth: bestEntry ? { label: bestEntry.label, netFlow: bestEntry.projectedNetFlow } : null,
      warningMonths,
      criticalMonths,
      incomeVolatility: Math.round(incomeCV * 100) / 100,
      expenseVolatility: Math.round(expenseCV * 100) / 100,
      projectedSavingsRate: Math.round(savingsRate * 1000) / 10,
      monthsUntilBroke,
    },
  };
}
