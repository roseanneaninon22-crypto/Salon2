import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Keep one browser client across React Fast Refresh module reloads.
const globalForSupabase = globalThis as typeof globalThis & {
  salonSupabase?: ReturnType<typeof createClient>;
};

export const supabase =
  globalForSupabase.salonSupabase ?? createClient(supabaseUrl, supabaseAnonKey);

globalForSupabase.salonSupabase = supabase;
