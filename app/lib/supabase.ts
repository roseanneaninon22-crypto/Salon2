
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use a loose database type until the complete schema is available.
const globalForSupabase = globalThis as typeof globalThis & {
  salonSupabase?: ReturnType<typeof createClient<any>>;
};

export const supabase =
  globalForSupabase.salonSupabase ??
  createClient<any>(supabaseUrl, supabaseAnonKey);

globalForSupabase.salonSupabase = supabase;
