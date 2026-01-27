-- Migration: Add missing columns for Dashboard
-- Run this in your Supabase SQL Editor

ALTER TABLE automation_metrics
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ONBOARDING',
ADD COLUMN IF NOT EXISTS drive_folder_url TEXT;

-- Optional: Add comment
COMMENT ON COLUMN automation_metrics.status IS 'Estado del proyecto: ONBOARDING, ACTIVE, IN_PROGRESS';
