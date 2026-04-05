/**
 * Robust Financial Parser
 * Detects and segments multiple tables within a single Excel/CSV sheet.
 */

export interface ParsedTable {
  name: string;
  type: 'summary' | 'detailed' | 'unknown';
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  // Position in the original sheet (0-indexed)
  range: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  };
  columnMap?: Record<string, string>;
}

export interface ParsedSheet {
  name: string;
  tables: ParsedTable[];
}

/**
 * Resolves an ExcelJS or Supabase-stored cell object to a primitive value.
 * Handles formula results, RichText, Date objects, and error cells.
 */
function resolveCellObject(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'object') return val;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  // Formula cell: { formula, result } or { sharedFormula, result }
  if ('result' in val) return resolveCellObject(val.result);
  // RichText cell: { richText: [{ text, font }, ...] }
  if (Array.isArray(val.richText)) return val.richText.map((r: any) => r.text ?? '').join('') || null;
  // Hyperlink cell: { text, hyperlink }
  if ('text' in val) return val.text ?? null;
  // Error cell: { error: '#DIV/0!' }
  if ('error' in val) return null;
  // Unknown object — return null rather than "[object Object]"
  return null;
}

/**
 * Normalizes values from Excel cells to clean, comparable types.
 * Handles Spanish (1.234,56), US (1,234.56), and space-separated (1 234,56) formats.
 */
export function normalizeValue(val: any): any {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.toISOString().split('T')[0]; // → "YYYY-MM-DD"
  if (typeof val === 'boolean') return val;
  // Resolve any object (formula, richtext, etc.) BEFORE string processing
  if (typeof val === 'object') return normalizeValue(resolveCellObject(val));

  const originalStr = val.trim();
  if (originalStr === '') return null;

  // Remove currency symbols and leading/trailing whitespace
  let cleaned = originalStr.replace(/[\s€$£¥]/gi, '').trim();

  // Skip strings that are clearly text (contain letters beyond basic numeric chars)
  // Allow: digits, dots, commas, dashes, plus signs
  if (/[a-zA-Z]{2,}/.test(cleaned)) return originalStr;

  // Handle percentage: "12,5%" → 0.125 ... actually keep as number 12.5
  const isPercent = cleaned.endsWith('%');
  if (isPercent) cleaned = cleaned.slice(0, -1);

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      // European format: "1.234,56" → 1234.56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: "1,234.56" → 1234.56
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastComma > -1) {
    const partsComma = cleaned.split(',');
    if (partsComma.length === 2 && partsComma[1].length <= 2) {
      // Likely decimal comma: "1234,56" or "1234,5" → 1234.56
      cleaned = cleaned.replace(',', '.');
    } else {
      // Thousands comma without decimal: "1,234" → 1234
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (lastDot > -1) {
    const partsDot = cleaned.split('.');
    if (partsDot.length > 2) {
      // Multiple dots = thousands separator: "1.234.567" → 1234567
      cleaned = cleaned.replace(/\./g, '');
    }
    // Single dot: leave as-is ("1234.56")
  }

  const num = Number(cleaned);
  if (isNaN(num)) return originalStr;
  return isPercent ? num : num;
}

/**
 * Heuristic to classify a table based on its headers.
 * Removed arbitrary row-count limits that caused mis-classification of large portfolios.
 */
function classifyTable(headers: string[], rowCount: number): 'summary' | 'detailed' | 'unknown' {
  const summaryKeywords = [
    'RESUMEN', 'PRODUCTO', 'CATEGORIA', 'CONSOLIDADO', 'SALDO', 'POSITION',
    'HOLDINGS', 'TENENCIAS', 'VALOR ACTUAL', 'CARTERA', 'PORTFOLIO', 'ACTIVO',
    'INSTRUMENT', 'TITULO', 'INVERSION', 'ASSET', 'NOMBRE', 'TOTAL',
  ];
  const detailedKeywords = [
    'OPERACION', 'FECHA', 'ACCION', 'COMISION', 'TRANSACCION', 'BROKER',
    'MOVIMIENTO', 'EXTRACTO', 'HISTORIAL', 'LIQUIDACION', 'TRANSACTION',
    'DATE', 'OPERATION',
  ];

  const headerStr = headers.join(' ').toUpperCase();

  const summaryScore = summaryKeywords.filter(k => headerStr.includes(k)).length;
  const detailedScore = detailedKeywords.filter(k => headerStr.includes(k)).length;

  if (summaryScore > detailedScore) return 'summary';
  if (detailedScore > 0 || rowCount > 100) return 'detailed';
  if (summaryScore > 0) return 'summary';

  return 'unknown';
}

/**
 * Main parser logic.
 * Reads a 2D array and extracts all rectangular data blocks as tables.
 */
export function parseSheet(name: string, data: any[][]): ParsedSheet {
  const tables: ParsedTable[] = [];
  if (!data || data.length === 0) return { name, tables };

  const numCols = data.reduce((max, row) => Math.max(max, row?.length || 0), 0);
  const visited = Array(data.length).fill(0).map(() => Array(numCols).fill(false));

  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < (data[r]?.length || 0); c++) {
      const cellVal = data[r][c];
      if (!visited[r][c] && cellVal !== null && cellVal !== undefined && cellVal !== '') {
        const block = findDataBlock(data, r, c, visited, numCols);
        if (block) {
          const table = extractTableFromBlock(block);
          if (table && table.headers.length > 0 && table.rows.length > 0) {
            tables.push({
              ...table,
              name: `${name}_Tabla_${tables.length + 1}`,
            });
          }
        }
      }
    }
  }

  return { name, tables };
}

