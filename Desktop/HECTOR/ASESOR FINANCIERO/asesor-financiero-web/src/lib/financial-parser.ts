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
}

export interface ParsedSheet {
  name: string;
  tables: ParsedTable[];
}

/**
 * Normalizes values, specifically targeting Spanish number formats (comma decimal).
 */
export function normalizeValue(val: any): any {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return val;

  const trimmed = val.trim();
  
  // Detect Spanish-style numbers: e.g. "1.234,56" or "1234,56"
  // If it matches a pattern with a comma and optional dots as thousands separators
  const spanishNumRegex = /^-?\d{1,3}(\.\d{3})*,\d+$|^-?\d+,\d+$/;
  if (spanishNumRegex.test(trimmed)) {
    const clean = trimmed.replace(/\./g, '').replace(',', '.');
    const num = Number(clean);
    return isNaN(num) ? val : num;
  }

  // Fallback to standard Number
  const num = Number(trimmed);
  return isNaN(num) ? val : num;
}

/**
 * Heuristic to classify a table based on its headers and row count.
 */
function classifyTable(headers: string[], rowCount: number): 'summary' | 'detailed' | 'unknown' {
  const summaryKeywords = ['RESUMEN', 'TOTAL', 'TOTALES', 'PRODUCTO', 'CATEGORIA', 'CONSOLIDADO', 'SALDO', 'POSITION', 'HOLDINGS', 'TENENCIAS', 'VALOR ACTUAL'];
  const detailedKeywords = ['OPERACION', 'FECHA', 'ACCION', 'TICKER', 'SIMBOLO', 'PRECIO', 'COMISION', 'CANTIDAD', 'TRANSACCION', 'BROKER'];

  const headerStr = headers.join(' ').toUpperCase();
  
  const hasSummaryKwd = summaryKeywords.some(k => headerStr.includes(k));
  const hasDetailedKwd = detailedKeywords.some(k => headerStr.includes(k));

  if (hasSummaryKwd && rowCount < 50) return 'summary';
  if (hasDetailedKwd || rowCount > 20) return 'detailed';
  
  return 'unknown';
}

/**
 * Main parser logic.
 * Reads a 2D array (from XLSX.utils.sheet_to_json(ws, {header: 1}))
 * and extracts tables.
 */
export function parseSheet(name: string, data: any[][]): ParsedSheet {
  const tables: ParsedTable[] = [];
  if (!data || data.length === 0) return { name, tables };

  // 1. Identify continuous rectangular blocks of data
  const visited = Array(data.length).fill(0).map(() => Array(data[0]?.length || 0).fill(false));

  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < (data[r]?.length || 0); c++) {
      if (!visited[r][c] && data[r][c] !== null && data[r][c] !== undefined && data[r][c] !== "") {
        // Start of a potential table block
        const block = findDataBlock(data, r, c, visited);
        if (block) {
          const table = extractTableFromBlock(block);
          if (table && table.headers.length > 0) {
            tables.push({
              ...table,
              name: `${name}_Table_${tables.length + 1}`
            });
          }
        }
      }
    }
  }

  return { name, tables };
}

/**
 * Traverses a continuous block of data.
 */
function findDataBlock(data: any[][], startR: number, startC: number, visited: boolean[][]) {
  let minR = startR, maxR = startR;
  let minC = startC, maxC = startC;
  
  const queue = [[startR, startC]];
  const cells: [number, number][] = [];
  visited[startR][startC] = true;

  while(queue.length > 0) {
    const [r, c] = queue.shift()!;
    cells.push([r, c]);
    
    // Check 4 neighbors (Up, Down, Left, Right) - Prevent diagonal bridging of separate tables
    const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of neighbors) {
      const nr = r + dr;
      const nc = c + dc;
      
      if (nr >= 0 && nr < data.length && nc >= 0 && nc < (data[nr]?.length || 0)) {
        if (!visited[nr][nc] && data[nr][nc] !== null && data[nr][nc] !== undefined && data[nr][nc] !== "") {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
          minR = Math.min(minR, nr);
          maxR = Math.max(maxR, nr);
          minC = Math.min(minC, nc);
          maxC = Math.max(maxC, nc);
        }
      }
    }
  }

  // Extract the rectangular sub-grid
  if (maxR - minR < 1) return null; // Ignore single-cell "tables"

  const grid: any[][] = [];
  for (let r = minR; r <= maxR; r++) {
    const row = [];
    for (let c = minC; c <= maxC; c++) {
      row.push(data[r][c]);
    }
    grid.push(row);
  }

  return { grid, range: { startRow: minR, startCol: minC, endRow: maxR, endCol: maxC } };
}

