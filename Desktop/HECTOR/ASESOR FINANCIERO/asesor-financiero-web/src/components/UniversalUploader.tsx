"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, FileText, RefreshCw, Zap } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useFinancial, FinancialSheet, FinancialTable } from '@/context/FinancialContext';
import { useUser } from '@/context/UserContext';
import { parseSheet } from '@/lib/financial-parser';
import { extractAssetsFromSummary, extractTransactionsFromSummary } from '@/lib/asset-extractor';
import { PortfolioAsset, Transaction } from '@/types/supabase';
import { detectPayslip } from '@/lib/payslip-detector';

// Lazy-load pdfjs-dist as a singleton Promise (avoids the fragile 500ms delay)
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

const getPdfjs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m) => {
      m.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${m.version}/build/pdf.worker.min.mjs`;
      return m;
    });
  }
  return pdfjsPromise;
};

/**
 * Extracts text from a PDF preserving the visual line structure.
 * Groups text items by their Y-coordinate so that columns in tables
 * are reconstructed left-to-right instead of being concatenated in stream order.
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  const lib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group text items by rounded Y position (same line = within 3pt of each other)
    const lineMap = new Map<number, { x: number; text: string }[]>();

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const str = (item as any).str as string;
      if (!str) continue;
      // PDF coordinate system: Y increases upward, so round to nearest 3pt bucket
      const yBucket = Math.round((item as any).transform[5] / 3) * 3;
      const x = (item as any).transform[4] as number;
      if (!lineMap.has(yBucket)) lineMap.set(yBucket, []);
      lineMap.get(yBucket)!.push({ x, text: str });
    }

    // Sort lines top-to-bottom (higher Y = top of page in PDF coords)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

    const lines = sortedYs.map(y => {
      const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      // Join items on the same line; use tab between distant items to preserve column gaps
      const parts: string[] = [];
      let lastX = -Infinity;
      for (const { x, text } of items) {
        const gap = x - lastX;
        if (parts.length > 0 && gap > 20) {
          parts.push('\t'); // Column separator
        }
        parts.push(text);
        lastX = x + text.length * 6; // Approximate char width
      }
      return parts.join('').trim();
    }).filter(line => line.length > 0);

    if (lines.length > 0) {
      pageTexts.push(`--- Página ${i} ---\n${lines.join('\n')}`);
    }
  }

  return pageTexts.join('\n\n');
};

/**
 * Extracts the actual value from an ExcelJS cell value.
 * Handles: Date, RichText, Formula result, Error, Boolean, Number, String.
 */
function extractCellValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  if (val instanceof Date) return val.toISOString().split('T')[0]; // → "YYYY-MM-DD"
  if (typeof val === 'string') return val === '' ? null : val;
  if (typeof val === 'object') {
    // Formula cell: { formula, result } or { sharedFormula, result }
    if ('result' in val) {
      return val.result instanceof Date
        ? val.result.toISOString().split('T')[0]
        : val.result;
    }
    // RichText cell: { richText: [{ text: 'abc', font: {...} }, ...] }
    if (val.richText && Array.isArray(val.richText)) {
      return val.richText.map((r: any) => r.text ?? '').join('') || null;
    }
    // Error cell: { error: '#DIV/0!' }
    if (val.error) return null;
    // Hyperlink cell: { text: 'label', hyperlink: '...' }
    if (val.text !== undefined) return val.text || null;
  }
  return String(val) || null;
}


const calculateNumericTotals = (rows: any[], columns: string[]): Record<string, number> => {
  const totals: Record<string, number> = {};
  
  // Filter out rows that are likely summary/total rows themselves
  const dataRows = rows.filter(row => {
    const rowValues = Object.values(row).map(v => String(v || "").toUpperCase());
    const isTotalRow = rowValues.some(v => 
      v.includes("TOTAL") || 
      v.includes("RESUMEN") || 
      v.includes("SUMA") ||
      v.includes("SUBTOTAL")
    );
    return !isTotalRow;
  });

  const numericCols = columns.filter(col => {
    // Check first few rows to see if it's numeric
    const sample = dataRows.slice(0, 10).map(r => r[col]);
    return sample.some(v => typeof v === 'number' && !isNaN(v));
  });

  numericCols.forEach(col => {
    const sum = dataRows.reduce((acc, row) => {
      const val = row[col];
      return typeof val === 'number' && !isNaN(val) ? acc + val : acc;
    }, 0);
    if (sum !== 0) totals[col] = sum;
  });

  return totals;
};

export default function UniversalUploader() {
  const { setFinancialData, setDocumentText, summary, clearData, saveToSupabase, syncAssetsToPortfolio, syncTransactionsToUser, isSaving, isLoading } = useFinancial();
  const { userId } = useUser();
  // Keep userId in a ref so async callbacks always have the latest value
  const userIdRef = React.useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [detectedAssets, setDetectedAssets] = useState<Partial<PortfolioAsset>[]>([]);
  const [detectedTransactions, setDetectedTransactions] = useState<Partial<Transaction>[]>([]);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const [txSyncSuccess, setTxSyncSuccess] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [pendingAutoSave, setPendingAutoSave] = useState(false);
  const [payslipDetected, setPayslipDetected] = useState<{ net: number; gross: number; period: string } | null>(null);

  // Reset selected sheet when summary changes
  useEffect(() => {
    setSelectedSheetIndex(0);
  }, [summary?.fileName]);

  // Auto-save to Supabase when a new file is processed
  useEffect(() => {
    if (pendingAutoSave && userId && summary) {
      setPendingAutoSave(false);
      saveToSupabase(userId, false).catch(console.error);
    }
  }, [pendingAutoSave, userId, summary, saveToSupabase]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = e.target?.result;
            if (!(data instanceof ArrayBuffer)) {
              throw new Error("Error reading file data.");
            }

            const workbook = new ExcelJS.Workbook();

            // Use the correct reader for each format
            if (file.name.match(/\.csv$/i)) {
              const text = new TextDecoder('utf-8').decode(data);
              // Parse CSV manually: split lines, then split by comma/semicolon
              const delimiter = text.includes(';') ? ';' : ',';
              const lines = text.split(/\r?\n/);
              const ws = workbook.addWorksheet('CSV');
              lines.forEach((line, rowIdx) => {
                if (!line.trim()) return;
                const cells = line.split(delimiter).map(c => c.replace(/^"(.*)"$/, '$1').trim());
                const row = ws.getRow(rowIdx + 1);
                cells.forEach((cell, colIdx) => {
                  row.getCell(colIdx + 1).value = cell;
                });
                row.commit();
              });
            } else {
              await workbook.xlsx.load(data);
            }

            const financialData: Record<string, FinancialSheet> = {};

            workbook.eachSheet((worksheet) => {
              const sheetName = worksheet.name;
              const rawData: any[][] = [];
              // Find the actual column extent (avoid reading 16384 empty columns)
              let maxCol = 0;
              worksheet.eachRow({ includeEmpty: false }, (row) => {
                const lastCol = (row as any).actualCellCount || row.cellCount;
                if (lastCol > maxCol) maxCol = lastCol;
              });

              worksheet.eachRow({ includeEmpty: true }, (row) => {
                // row.values is 1-indexed; index 0 is undefined
                const rowValues: any[] = [];
                for (let c = 1; c <= Math.max(maxCol, 1); c++) {
                  const cell = row.getCell(c);
                  rowValues.push(extractCellValue(cell.value));
                }
                // Trim trailing nulls to keep arrays lean
                let end = rowValues.length;
                while (end > 0 && (rowValues[end - 1] === null || rowValues[end - 1] === undefined)) end--;
                rawData.push(rowValues.slice(0, end));
              });
              
              const parsedSheet = parseSheet(sheetName, rawData);
              if (parsedSheet.tables.length > 0) {
                const totalRows = parsedSheet.tables.reduce((sum, t) => sum + t.rows.length, 0);
                
                const sheetTotals: Record<string, number> = {};
                const tables = parsedSheet.tables.map(t => {
                  const tableTotals = calculateNumericTotals(t.rows, t.headers);
                  
                  Object.entries(tableTotals).forEach(([col, val]) => {
                    sheetTotals[col] = (sheetTotals[col] || 0) + val;
                  });

                  return {
                    id: t.name,
                    name: t.name,
                    type: t.type,
                    data: t.rows,
                    columns: t.headers,
                    numericTotals: tableTotals,
                    columnMap: (t as any).columnMap
                  };
                });
                
                financialData[sheetName] = {
                  name: sheetName,
                  tables,
                  totalRows,
                  numericTotals: sheetTotals
                };
              }
            });
            
            setFinancialData(financialData, file.name);

            const fullSummary = {
              totalRows: Object.values(financialData).reduce((sum, s) => sum + s.totalRows, 0),
              totalSheets: Object.keys(financialData).length,
              fileName: file.name,
              sheets: Object.values(financialData),
              fileType: 'tabular' as const
            };
            const extracted = extractAssetsFromSummary(fullSummary);
            const extractedTxs = extractTransactionsFromSummary(fullSummary);
            setDetectedAssets(extracted);
            setDetectedTransactions(extractedTxs);
            setSyncSuccess(false);
            setSyncCount(0);
            setTxSyncSuccess(false);
            if (extracted.length > 0) setShowReviewPanel(true);
            setPendingAutoSave(true);

            // AUTO-SYNC: save portfolio to Supabase immediately, no button needed
            const uid = userIdRef.current;
            if (uid && extracted.length > 0) {
              try {
                const result = await syncAssetsToPortfolio(uid, extracted);
                if (result.success) {
                  setSyncSuccess(true);
                  setSyncCount(result.count ?? extracted.length);
                } else {
                  setError(`No se pudo guardar la cartera: ${result.error}`);
                }
              } catch (syncErr) {
                console.error("Auto-sync error:", syncErr);
              }
            }

            setIsProcessing(false);
          } catch (err) {
            console.error(err);
            setError("Error al leer el Excel. Asegúrate de que no está corrupto.");
            setIsProcessing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.name.match(/\.pdf$/i)) {
        try {
          const text = await extractTextFromPDF(file);
          if (!text.trim()) {
            setError("No se pudo extraer texto del PDF. ¿Es una imagen?");
          } else {
            setDocumentText(text, file.name);
            setPendingAutoSave(true);
            // Auto-detect nómina
            const payslip = detectPayslip(text);
            if (payslip.detected && payslip.net_amount) {
              setPayslipDetected({
                net: payslip.net_amount,
                gross: payslip.gross_amount ?? 0,
                period: payslip.period_label || `${payslip.month ?? '?'}/${payslip.year ?? '?'}`,
              });
              // Save to income history via Supabase if we have userId and month/year
              if (userIdRef.current && payslip.month && payslip.year) {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.from('user_income_history').upsert({
                  user_id: userIdRef.current,
                  month: payslip.month,
                  year: payslip.year,
                  net_amount: payslip.net_amount,
                  gross_amount: payslip.gross_amount,
                  irpf_percent: payslip.irpf_percent,
                  ss_employee: payslip.ss_employee,
                  employer_name: payslip.employer_name,
                  source: 'payslip_upload',
                }, { onConflict: 'user_id,month,year' });
              }
            }
          }
          setIsProcessing(false);
        } catch (err) {
          console.error(err);
          setError("Error al procesar el PDF.");
          setIsProcessing(false);
        }
      } else {
        setError("Formato no soportado. Sube .xlsx, .xls, .csv o .pdf");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado al procesar el archivo.");
      setIsProcessing(false);
    }
  }, [setFinancialData, setDocumentText]);

  const handleManualSave = useCallback(async () => {
    if (!userId) {
      setError("Debes iniciar sesión para guardar.");
      return;
    }
    const result = await saveToSupabase(userId, true);
    if (!result.success) {
      setError(`Error al guardar: ${result.error}`);
    }
  }, [userId, saveToSupabase]);

  const handleSyncToPortfolio = useCallback(async () => {
    if (!userId || detectedAssets.length === 0) return;
    
    const result = await syncAssetsToPortfolio(userId, detectedAssets);
    if (result.success) {
      setSyncSuccess(true);
      setTimeout(() => setDetectedAssets([]), 3000);
    } else {
      setError(`Error al sincronizar activos: ${result.error}`);
    }
  }, [userId, detectedAssets, syncAssetsToPortfolio]);

  const handleSyncTransactions = useCallback(async () => {
    if (!userId || detectedTransactions.length === 0) return;
    
    const result = await syncTransactionsToUser(userId, detectedTransactions);
    if (result.success) {
      setTxSyncSuccess(true);
      setTimeout(() => {
        setDetectedTransactions([]);
        setTxSyncSuccess(false);
      }, 3000);
    } else {
      setError(`Error al sincronizar transacciones: ${result.error}`);
    }
  }, [userId, detectedTransactions, syncTransactionsToUser]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const removeFile = useCallback(() => {
    clearData();
    setError(null);
  }, [clearData]);

  if (isLoading) {
    return (
      <div className="w-full glass-card p-12 rounded-3xl flex flex-col items-center justify-center border border-white/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <RefreshCw className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <p className="text-white/60 font-medium">Recuperando tu perfil financiero...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!summary ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <div
              className={`relative group border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                  : 'border-white/20 glass hover:bg-white/5 hover:border-white/40'
              } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .pdf"
                onChange={handleFileInput}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-wait"
              />
              
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${isDragging ? 'bg-emerald-500/30' : 'bg-white/5 group-hover:bg-white/10'}`}>
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FileUp className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                ) : (
                  <FileUp className={`w-8 h-8 ${isDragging ? 'text-emerald-400' : 'text-white/60'}`} />
                )}
              </div>
              
              <h3 className="text-2xl font-semibold mb-2 text-white">
                Sube tus documentos financieros
              </h3>
              <p className="text-white/60 max-w-sm mb-6">
                Arrastra y suelta tu archivo Excel, CSV o PDF aquí, o haz clic para seleccionarlo.
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/40 font-medium">
                <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Excel/CSV</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> PDF</span>
              </div>

              {error && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   className="mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg"
                 >
                   <AlertCircle className="w-5 h-5" />
                   <span className="text-sm font-medium">{error}</span>
                 </motion.div>
               )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-6"
          >
            {/* Payslip auto-detect banner */}
            {payslipDetected && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 rounded-2xl border border-emerald-500/30 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-emerald-400 font-bold text-sm">✓ Nómina detectada y guardada</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Período: {payslipDetected.period} · Neto: <span className="text-white font-bold">{payslipDetected.net.toLocaleString('es-ES')}€</span>
                    {payslipDetected.gross > 0 && <> · Bruto: {payslipDetected.gross.toLocaleString('es-ES')}€</>}
                  </p>
                  <p className="text-white/30 text-[10px] mt-1">El asesor IA ya conoce este ingreso y lo usará en futuras proyecciones.</p>
                </div>
                <button onClick={() => setPayslipDetected(null)} className="text-white/30 hover:text-white/60 text-lg leading-none">×</button>
              </motion.div>
            )}

            {/* File Info Card */}
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  {summary.fileType === 'pdf' ? <FileText className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">{summary.fileName}</h4>
                  <p className="text-white/50 text-sm">
                    {summary.fileType === 'pdf' 
                      ? 'Documento PDF procesado' 
                      : `${summary.totalSheets} pestañas / ${summary.totalRows} registros totales`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isSaving 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30'
                  }`}
                >
                  {isSaving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isSaving ? 'Guardando...' : 'Guardar en mi perfil'}
                </button>
                <button 
                  onClick={removeFile}
                  className="p-3 rounded-full hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Review Panel - shows detected assets before confirming sync */}
            <AnimatePresence>
              {detectedAssets.length > 0 && showReviewPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-800/60 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h4 className="text-white font-bold text-sm">🔍 Revisión Rápida — ¿Son correctos estos activos?</h4>
                    <button onClick={() => setShowReviewPanel(false)} className="text-white/40 hover:text-white/80 text-xs">
                      Cerrar
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-[11px] text-white/60">
                      <thead>
                        <tr className="border-b border-white/10 text-left">
                          <th className="px-4 py-2 text-white/40 font-bold uppercase tracking-widest">Ticker</th>
                          <th className="px-4 py-2 text-white/40 font-bold uppercase tracking-widest">Nombre</th>
                          <th className="px-4 py-2 text-white/40 font-bold uppercase tracking-widest">Tipo</th>
                          <th className="px-4 py-2 text-right text-white/40 font-bold uppercase tracking-widest">Valor (€)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detectedAssets.map((a, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2 font-mono text-emerald-400 font-bold">{a.ticker || '—'}</td>
                            <td className="px-4 py-2">{a.asset_name}</td>
                            <td className="px-4 py-2">{a.asset_type || '—'}</td>
                            <td className="px-4 py-2 text-right tabular-nums">
                              {a.value_eur != null ? a.value_eur.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 text-[10px] text-white/30 text-center">
                    Si los datos no son correctos, descarta el archivo y revisa tu Excel.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Investments Detected + Auto-saved */}
            <AnimatePresence>
              {detectedAssets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl overflow-hidden"
                >
                  <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
                        <Zap className="w-5 h-5 fill-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">
                          {syncSuccess
                            ? `✓ ${syncCount} inversiones guardadas en tu cartera`
                            : `Detectando ${detectedAssets.length} inversiones...`}
                        </h4>
                        <p className="text-white/60 text-xs">
                          {syncSuccess
                            ? 'El asesor IA ya puede ver tu cartera y calcular rendimiento en tiempo real.'
                            : 'Guardando automáticamente en tu perfil...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {syncSuccess ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm px-4">
                          <CheckCircle2 className="w-5 h-5" />
                          Guardado
                        </div>
                      ) : isSaving ? (
                        <div className="flex items-center gap-2 text-white/50 text-sm px-4">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Guardando...
                        </div>
                      ) : null}
                      {/* Re-sync button in case they want to force a refresh */}
                      {syncSuccess && (
                        <button
                          onClick={handleSyncToPortfolio}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Re-sincronizar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asset list */}
                  <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {detectedAssets.slice(0, 12).map((asset, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-white/50 flex items-center gap-2">
                        <span className="text-emerald-400 font-bold uppercase">{asset.ticker || '—'}</span>
                        <span className="opacity-70 max-w-[120px] truncate">{asset.asset_name}</span>
                        {asset.quantity && asset.quantity > 0 && (
                          <span className="text-white/30 border-l border-white/10 pl-2">{asset.quantity} uds.</span>
                        )}
                        {asset.purchase_price && asset.purchase_price > 0 && (
                          <span className="text-blue-400/70">@{asset.purchase_price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                    {detectedAssets.length > 12 && (
                      <div className="text-[10px] text-white/30 pt-1">+{detectedAssets.length - 12} más</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transactions Detected Alert */}
            <AnimatePresence>
              {detectedTransactions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-2xl overflow-hidden"
                >
                  <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">¡Historial detectado!</h4>
                        <p className="text-white/60 text-xs">He encontrado {detectedTransactions.length} movimientos nuevos.</p>
                      </div>
                    </div>
                    
                    {txSyncSuccess ? (
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm px-4">
                        <CheckCircle2 className="w-5 h-5" />
                        Historial actualizado
                      </div>
                    ) : (
                      <button
                        onClick={handleSyncTransactions}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sincronizar historial
                      </button>
                    )}
                  </div>
                  
                  {/* Miniature Transaction Preview */}
                  <div className="px-5 pb-5 flex flex-wrap gap-2 opacity-60">
                    {detectedTransactions.slice(0, 6).map((tx, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 px-2 py-1 rounded text-[9px] text-white/40">
                        {tx.date} - {tx.description?.slice(0, 20)}...
                      </div>
                    ))}
                    {detectedTransactions.length > 6 && <span className="text-[9px] text-white/20">+{detectedTransactions.length - 6}</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sheet Tabs for Multi-Sheet Excel */}
            {summary.fileType === 'tabular' && summary.totalSheets > 1 && (
              <div className="flex flex-wrap gap-2 mb-2 p-1 bg-white/5 rounded-xl border border-white/5">
                {summary.sheets.map((sheet, idx) => (
                  <button
                    key={sheet.name}
                    onClick={() => setSelectedSheetIndex(idx)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedSheetIndex === idx 
                        ? 'bg-emerald-500 text-white shadow-lg' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {sheet.name}
                  </button>
                ))}
              </div>
            )}

            {/* Preview for Tabular Data */}
            {summary.fileType === 'tabular' && summary.sheets[selectedSheetIndex]?.tables.length > 0 && (
              <div className="space-y-6">
                {summary.sheets[selectedSheetIndex].tables.map((table: FinancialTable) => (
                  <div key={table.id} className="glass-card rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white/90">
                          {table.name}
                        </h4>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          table.type === 'summary' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {table.type}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">{table.data.length} filas</span>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/5 text-white/70">
                          <tr>
                            {table.columns.map((header) => (
                              <th key={header} className="px-6 py-4 font-medium sticky top-0">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {table.data.slice(0, 5).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              {table.columns.map((header, j: number) => (
                                <td key={j} className="px-6 py-4 text-white/80">
                                  {row[header] !== null && row[header] !== undefined ? String(row[header]) : "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {table.data.length > 5 && (
                        <div className="p-3 text-center text-xs text-white/30 bg-white/5 italic">
                          Muestra de las primeras 5 filas de {table.data.length}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Preview for PDF Data */}
            {summary.fileType === 'pdf' && summary.documentText && (
              <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
                <div className="bg-white/5 p-4 border-b border-white/10">
                  <h4 className="font-semibold text-white/90">Extracto del Documento</h4>
                </div>
                <div className="p-6">
                  <p className="text-white/60 text-sm line-clamp-6 italic">
                    "{summary.documentText.substring(0, 500)}..."
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
