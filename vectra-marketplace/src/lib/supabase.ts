import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[Vectra Marketplace] Missing Supabase env vars. Check .env.local');
}

// Browser client — for client components
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server client — for API routes and server components (uses service key)
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('[Vectra Marketplace] Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
};
