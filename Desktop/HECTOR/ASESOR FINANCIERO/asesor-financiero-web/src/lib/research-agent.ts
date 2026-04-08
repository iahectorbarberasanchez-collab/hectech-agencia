/**
 * research-agent.ts
 * Wrapper para Financial Datasets API (https://api.financialdatasets.ai)
 * y Exa semantic web search — capacidades de research estilo Dexter.
 *
 * Todas las funciones son async, lanzan en non-2xx, devuelven datos tipados.
 * Sin lógica de UI — eso vive en GenerativeUI.tsx.
 */

const FD_BASE = 'https://api.financialdatasets.ai';

function fdHeaders(): HeadersInit {
  const key = process.env.FINANCIAL_DATASETS_API_KEY;
  if (!key) throw new Error('FINANCIAL_DATASETS_API_KEY no configurada');
  return { 'X-API-KEY': key, 'Content-Type': 'application/json' };
}

async function fdGet<T>(path: string): Promise<T> {
  const res = await fetch(`${FD_BASE}${path}`, { headers: fdHeaders() });
  if (!res.ok) throw new Error(`Financial Datasets API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface IncomeStatement {
  ticker: string;
  period: string;
  revenue: number;
  net_income: number;
  operating_income: number;
  eps_diluted: number;
  ebitda: number;
  gross_profit: number;
  report_period: string;
}

export interface BalanceSheet {
  ticker: string;
  period: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  cash_and_equivalents: number;
  total_debt: number;
  report_period: string;
}

export interface CashFlowStatement {
  ticker: string;
  period: string;
  operating_cash_flow: number;
  free_cash_flow: number;
  capital_expenditure: number;
  dividends_paid: number;
  report_period: string;
}

export interface AnalystEstimate {
  ticker: string;
  period: string;
  revenue_estimate_avg: number;
  eps_estimate_avg: number;
  number_of_analysts: number;
}

export interface InsiderTrade {
  ticker: string;
  filing_date: string;
  owner: string;
  owner_title: string;
  transaction_type: string;
  shares: number;
  price_per_share: number;
  total_value: number;
}

export interface SECFiling {
  ticker: string;
  filing_type: string;
  filing_date: string;
  report_url: string;
  description?: string;
}

export interface ExaSearchResult {
  title: string;
  url: string;
  publishedDate: string;
  text: string;
  highlights: string[];
}

// ── Income Statement ─────────────────────────────────────────────────────────

export async function getIncomeStatements(
  ticker: string,
  period: 'annual' | 'quarterly' = 'annual',
  limit = 4,
): Promise<IncomeStatement[]> {
  const data = await fdGet<{ income_statements: IncomeStatement[] }>(
    `/financials/income-statements?ticker=${ticker}&period=${period}&limit=${limit}`,
  );
  return data.income_statements ?? [];
}

// ── Balance Sheet ────────────────────────────────────────────────────────────

export async function getBalanceSheets(
  ticker: string,
  period: 'annual' | 'quarterly' = 'annual',
  limit = 4,
): Promise<BalanceSheet[]> {
  const data = await fdGet<{ balance_sheets: BalanceSheet[] }>(
    `/financials/balance-sheets?ticker=${ticker}&period=${period}&limit=${limit}`,
  );
  return data.balance_sheets ?? [];
}

// ── Cash Flow ────────────────────────────────────────────────────────────────

export async function getCashFlowStatements(
  ticker: string,
  period: 'annual' | 'quarterly' = 'annual',
  limit = 4,
): Promise<CashFlowStatement[]> {
  const data = await fdGet<{ cash_flow_statements: CashFlowStatement[] }>(
    `/financials/cash-flow-statements?ticker=${ticker}&period=${period}&limit=${limit}`,
  );
  return data.cash_flow_statements ?? [];
}

// ── Analyst Estimates ────────────────────────────────────────────────────────

export async function getAnalystEstimates(
  ticker: string,
  period: 'annual' | 'quarterly' = 'annual',
  limit = 4,
): Promise<AnalystEstimate[]> {
  const data = await fdGet<{ analyst_estimates: AnalystEstimate[] }>(
    `/analyst/estimates?ticker=${ticker}&period=${period}&limit=${limit}`,
  );
  return data.analyst_estimates ?? [];
}

// ── Insider Trading ──────────────────────────────────────────────────────────

export async function getInsiderTrades(
  ticker: string,
  limit = 10,
): Promise<InsiderTrade[]> {
  const data = await fdGet<{ insider_trades: InsiderTrade[] }>(
    `/insider-trades?ticker=${ticker}&limit=${limit}`,
  );
  return data.insider_trades ?? [];
}

// ── SEC Filings ──────────────────────────────────────────────────────────────

export async function getSECFilings(
  ticker: string,
  filingType: '10-K' | '10-Q' | '8-K' = '10-K',
  limit = 5,
): Promise<SECFiling[]> {
  const data = await fdGet<{ search_results: SECFiling[] }>(
    `/filings?ticker=${ticker}&filing_type=${filingType}&limit=${limit}`,
  );
  return data.search_results ?? [];
}

// ── Exa Web Search ───────────────────────────────────────────────────────────

export async function searchFinancialNews(
  query: string,
  numResults = 5,
): Promise<ExaSearchResult[]> {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error('EXA_API_KEY no configurada');

  // Dynamic import para compatibilidad con builds sin la key
  const { default: Exa } = await import('exa-js');
  const exa = new Exa(key);

  const result = await exa.searchAndContents(query, {
    numResults,
    type: 'neural',
    useAutoprompt: true,
    highlights: { numSentences: 2, highlightsPerUrl: 2 },
    text: { maxCharacters: 1000 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.results ?? []).map((r: any) => ({
    title: r.title ?? '',
    url: r.url ?? '',
    publishedDate: r.publishedDate ?? '',
    text: r.text ?? '',
    highlights: r.highlights ?? [],
  }));
}
