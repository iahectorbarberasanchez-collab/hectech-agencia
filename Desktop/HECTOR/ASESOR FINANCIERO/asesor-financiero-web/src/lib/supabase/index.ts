import { createClient } from './client';

export const supabase = createClient();

// Re-export types for convenience
export type { PortfolioAsset, Transaction } from '@/types/supabase';

// For backward compatibility and convenience in client components
export default supabase;
