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

// Load pdfjs-dist dynamically to avoid SSR issues
let pdfjs: any = null;

const extractTextFromPDF = async (file: File): Promise<string> => {
  if (!pdfjs) {
    // Small delay to wait for pdfjs if it's still loading
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!pdfjs) throw new Error("Motor PDF no cargado. Reintenta en un momento.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [detectedAssets, setDetectedAssets] = useState<Partial<PortfolioAsset>[]>([]);
  const [detectedTransactions, setDetectedTransactions] = useState<Partial<Transaction>[]>([]);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [txSyncSuccess, setTxSyncSuccess] = useState(false);
  const [pendingAutoSave, setPendingAutoSave] = useState(false);

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

  useEffect(() => {
    // Initialize PDF.js
    import('pdfjs-dist').then((m) => {
      pdfjs = m;
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);

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
            await workbook.xlsx.load(data);
            
            const financialData: Record<string, FinancialSheet> = {};
            
            workbook.eachSheet((worksheet, sheetId) => {
              const sheetName = worksheet.name;
              const rawData: any[][] = [];
              worksheet.eachRow({ includeEmpty: true }, (row) => {
                const rowValues = Array.from(row.values as any[]).slice(1);
                rawData.push(rowValues);
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
            setTxSyncSuccess(false);
            setPendingAutoSave(true);

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

            {/* Investments Detected Alert */}
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
                        <h4 className="text-white font-bold text-sm">¡Inversiones detectadas!</h4>
                        <p className="text-white/60 text-xs">He encontrado {detectedAssets.length} activos en tu archivo.</p>
                      </div>
                    </div>
                    
                    {syncSuccess ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm px-4">
                        <CheckCircle2 className="w-5 h-5" />
                        Sincronizado con éxito
                      </div>
                    ) : (
                      <button
                        onClick={handleSyncToPortfolio}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sincronizar con mi Cartera
                      </button>
                    )}
                  </div>
                  
                  {/* Miniature Asset List */}
                  <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {detectedAssets.slice(0, 10).map((asset, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] text-white/50 flex items-center gap-2">
                        <span className="text-emerald-400 font-bold uppercase">{asset.ticker || '???'}</span>
                        <span className="opacity-70">{asset.asset_name}</span>
                        {asset.value_eur && asset.value_eur > 0 && (
                          <span className="text-white/40 border-l border-white/10 pl-2">{asset.value_eur.toLocaleString('es-ES')}€</span>
                        )}
                      </div>
                    ))}
                    {detectedAssets.length > 10 && <div className="text-[10px] text-white/30 pt-1">+{detectedAssets.length - 10} más</div>}
                  </div>
                </motion.div>
              )}

            {/* Transactions Detected Alert */}
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
