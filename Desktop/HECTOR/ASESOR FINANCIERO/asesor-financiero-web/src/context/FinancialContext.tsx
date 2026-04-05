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

export type FinancialSummary = {
  totalRows: number;
  totalSheets: number;
  fileName: string;
  sheets: FinancialSheet[];
  documentText?: string;
  fileType: 'tabular' | 'pdf';
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

  return {
    totalRows,
    totalSheets: sheetList.length,
    fileName,
    sheets: sheetList,
    fileType: 'tabular'
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
