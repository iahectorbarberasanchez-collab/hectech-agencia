-- ============================================================
-- Script de Migración: Unique Constraints para user_portfolio
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Añadir unique constraint en user_portfolio para evitar activos duplicados
--    por usuario + ticker + nombre de activo.
--    Esto complementa la lógica de deduplicación del frontend.
ALTER TABLE user_portfolio
  ADD CONSTRAINT uq_user_portfolio_user_ticker
  UNIQUE (user_id, ticker, asset_name);

-- 2. Índice de rendimiento en user_transactions para búsquedas por usuario
--    (ya que se usa ORDER BY date con frecuencia)
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_date
  ON user_transactions (user_id, date DESC);

-- 3. Índice de rendimiento en user_income_history para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_user_income_history_user_year_month
  ON user_income_history (user_id, year DESC, month DESC);

-- 4. (Opcional) Unique constraint en user_financial_documents
--    Ya existe el upsert con onConflict: 'user_id', pero garantizar
--    a nivel de DB que solo existe 1 registro por usuario es más seguro.
ALTER TABLE user_financial_documents
  ADD CONSTRAINT uq_user_financial_documents_user
  UNIQUE (user_id);

-- ============================================================
-- NOTA: Si ya tienes datos duplicados, ejecuta primero:
-- DELETE FROM user_portfolio a
--   USING user_portfolio b
--   WHERE a.id > b.id
--     AND a.user_id = b.user_id
--     AND a.ticker = b.ticker
--     AND a.asset_name = b.asset_name;
-- ============================================================
