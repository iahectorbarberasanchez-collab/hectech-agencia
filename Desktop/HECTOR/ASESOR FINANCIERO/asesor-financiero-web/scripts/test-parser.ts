import { parseSheet } from '../src/lib/financial-parser';

// Mock data representing the CRYPTOS sheet structure
// Table 1 (Operaciones) at Col 0
// Table 2 (Resumen) at Col 10
// Table 3 (BTC Specific Summary) at Col 28
const mockSheetData = Array(50).fill(null).map(() => Array(40).fill(""));

// Table 1: Detailed Operations
mockSheetData[0][0] = "Fecha"; mockSheetData[0][1] = "Ticker"; mockSheetData[0][2] = "Cantidad"; mockSheetData[0][3] = "Inversión";
mockSheetData[1][0] = "2024-01-01"; mockSheetData[1][1] = "BTC"; mockSheetData[1][2] = "0.01"; mockSheetData[1][3] = "500,00";
mockSheetData[2][0] = "2024-02-01"; mockSheetData[2][1] = "ETH"; mockSheetData[2][2] = "0.5"; mockSheetData[2][3] = "1000,00";

// Table 2: Summary Resumen
mockSheetData[0][10] = "RESUMEN"; mockSheetData[0][11] = "TOTAL INVERTIDO";
mockSheetData[1][10] = "BTC"; mockSheetData[1][11] = "2207,52";
mockSheetData[2][10] = "ETH"; mockSheetData[2][11] = "1500,00";

// Table 3: BTC Details far right
mockSheetData[15][28] = "BTC GLOBAL PRECIO"; mockSheetData[15][29] = "65000";
mockSheetData[16][28] = "BTC MI POSICION"; mockSheetData[16][29] = "2207,52";

const result = parseSheet("CRYPTOS", mockSheetData);

console.log("Sheet:", result.name);
console.log("Tables found:", result.tables.length);

result.tables.forEach((t, i) => {
  console.log(`\nTable ${i+1}: ${t.name}`);
  console.log(`Type: ${t.type}`);
  console.log(`Headers: ${t.headers.join(', ')}`);
  console.log(`Rows: ${t.rows.length}`);
  console.log(`Sample Row:`, t.rows[0]);
});

if (result.tables.length === 3) {
  console.log("\n✅ SUCCESS: Found all 3 tables!");
} else {
  console.error(`\n❌ FAILED: Found ${result.tables.length} tables instead of 3.`);
  process.exit(1);
}