function extractTableFromBlock(block: { grid: any[][], range: any }) {
  const { grid, range } = block;
  if (grid.length < 2) return null; // Need at least headers and one row

  // Assume first row of block is headers
  // Normalizing headers: remove "Unnamed: X", empty strings, etc.
  const rawHeaders = grid[0].map((h: any, i: number) => {
    const val = String(h || "").trim();
    return val || `Col_${i + 1}`;
  });

  const rows: Record<string, any>[] = [];
  for (let r = 1; r < grid.length; r++) {
    const rowObj: Record<string, any> = {};
    let hasData = false;
    for (let c = 0; c < grid[r].length; c++) {
      const val = normalizeValue(grid[r][c]);
      if (val !== null) hasData = true;
      rowObj[rawHeaders[c]] = val;
    }
    if (hasData) {
      rows.push(rowObj);
    }
  }

  if (rows.length === 0) return null;

  return {
    headers: rawHeaders,
    rows,
    totalRows: rows.length,
    type: classifyTable(rawHeaders, rows.length),
    range,
    columnMap: identifyColumns(rawHeaders)
  };
}

/**
 * Maps arbitrary Excel headers to standardized financial keys.
 */
function identifyColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  const keywords: Record<string, string[]> = {
    asset_name: ['ACTIVO', 'NOMBRE', 'ASSET', 'INVERSION', 'TITULO', 'INSTRUMENTO', 'VALOR', 'DESCRIPTION', 'CONCEPTO'],
    ticker: ['TICKER', 'SIMBOLO', 'SYMBOL', 'ISIN', 'CODICE', 'RIC', 'IDENTIFICADOR'],
    total_invested: ['DINERO PUESTO', 'CAPITAL INVERTIDO', 'INVERSION INICIAL', 'TOTAL €', 'COSTE', 'INVESTED', 'CASH BASIS', 'CAPITAL', 'PRINCIPAL'],
    quantity: ['CANTIDAD', 'ACCIONES', 'UNIDADES', 'TITULOS', 'QUANTITY', 'AMOUNT', 'VOLUMEN', 'SHARES', 'SIZE', 'QTY'],
    avg_price: ['PRECIO MEDIO', 'PRECIO COMPRA', 'PMC', 'P. MEDIO', 'AVG PRICE', 'COST BASIS', 'PR. COMPRA', 'COMPRA'],
    asset_type: ['TIPO', 'CATEGORIA', 'CLASE', 'ASSET TYPE', 'FAMILY', 'SECTOR', 'GRUPO'],
    current_price: ['PRECIO ACTUAL', 'ULTIMO PRECIO', 'COTIZACION', 'PRICE', 'LAST', 'VALORACION', 'MERCADO', 'CURRENT_PRICE'],
    current_value: ['VALOR ACTUAL', 'VALOR MERCADO', 'MARKET VALUE', 'VALUE', 'SALDO', 'POSITION', 'TOTAL_VALUE'],
    profit_eur: ['BENEFICIO', 'RENTABILIDAD €', 'GANANCIA', 'PROFIT', 'P/L', 'RESULTADO', 'REVALORIZACION'],
    profit_percent: ['RENTABILIDAD %', 'RETORNO', 'CHANGE %', 'PERFORMANCE', 'GROWTH', 'VAR %', 'YIELD'],
    weight: ['PESO', 'PERCENT', 'ALLOCATION', 'WEIGHT', 'PROPORCION', 'DISTRIBUCION']
  };

  headers.forEach(header => {
    const h = header.toUpperCase();
    for (const [key, kwds] of Object.entries(keywords)) {
      if (kwds.some(k => h.includes(k))) {
        mapping[key] = header;
        break;
      }
    }
  });

  return mapping;
}
