// Quick validation script for financial-parser against $$ (1).xlsx
// Run with: node scripts/test-parser.mjs
import ExcelJS from 'exceljs';
import path from 'path';

const FILE_PATH = 'C:/Users/ester/Downloads/$$$ (1).xlsx';

// ── Replicate core parser logic (no TS, plain JS) ──────────────────────────

function normalizeValue(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.toISOString().split('T')[0];
  const s = String(v).trim();
  if (s === '') return null;
  const num = parseFloat(s.replace(',', '.').replace(/\s/g, ''));
  if (!isNaN(num) && s.match(/^-?[\d.,\s]+%?$/)) return num;
  return s;
}

async function loadSheet(workbook, sheetName) {
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) return null;
  const data = {};
  ws.eachRow({ includeEmpty: false }, (row, rIdx) => {
    row.eachCell({ includeEmpty: false }, (cell, cIdx) => {
      if (!data[rIdx]) data[rIdx] = {};
      const v = cell.value;
      data[rIdx][cIdx] =
        v && typeof v === 'object' && 'result' in v ? v.result :
        v && typeof v === 'object' && 'text' in v ? v.text :
        v;
    });
  });
  return data;
}

// BFS flood-fill
function floodFill(data, startR, startC, visited) {
  const queue = [[startR, startC]];
  const cells = [];
  while (queue.length) {
    const [r, c] = queue.shift();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    if (!data[r]?.[c] && data[r]?.[c] !== 0) continue;
    visited.add(key);
    cells.push([r, c]);
    [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc]) => {
      if (!visited.has(`${nr},${nc}`)) queue.push([nr,nc]);
    });
  }
  return cells;
}

function buildGrid(data, cells) {
  if (!cells.length) return { grid: [], range: {} };
  const rows = cells.map(([r]) => r), cols = cells.map(([,c]) => c);
  const minR = Math.min(...rows), maxR = Math.max(...rows);
  const minC = Math.min(...cols), maxC = Math.max(...cols);
  const grid = [];
  for (let r = minR; r <= maxR; r++) {
    const row = [];
    for (let c = minC; c <= maxC; c++) row.push(data[r]?.[c] ?? null);
    grid.push(row);
  }
  return { grid, range: { startRow: minR, startCol: minC, endRow: maxR, endCol: maxC } };
}

function extractTable(block) {
  const { grid, range } = block;
  if (grid.length < 2) return null;

  const firstRowNonNull = grid[0].filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  const secondRowNonNull = (grid[1] || []).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  const isLabelFirstRow =
    firstRowNonNull.length <= 2 &&
    firstRowNonNull.every(v => typeof v === 'string') &&
    secondRowNonNull.length >= 3 &&
    secondRowNonNull.every(v => typeof v === 'string');

  const headerRow = isLabelFirstRow ? 1 : 0;
  const dataStart = isLabelFirstRow ? 2 : 1;

  const headers = grid[headerRow].map((h, i) => String(h ?? '').trim() || `Col_${i+1}`);
  const rows = [];
  for (let r = dataStart; r < grid.length; r++) {
    const obj = {};
    let hasData = false;
    headers.forEach((h, c) => {
      const v = normalizeValue(grid[r]?.[c] ?? null);
      if (v !== null) hasData = true;
      obj[h] = v;
    });
    if (hasData) rows.push(obj);
  }
  return rows.length ? { headers, rows: rows.slice(0, 3), totalRows: rows.length, isLabelFirstRow } : null;
}

// ── Main ───────────────────────────────────────────────────────────────────

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(FILE_PATH);
console.log('Sheets:', workbook.worksheets.map(s => s.name).join(', '), '\n');

const TARGET_SHEETS = ['RESUM', 'ACCIONS', 'ETF', 'OR Y PLATA', 'CRYPTOS'];

for (const name of TARGET_SHEETS) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SHEET: ${name}`);
  const data = await loadSheet(workbook, name);
  if (!data) { console.log('  (not found)'); continue; }

  const visited = new Set();
  const blocks = [];
  Object.entries(data).forEach(([rStr, cols]) => {
    Object.keys(cols).forEach(cStr => {
      const key = `${rStr},${cStr}`;
      if (!visited.has(key)) {
        const cells = floodFill(data, parseInt(rStr), parseInt(cStr), visited);
        if (cells.length >= 4) blocks.push(buildGrid(data, cells));
      }
    });
  });

  console.log(`  Blocks found: ${blocks.length}`);
  blocks.forEach((b, i) => {
    const tbl = extractTable(b);
    if (!tbl) return;
    console.log(`\n  Block ${i+1} [rows: ${b.range.startRow}-${b.range.endRow}, cols: ${b.range.startCol}-${b.range.endCol}]`);
    console.log(`  isLabelFirstRow: ${tbl.isLabelFirstRow}`);
    console.log(`  Headers (${tbl.headers.length}): ${tbl.headers.slice(0, 8).join(' | ')}`);
    console.log(`  Total data rows: ${tbl.totalRows}`);
    if (tbl.rows[0]) {
      const firstRow = Object.entries(tbl.rows[0]).slice(0, 6).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join(', ');
      console.log(`  Row 1: ${firstRow}`);
    }
  });
}
