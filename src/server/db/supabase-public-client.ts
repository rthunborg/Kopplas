import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./supabase-env";
/** A new anon-only client per request. No browser storage, cookies or inbound auth. */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) } });
}
