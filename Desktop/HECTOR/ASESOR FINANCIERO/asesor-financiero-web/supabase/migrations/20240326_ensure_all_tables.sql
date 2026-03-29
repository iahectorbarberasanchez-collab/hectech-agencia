-- 1. Ensure user_financial_documents exists
CREATE TABLE IF NOT EXISTS public.user_financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('tabular', 'pdf')),
  data JSONB NOT NULL,
  summary JSONB NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for user_financial_documents
ALTER TABLE public.user_financial_documents ENABLE ROW LEVEL SECURITY;

-- Policies for user_financial_documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own documents') THEN
    CREATE POLICY "Users can view their own documents" ON public.user_financial_documents FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own documents') THEN
    CREATE POLICY "Users can insert their own documents" ON public.user_financial_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own documents') THEN
    CREATE POLICY "Users can update their own documents" ON public.user_financial_documents FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own documents') THEN
    CREATE POLICY "Users can delete their own documents" ON public.user_financial_documents FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Ensure user_transactions exists
CREATE TABLE IF NOT EXISTS public.user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for user_transactions
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_transactions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own transactions') THEN
    CREATE POLICY "Users can view their own transactions" ON public.user_transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own transactions') THEN
    CREATE POLICY "Users can insert their own transactions" ON public.user_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own transactions') THEN
    CREATE POLICY "Users can update their own transactions" ON public.user_transactions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own transactions') THEN
    CREATE POLICY "Users can delete their own transactions" ON public.user_transactions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_financial_documents_user_id ON public.user_financial_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON public.user_transactions(user_id);
