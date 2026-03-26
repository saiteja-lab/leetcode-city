import { createClient } from "@supabase/supabase-js";

import { APP_ENV } from "../config/env";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      `Supabase is not configured for ${APP_ENV}. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.`,
    );
  }

  return supabase;
}
