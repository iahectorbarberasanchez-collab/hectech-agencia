/**
 * Monte Carlo Portfolio Simulator
 * Proyecta el patrimonio neto a N años con M simulaciones estocásticas.
 * Usa rendimientos históricos por tipo de activo y ruido gaussiano.
 */

export interface MonteCarloAsset {
  name: string;
  value_eur: number;
  asset_type: string; // 'accion' | 'etf' | 'crypto' | 'bono' | 'oro' | 'cash'
}

export interface MonteCarloParams {
  assets: MonteCarloAsset[];
  monthlyContribution: number; // aportación mensual adicional
  years: number;               // horizonte temporal
  simulations?: number;        // número de simulaciones (default 1000)
}

export interface MonteCarloResult {
  years: number;
  simulations: number;
  initialValue: number;
  // Percentiles de valor final (€)
  p10: number;  // escenario pesimista
  p25: number;  // escenario conservador
  p50: number;  // escenario mediano (más probable)
  p75: number;  // escenario optimista
  p90: number;  // escenario muy optimista
  // Probabilidades
  probPositive: number;       // % de simuls que acaban en positivo
  probDoubling: number;       // % de simuls que doblan el capital
  probLosing50: number;       // % de simuls que pierden >50%
  // Curva de evolución del percentil 50 (valor cada año)
  medianPath: number[];       // length = years + 1, index 0 = hoy
  p10Path: number[];
  p90Path: number[];
  // Estadísticas adicionales
  annualizedReturn: number;   // retorno anualizado del p50
  totalContributions: number;
}

// Parámetros históricos anualizados por tipo de activo
// μ = retorno medio anual, σ = volatilidad anual
const ASSET_PARAMS: Record<string, { mu: number; sigma: number }> = {
  accion:    { mu: 0.10,  sigma: 0.20 },  // acciones individuales
  acción:    { mu: 0.10,  sigma: 0.20 },
  stock:     { mu: 0.10,  sigma: 0.20 },
  etf:       { mu: 0.09,  sigma: 0.14 },  // ETFs diversificados
  fondo:     { mu: 0.08,  sigma: 0.14 },
  crypto:    { mu: 0.30,  sigma: 0.80 },  // criptomonedas
  cripto:    { mu: 0.30,  sigma: 0.80 },
  oro:       { mu: 0.06,  sigma: 0.15 },  // oro / metales preciosos
  plata:     { mu: 0.05,  sigma: 0.20 },
  bono:      { mu: 0.04,  sigma: 0.06 },  // renta fija
  renta_fija:{ mu: 0.04,  sigma: 0.06 },
  cash:      { mu: 0.02,  sigma: 0.01 },  // liquidez
  default:   { mu: 0.08,  sigma: 0.18 },  // fallback
};

function getAssetParams(assetType: string): { mu: number; sigma: number } {
  const key = (assetType || '').toLowerCase().replace(/\s+/g, '_');
  for (const [k, v] of Object.entries(ASSET_PARAMS)) {
    if (key.includes(k)) return v;
  }
  return ASSET_PARAMS.default;
}

/** Box-Muller transform: genera número aleatorio con distribución normal */
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Calcula media y desviación ponderada para la cartera combinada */
function portfolioStats(assets: MonteCarloAsset[]): { mu: number; sigma: number } {
  const total = assets.reduce((s, a) => s + a.value_eur, 0);
  if (total === 0) return { mu: 0.07, sigma: 0.15 };

  let weightedMu = 0;
  let weightedVar = 0;
  for (const asset of assets) {
    const w = asset.value_eur / total;
    const p = getAssetParams(asset.asset_type);
    weightedMu += w * p.mu;
    weightedVar += w * w * p.sigma * p.sigma; // simplified (no cross-correlations)
  }
  return { mu: weightedMu, sigma: Math.sqrt(weightedVar) };
}

export function runMonteCarlo(params: MonteCarloParams): MonteCarloResult {
  const { assets, monthlyContribution, years, simulations = 1000 } = params;
  const initialValue = assets.reduce((s, a) => s + a.value_eur, 0);
  const { mu, sigma } = portfolioStats(assets);

  // Monthly parameters (GBM — Geometric Brownian Motion)
  const muMonthly    = mu / 12;
  const sigmaMonthly = sigma / Math.sqrt(12);
  const totalMonths  = years * 12;

  // Store final values for percentile calculation
  const finalValues: number[] = new Array(simulations);

  // Store yearly snapshots for all simulations (years+1 points each)
  // We collect per-year snapshots for p10, p50, p90 paths
  const yearlyMatrix: number[][] = Array.from({ length: years + 1 }, () => new Array(simulations));

  for (let sim = 0; sim < simulations; sim++) {
    let value = initialValue;
    yearlyMatrix[0][sim] = value;

    for (let m = 1; m <= totalMonths; m++) {
      // GBM step: V(t+1) = V(t) * exp((mu - sigma²/2)dt + sigma*sqrt(dt)*Z)
      const drift = (muMonthly - 0.5 * sigmaMonthly * sigmaMonthly);
      const shock = sigmaMonthly * randn();
      value = value * Math.exp(drift + shock);
      value += monthlyContribution;
      if (m % 12 === 0) {
        yearlyMatrix[m / 12][sim] = value;
      }
    }
    finalValues[sim] = value;
  }

  finalValues.sort((a, b) => a - b);

  const pct = (p: number) => finalValues[Math.floor((p / 100) * simulations)] ?? finalValues[finalValues.length - 1];

  const p10 = pct(10);
  const p25 = pct(25);
  const p50 = pct(50);
  const p75 = pct(75);
  const p90 = pct(90);

  const probPositive = finalValues.filter(v => v > initialValue).length / simulations * 100;
  const probDoubling = finalValues.filter(v => v > initialValue * 2).length / simulations * 100;
  const probLosing50 = finalValues.filter(v => v < initialValue * 0.5).length / simulations * 100;

  // Build yearly paths for p10, p50, p90
  const medianPath: number[] = [];
  const p10Path: number[]    = [];
  const p90Path: number[]    = [];

  for (let y = 0; y <= years; y++) {
    const yearVals = [...yearlyMatrix[y]].sort((a, b) => a - b);
    const yp = (p: number) => yearVals[Math.floor((p / 100) * simulations)] ?? yearVals[yearVals.length - 1];
    medianPath.push(Math.round(yp(50)));
    p10Path.push(Math.round(yp(10)));
    p90Path.push(Math.round(yp(90)));
  }

  const totalContributions = monthlyContribution * totalMonths;
  const annualizedReturn = initialValue > 0
    ? (Math.pow(p50 / (initialValue + totalContributions), 1 / years) - 1) * 100
    : 0;

  return {
    years,
    simulations,
    initialValue: Math.round(initialValue),
    p10: Math.round(p10),
    p25: Math.round(p25),
    p50: Math.round(p50),
    p75: Math.round(p75),
    p90: Math.round(p90),
    probPositive: Math.round(probPositive * 10) / 10,
    probDoubling: Math.round(probDoubling * 10) / 10,
    probLosing50: Math.round(probLosing50 * 10) / 10,
    medianPath,
    p10Path,
    p90Path,
    annualizedReturn: Math.round(annualizedReturn * 10) / 10,
    totalContributions: Math.round(totalContributions),
  };
}
