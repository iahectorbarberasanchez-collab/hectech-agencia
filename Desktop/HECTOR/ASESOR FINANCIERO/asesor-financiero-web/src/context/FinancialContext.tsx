"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { supabase, PortfolioAsset, Transaction } from "@/lib/supabase";

export type FinancialRow = Record<string, any>;

export interface FinancialTable {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'unknown';
  data: FinancialRow[];
  columns: string[];
  numericTotals: Record<string, number>;
  columnMap?: Record<string, string>;
}

export type FinancialSheet = {
  name: string;
  tables: FinancialTable[];
  totalRows: number;
  numericTotals: Record<string, number>;
};

export type ResumenMetrics = {
  totalInvested?: number;
  totalCurrentValue?: number;
  acciones?: number;
  etf?: number;
  cripto?: number;
  oro?: number;
  plata?: number;
  emergencyFund?: number;
  trading?: number;
};

export type FinancialSummary = {
  totalRows: number;
  totalSheets: number;
  fileName: string;
  sheets: FinancialSheet[];
  documentText?: string;
  fileType: 'tabular' | 'pdf';
  resumenMetrics?: ResumenMetrics;
};

type FinancialContextType = {
  financialData: Record<string, FinancialSheet>; // Mapping of SheetName -> Sheet object
  documentText: string | null;
  summary: FinancialSummary | null;
  setFinancialData: (sheets: Record<string, FinancialSheet>, fileName?: string) => void;
  setDocumentText: (text: string, fileName: string) => void;
  clearData: () => void;
  saveToSupabase: (userId: string, isVerified?: boolean) => Promise<{ success: boolean; error?: string }>;
  syncAssetsToPortfolio: (userId: string, assets: Partial<PortfolioAsset>[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  syncTransactionsToUser: (userId: string, transactions: Partial<Transaction>[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  isSaving: boolean;
  isLoading: boolean;
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Helper to parse potential Spanish numbers (strings with commas)
const parseNum = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return NaN;
  const clean = val.replace(/\.(?=\d{3}(,|$))/g, '').replace(',', '.');
  return Number(clean);
};

function extractResumenMetrics(sheets: FinancialSheet[]): ResumenMetrics | null {
  const resSheet = sheets.find(s => /resum/i.test(s.name));
  if (!resSheet) return null;

  const metrics: ResumenMetrics = {};

  // Helper: parse a raw cell value to a positive number, handling Spanish format
  const toNum = (raw: unknown): number => {
    if (typeof raw === 'number') return raw > 0 ? raw : 0;
    const s = String(raw ?? '').trim().replace(/\s/g, '').replace(/€/g, '');
    // Spanish: 25.031,50 → 25031.50 | English: 25,031.50 → 25031.50
    const n = s.includes(',') && s.includes('.')
      ? (s.lastIndexOf(',') > s.lastIndexOf('.') ? Number(s.replace(/\./g, '').replace(',', '.')) : Number(s.replace(/,/g, '')))
      : s.includes(',')
        ? (s.split(',')[1]?.length <= 2 ? Number(s.replace(',', '.')) : Number(s.replace(/,/g, '')))
        : Number(s);
    return isNaN(n) || n <= 0 ? 0 : n;
  };

  // Helper: try to assign a numeric value to the right metric field based on a text label
  const tryAssign = (label: string, num: number) => {
    if (num <= 0) return;
    const l = label.toUpperCase().trim().replace(/[:_\-]/g, ' ');
    if (/dinero.{0,15}puesto|total.{0,15}invertid|capital.{0,15}invertid|total.{0,10}aportad|inversion.{0,10}total/i.test(l)) {
      if (!metrics.totalInvested || num > metrics.totalInvested) metrics.totalInvested = num;
    }
    if (/valor.{0,15}actual|valor.{0,10}total|total.{0,10}actual|total.{0,10}cartera|patrimonio.{0,10}total|total.{0,10}valor/i.test(l)) {
      if (!metrics.totalCurrentValue || num > metrics.totalCurrentValue) metrics.totalCurrentValue = num;
    }
    if (/^accion(es)?$|total.{0,8}accion/i.test(l)) metrics.acciones = num;
    if (/^etf$|total.{0,8}etf/i.test(l)) metrics.etf = num;
    if (/criptomonedas?|^cripto$|total.{0,8}cripto/i.test(l)) metrics.cripto = num;
    if (/\boro\b|\bplata\b|oro.*plata|plata.*oro|metales?/i.test(l)) metrics.oro = num;
    if (/colch[oó]n|fondo.{0,15}emerg|emergencia/i.test(l)) metrics.emergencyFund = num;
    if (/cuenta.{0,10}trading|^trading$|cuenta.{0,10}inver/i.test(l)) metrics.trading = num;
  };

  for (const table of resSheet.tables) {
    // STRATEGY 1: Column header names with numericTotals (wide table like: | Tipo | Dinero Puesto | Valor Actual |)
    for (const [colName, total] of Object.entries(table.numericTotals || {})) {
      tryAssign(colName, total);
    }

    for (const row of table.data) {
      const entries = Object.entries(row);
      const vals = Object.values(row);

      // STRATEGY 2: Category column + value columns
      // Row: { 'Categoría': 'Acciones', 'Dinero Puesto': 5000, 'Valor Actual': 6000 }
      for (const [key, val] of entries) {
        if (/tipo|categor[ií]a|activo|descripci[oó]n|concepto/i.test(key)) {
          const categoryName = String(val ?? '').toUpperCase().trim();
          // Find "Dinero Puesto" or "Valor Actual" columns in this row
          for (const [k2, v2] of entries) {
            const n = toNum(v2);
            if (n <= 0) continue;
            // Combine category + column header to determine what this is
            const combined = `${categoryName} ${k2}`.toUpperCase();
            tryAssign(combined, n);
            // Also try category name alone for category-specific metrics
            if (/^ACCIONES?$/.test(categoryName)) metrics.acciones = metrics.acciones || n;
            if (/^ETF$/.test(categoryName)) metrics.etf = metrics.etf || n;
            if (/CRIPTO/.test(categoryName)) metrics.cripto = metrics.cripto || n;
            if (/ORO|PLATA/.test(categoryName)) metrics.oro = metrics.oro || n;
            if (/COLCH[OÓ]N|EMERGENCIA/.test(categoryName)) metrics.emergencyFund = metrics.emergencyFund || n;
            if (/TRADING/.test(categoryName)) metrics.trading = metrics.trading || n;
          }
          break;
        }
      }

      // STRATEGY 3: Key-value rows — text in one cell, number in adjacent cell
      for (let i = 0; i < vals.length; i++) {
        const cell = String(vals[i] ?? '').trim();
        if (!cell || cell.length < 2) continue;
        const cellNum = toNum(cell);
        if (cellNum > 0) continue; // Skip numeric cells
        // Look ahead for a numeric value in the next 3 cells
        for (let j = i + 1; j < Math.min(i + 4, vals.length); j++) {
          const n = toNum(vals[j]);
          if (n > 0) {
            tryAssign(cell, n);
            break;
          }
        }
      }
    }
  }

  // STRATEGY 4: Sheet-level numericTotals (fallback)
  for (const [colName, total] of Object.entries(resSheet.numericTotals || {})) {
    tryAssign(colName, total);
  }

  // STRATEGY 5: Dedicated "OR y PLATA" / "ORO y PLATA" sheet
  // Look for labels like "TOTAL INVERTIDO EN ORO" and "TOTAL EN PLATA"
  const goldSheet = sheets.find(s =>
    /or[o]?\s*(y|&|i)\s*plata/i.test(s.name) ||
    /oro.*plata|plata.*oro|gold.*silver|silver.*gold/i.test(s.name)
  );
  if (goldSheet) {
    const scanGoldSheet = (sheet: typeof goldSheet) => {
      for (const table of sheet.tables) {
        // Column headers
        for (const [colName, total] of Object.entries(table.numericTotals || {})) {
          const lbl = colName.toUpperCase();
          if (/total.{0,20}(invertido|invertida|en)?.{0,10}oro/i.test(lbl) || /\boro\b.*total/i.test(lbl)) {
            metrics.oro = total;
          }
          if (/total.{0,20}(en\s*)?(plata|silver)/i.test(lbl)) {
            metrics.plata = total;
          }
        }
        // Row scanning
        for (const row of table.data) {
          const vals = Object.values(row);
          for (let i = 0; i < vals.length; i++) {
            const cell = String(vals[i] ?? '').trim();
            if (!cell || toNum(cell) > 0) continue;
            const lbl = cell.toUpperCase();
            for (let j = i + 1; j < Math.min(i + 4, vals.length); j++) {
              const n = toNum(vals[j]);
              if (n <= 0) continue;
              if (/total.{0,20}(invertido|en)?.{0,10}\boro\b/i.test(lbl)) { metrics.oro = n; break; }
              if (/total.{0,20}(en\s*)?\bplata\b/i.test(lbl))              { metrics.plata = n; break; }
              break;
            }
          }
        }
      }
      // Sheet numericTotals
      for (const [colName, total] of Object.entries(sheet.numericTotals || {})) {
        const lbl = colName.toUpperCase();
        if (/total.{0,20}(invertido|en)?.{0,10}\boro\b/i.test(lbl)) metrics.oro = metrics.oro ?? total;
        if (/total.{0,20}(en\s*)?\bplata\b/i.test(lbl)) metrics.plata = metrics.plata ?? total;
      }
    };
    scanGoldSheet(goldSheet);
  }

  return Object.keys(metrics).length > 0 ? metrics : null;
}

function buildSummary(sheets: Record<string, FinancialSheet>, fileName: string, fileType: 'tabular' | 'pdf' = 'tabular', documentText?: string): FinancialSummary {
  if (fileType === 'pdf') {
    return {
      totalRows: 0,
      totalSheets: 0,
      fileName,
      sheets: [],
      documentText,
      fileType: 'pdf'
    };
  }

  const sheetList = Object.values(sheets).map(s => ({
    ...s,
    numericTotals: s.numericTotals || {}
  }));
  const totalRows = sheetList.reduce((sum, s) => sum + s.totalRows, 0);

  const resumenMetrics = extractResumenMetrics(sheetList) ?? undefined;
  return {
    totalRows,
    totalSheets: sheetList.length,
    fileName,
    sheets: sheetList,
    fileType: 'tabular',
    resumenMetrics,
  };
}

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { userId } = useUser();
  const [financialData, setData] = useState<Record<string, FinancialSheet>>({});
  const [documentText, setDocText] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce userId changes to avoid flooding Supabase during auth state transitions
  const [debouncedUserId, setDebouncedUserId] = useState(userId);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedUserId(userId), 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [userId]);

  // Load data from Supabase on mount/login (uses debouncedUserId to avoid floods)
  useEffect(() => {
    const loadData = async () => {
      if (!debouncedUserId) {
        clearData();
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_financial_documents')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error("Supabase error detail:", error);
          throw error;
        }

        if (data) {
          if (data.file_type === 'pdf') {
            setDocText(data.data as string);
            setData({});
          } else {
            setData(data.data as Record<string, FinancialSheet>);
            setDocText(null);
          }
          setSummary(data.summary as FinancialSummary);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error loading financial data from Supabase:", message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [debouncedUserId]);

  const setFinancialData = (sheets: Record<string, FinancialSheet>, fileName = "documento.xlsx") => {
    setData(sheets);
    setDocText(null);
    if (Object.keys(sheets).length > 0) {
      setSummary(buildSummary(sheets, fileName, 'tabular'));
    } else {
      setSummary(null);
    }
  };

  const setDocumentText = (text: string, fileName: string) => {
    setDocText(text);
    setData({});
    setSummary(buildSummary({}, fileName, 'pdf', text));
  };

  const clearData = () => {
    setData({});
    setDocText(null);
    setSummary(null);
  };

  const saveToSupabase = async (uid: string, isVerified = false) => {
    if (!summary || !uid) return { success: false, error: 'No user or data' };
    
    setIsSaving(true);
    try {
      const payload = {
        user_id: uid,
        file_name: summary.fileName,
        file_type: summary.fileType,
        data: summary.fileType === 'pdf' ? documentText : financialData,
        summary: summary,
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_financial_documents')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error saving financial document:", message);
      return { success: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  const syncAssetsToPortfolio = async (uid: string, assets: Partial<PortfolioAsset>[]) => {
    if (!uid || assets.length === 0) return { success: false, error: 'No data' };
    setIsSaving(true);
    try {
      // Delete ALL existing portfolio assets for this user first.
      // This gives a clean slate so deleted assets don't linger from old uploads.
      const { error: deleteError } = await supabase
        .from('user_portfolio')
        .delete()
        .eq('user_id', uid);

      if (deleteError) throw deleteError;

      // Insert the fresh asset list
      const payload = assets.map(a => ({
        ...a,
        user_id: uid,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('user_portfolio')
        .insert(payload)
        .select();

      if (error) throw error;
      return { success: true, count: data?.length || 0 };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error syncing assets:", message);
      return { success: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  const syncTransactionsToUser = async (uid: string, transactions: Partial<Transaction>[]) => {
    if (!uid || transactions.length === 0) return { success: false, error: 'No data' };
    setIsSaving(true);
    try {
      // 1. Fetch existing transactions to deduplicate
      const { data: existing, error: fetchError } = await supabase
        .from('user_transactions')
        .select('date, amount, description')
        .eq('user_id', uid);

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      // 2. Identify duplicates
      const existingKeys = new Set(
        (existing || []).map(t => `${t.date}_${t.amount}_${t.description.toUpperCase().trim()}`)
      );

      const newTransactions = transactions.filter(t => {
        const key = `${t.date}_${t.amount}_${t.description?.toUpperCase().trim()}`;
        return !existingKeys.has(key);
      });

      if (newTransactions.length === 0) {
        return { success: true, count: 0 };
      }

      // 3. Batch insert
      const payload = newTransactions.map(t => ({
        ...t,
        user_id: uid,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('user_transactions')
        .insert(payload)
        .select();

      if (error) throw error;
      return { success: true, count: data?.length || 0 };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error syncing transactions:", message);
      return { success: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FinancialContext.Provider value={{ 
      financialData, 
      documentText, 
      summary, 
      setFinancialData, 
      setDocumentText, 
      clearData,
      saveToSupabase,
      syncAssetsToPortfolio,
      syncTransactionsToUser,
      isSaving,
      isLoading
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error("useFinancial must be used inside <FinancialProvider>");
  return ctx;
}
