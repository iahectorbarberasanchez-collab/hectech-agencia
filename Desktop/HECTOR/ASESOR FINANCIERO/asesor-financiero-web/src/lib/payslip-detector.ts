/**
 * Detector automático de nóminas en texto PDF.
 * Extrae: mes, año, importe neto, bruto, IRPF, SS.
 */

export interface PayslipData {
  detected: boolean;
  month: number | null;
  year: number | null;
  net_amount: number | null;
  gross_amount: number | null;
  irpf_percent: number | null;
  ss_employee: number | null;
  employer_name: string | null;
  period_label: string;
}

const MONTHS_ES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function findAmount(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/\./g, '').replace(',', '.');
      const n = parseFloat(raw);
      if (!isNaN(n) && n > 0) return Math.round(n * 100) / 100;
    }
  }
  return null;
}

export function detectPayslip(text: string): PayslipData {
  const lower = text.toLowerCase();

  // ─── Detect if it's a nómina ────────────────────────────────────────────────
  const isPayslip =
    lower.includes('líquido a percibir') ||
    lower.includes('liquido a percibir') ||
    lower.includes('total devengado') ||
    lower.includes('nómina') ||
    lower.includes('nomina') ||
    lower.includes('recibo de salarios') ||
    lower.includes('liquidación de haberes') ||
    lower.includes('total deduccion') ||
    lower.includes('seguridad social trabajador');

  if (!isPayslip) {
    return { detected: false, month: null, year: null, net_amount: null, gross_amount: null, irpf_percent: null, ss_employee: null, employer_name: null, period_label: '' };
  }

  // ─── Net amount ──────────────────────────────────────────────────────────────
  const net_amount = findAmount(text, [
    /l[íi]quido\s+a\s+percibir[:\s]+([0-9.,]+)/i,
    /total\s+a\s+percibir[:\s]+([0-9.,]+)/i,
    /importe\s+neto[:\s]+([0-9.,]+)/i,
    /total\s+l[íi]quido[:\s]+([0-9.,]+)/i,
  ]);

  // ─── Gross amount ────────────────────────────────────────────────────────────
  const gross_amount = findAmount(text, [
    /total\s+devengado[:\s]+([0-9.,]+)/i,
    /salario\s+bruto[:\s]+([0-9.,]+)/i,
    /base\s+imponible[:\s]+([0-9.,]+)/i,
    /total\s+bruto[:\s]+([0-9.,]+)/i,
  ]);

  // ─── IRPF ────────────────────────────────────────────────────────────────────
  const irpf_percent = findAmount(text, [
    /i\.?r\.?p\.?f\.?\s*[:\s]+([0-9.,]+)\s*%/i,
    /retenci[óo]n\s+irpf[:\s]+([0-9.,]+)\s*%/i,
    /retenci[óo]n[:\s]+([0-9.,]+)\s*%/i,
  ]);

  // ─── SS ──────────────────────────────────────────────────────────────────────
  const ss_employee = findAmount(text, [
    /cuota\s+obrera[:\s]+([0-9.,]+)/i,
    /s\.?\s*s\.?\s*trabajador[:\s]+([0-9.,]+)/i,
    /cotizaci[óo]n\s+trabajador[:\s]+([0-9.,]+)/i,
    /seguridad\s+social[:\s]+([0-9.,]+)/i,
  ]);

  // ─── Period ──────────────────────────────────────────────────────────────────
  let month: number | null = null;
  let year: number | null = null;
  let period_label = '';

  // Try: "Período de liquidación: 01/01/2025 a 31/01/2025"
  const periodMatch = text.match(/per[íi]odo[^0-9]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
  if (periodMatch) {
    month = parseInt(periodMatch[2], 10);
    year  = parseInt(periodMatch[3], 10);
    period_label = `${periodMatch[2]}/${periodMatch[3]}`;
  }

  // Try: "Mes: Enero 2025" or "Enero de 2025"
  if (!month) {
    for (const [name, num] of Object.entries(MONTHS_ES)) {
      const re = new RegExp(`\\b${name}\\b[\\s,]*(?:de[\\s]*)?([0-9]{4})`, 'i');
      const m = text.match(re);
      if (m) {
        month = num;
        year  = parseInt(m[1], 10);
        period_label = `${name.charAt(0).toUpperCase() + name.slice(1)} ${year}`;
        break;
      }
    }
  }

  // Try: "Nómina 01/2025"
  if (!month) {
    const slashMatch = text.match(/n[óo]mina\s+(\d{1,2})[\/\-](\d{4})/i);
    if (slashMatch) {
      month = parseInt(slashMatch[1], 10);
      year  = parseInt(slashMatch[2], 10);
      period_label = `${month}/${year}`;
    }
  }

  // Fallback: search for a standalone year
  if (!year) {
    const yearMatch = text.match(/\b(202[0-9]|203[0-9])\b/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);
  }

  // ─── Employer name ───────────────────────────────────────────────────────────
  let employer_name: string | null = null;
  const empresaMatch = text.match(/empresa[:\s]+([^\n\r]+)/i) ||
                       text.match(/raz[óo]n\s+social[:\s]+([^\n\r]+)/i) ||
                       text.match(/denominaci[óo]n[:\s]+([^\n\r]+)/i);
  if (empresaMatch) {
    employer_name = empresaMatch[1].trim().substring(0, 60);
  }

  return {
    detected: true,
    month,
    year,
    net_amount,
    gross_amount,
    irpf_percent,
    ss_employee,
    employer_name,
    period_label,
  };
}
