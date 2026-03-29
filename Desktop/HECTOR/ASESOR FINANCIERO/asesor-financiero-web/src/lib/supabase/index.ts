import { createClient } from './client';

export const supabase = createClient();

// For backward compatibility and convenience in client components
export default supabase;