/**
 * BFS flood-fill to find a contiguous rectangular data block.
 * Uses 4-directional neighbors to avoid diagonal bridging between separate tables.
 */
function findDataBlock(
  data: any[][],
  startR: number,
  startC: number,
  visited: boolean[][],
  numCols: number,
) {
  let minR = startR, maxR = startR;
  let minC = startC, maxC = startC;

  const queue: [number, number][] = [[startR, startC]];
  visited[startR][startC] = true;

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < data.length &&
        nc >= 0 && nc < numCols &&
        !visited[nr][nc] &&
        (data[nr]?.[nc] !== null && data[nr]?.[nc] !== undefined && data[nr]?.[nc] !== '')
      ) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
        minR = Math.min(minR, nr);
        maxR = Math.max(maxR, nr);
        minC = Math.min(minC, nc);
        maxC = Math.max(maxC, nc);
      }
    }
  }

  if (maxR - minR < 1) return null; // Need at least 2 rows (header + data)

  const grid: any[][] = [];
  for (let r = minR; r <= maxR; r++) {
    const row: any[] = [];
    for (let c = minC; c <= maxC; c++) {
      row.push(data[r]?.[c] ?? null);
    }
    grid.push(row);
  }

  return { grid, range: { startRow: minR, startCol: minC, endRow: maxR, endCol: maxC } };
}

function extractTableFromBlock(block: { grid: any[][]; range: any }) {
  const { grid, range } = block;
  if (grid.length < 2) return null;

  // Detect if there are multiple header rows (e.g., merged/grouped headers)
  // A row is considered a "header row" if most of its cells are non-numeric strings
  let headerRowCount = 1;
  const secondRow = grid[1] || [];
  const secondRowIsAllText = secondRow.every(
    (v: any) => v === null || v === undefined || v === '' || typeof v === 'string'
  );
  const secondRowHasValues = secondRow.some((v: any) => v !== null && v !== undefined && v !== '');
  if (secondRowIsAllText && secondRowHasValues) {
    // Could be a sub-header; merge with first row
    headerRowCount = 1; // Still treat first row as primary header
  }

  // Build header names from first row
  const rawHeaders = grid[0].map((h: any, i: number) => {
    const val = String(h ?? '').trim();
    return val || `Col_${i + 1}`;
  });

  // Deduplicate headers (Excel sometimes has duplicate column names)
  const seenHeaders: Record<string, number> = {};
  const headers = rawHeaders.map((h: string) => {
    if (seenHeaders[h] !== undefined) {
      seenHeaders[h]++;
      return `${h}_${seenHeaders[h]}`;
    }
    seenHeaders[h] = 0;
    return h;
  });

  const rows: Record<string, any>[] = [];
  for (let r = headerRowCount; r < grid.length; r++) {
    const rowObj: Record<string, any> = {};
    let hasData = false;
    for (let c = 0; c < headers.length; c++) {
      const raw = grid[r]?.[c] ?? null;
      const val = normalizeValue(raw);
      if (val !== null) hasData = true;
      rowObj[headers[c]] = val;
    }
    // Skip completely empty rows
    if (hasData) rows.push(rowObj);
  }

  if (rows.length === 0) return null;

  return {
    headers,
    rows,
    totalRows: rows.length,
    type: classifyTable(headers, rows.length),
    range,
    columnMap: identifyColumns(headers),
  };
}

/**
 * Maps arbitrary Excel headers to standardized financial keys.
 * Extended to cover Spanish broker (DeGiro, Interactive Brokers, MyInvestor, etc.)
 * and bank statement formats.
 */
function identifyColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  const keywords: Record<string, string[]> = {
    asset_name: [
      'ACTIVO', 'NOMBRE', 'ASSET', 'INVERSION', 'TITULO', 'INSTRUMENTO',
      'VALOR', 'DESCRIPTION', 'CONCEPTO', 'PRODUCTO', 'NAME', 'SECURITY',
      'DENOMINACION', 'FONDO', 'EMPRESA', 'COMPANIA',
    ],
    ticker: [
      'TICKER', 'SIMBOLO', 'SYMBOL', 'ISIN', 'CODICE', 'RIC', 'IDENTIFICADOR',
      'COD.', 'CODIGO', 'CUSIP', 'WKN', 'REFERENCIA',
    ],
    total_invested: [
      'DINERO PUESTO', 'CAPITAL INVERTIDO', 'INVERSION INICIAL', 'TOTAL €',
      'COSTE', 'INVESTED', 'CASH BASIS', 'CAPITAL', 'PRINCIPAL', 'COSTE TOTAL',
      'IMPORTE INVERTIDO', 'VALOR COMPRA', 'PRECIO COSTE', 'COSTE MEDIO TOTAL',
    ],
    quantity: [
      'CANTIDAD', 'ACCIONES', 'UNIDADES', 'TITULOS', 'QUANTITY', 'AMOUNT',
      'VOLUMEN', 'SHARES', 'SIZE', 'QTY', 'NUM. TITULOS', 'PARTICIPACIONES',
      'NUMERO', 'NÚM', 'NUM.',
    ],
    avg_price: [
      'PRECIO MEDIO', 'PRECIO COMPRA', 'PMC', 'P. MEDIO', 'AVG PRICE',
      'COST BASIS', 'PR. COMPRA', 'COMPRA', 'PRECIO MEDIO COMPRA',
      'PRECIO DE COMPRA', 'PRECIO ADQUISICION', 'PRECIO ADQUISICIÓN',
    ],
    asset_type: [
      'TIPO', 'CATEGORIA', 'CLASE', 'ASSET TYPE', 'FAMILY', 'SECTOR',
      'GRUPO', 'MERCADO', 'BOLSA', 'TIPO ACTIVO', 'CLASE ACTIVO', 'TIPO DE ACTIVO',
    ],
    current_price: [
      'PRECIO ACTUAL', 'ULTIMO PRECIO', 'COTIZACION', 'PRICE', 'LAST',
      'VALORACION', 'MERCADO', 'CURRENT_PRICE', 'COTIZACIÓN', 'PRECIO HOY',
      'VALOR LIQUIDATIVO', 'NAV', 'PRECIO CIERRE',
    ],
    current_value: [
      'VALOR ACTUAL', 'VALOR MERCADO', 'MARKET VALUE', 'VALUE', 'SALDO',
      'POSITION', 'TOTAL_VALUE', 'VALORACION TOTAL', 'VALOR TOTAL',
      'IMPORTE ACTUAL', 'VALOR CARTERA', 'VALOR POSICION',
    ],
    profit_eur: [
      'BENEFICIO', 'RENTABILIDAD €', 'GANANCIA', 'PROFIT', 'P/L', 'RESULTADO',
      'REVALORIZACION', 'PLUSVALIA', 'PLUSVALÍA', 'BENEFICIO NETO',
      'GANANCIA/PERDIDA', 'G/P', 'DIFERENCIA',
    ],
    profit_percent: [
      'RENTABILIDAD %', 'RETORNO', 'CHANGE %', 'PERFORMANCE', 'GROWTH',
      'VAR %', 'YIELD', '% RENDIMIENTO', 'RETORNO %', 'VARIACION %',
      'REVALORIZACION %', '% PLUSVALIA',
    ],
    weight: [
      'PESO', 'PERCENT', 'ALLOCATION', 'WEIGHT', 'PROPORCION', 'DISTRIBUCION',
      '% CARTERA', 'PONDERACION', '% TOTAL', 'PONDERACIÓN',
    ],
    date: [
      'FECHA', 'DATE', 'F. OPERACION', 'F. VALOR', 'F. LIQUIDACION',
      'FECHA OPERACION', 'FECHA VALOR', 'DIA', 'FECHA COMPRA',
    ],
    amount: [
      'IMPORTE', 'IMPORTE TOTAL', 'TOTAL', 'MONTO', 'EUR', 'EFECTIVO',
    ],
  };

  headers.forEach(header => {
    const h = header.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents for matching
    for (const [key, kwds] of Object.entries(keywords)) {
      if (!mapping[key] && kwds.some(k => h.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
        mapping[key] = header;
        break;
      }
    }
  });

  return mapping;
}
