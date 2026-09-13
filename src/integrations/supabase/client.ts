// Supabase browser client.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Project defaults.
//
// These are deliberately committed. Both values are public by design: any
// VITE_* variable is compiled into the browser bundle, and the anon key is
// meant to be shipped to clients — it carries no privileges of its own and
// every table is gated by row-level security. Keeping them here means a
// missing or stale Vercel environment variable can no longer take the whole
// app down, which is exactly what happened when the key still pointed at the
// previous Supabase project ("Invalid API key" on every request).
//
// Service-role keys and provider secrets are NOT public and live only in
// Supabase Edge Function secrets. Never add one to this file.
const DEFAULT_SUPABASE_URL = "https://urwltccnnlbyibvtqrmr.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyd2x0Y2NubmxieWlidnRxcm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODU2ODksImV4cCI6MjEwNDU2MTY4OX0." +
  "TLdzSUTophOlPEq02vnAdj6TazRkkTT0fz7if8j6tSM";

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// An env var only wins if it agrees with the project the defaults point at.
// A URL and key from different projects is the failure mode we are guarding
// against, so a mismatched pair is discarded in favour of the defaults.
function projectRefOf(url?: string): string | null {
  try { return url ? new URL(url).hostname.split(".")[0] : null; } catch { return null; }
}
function keyRefOf(key?: string): string | null {
  try { return key ? JSON.parse(atob(key.split(".")[1]))?.ref ?? null : null; } catch { return null; }
}

const EXPECTED_REF = projectRefOf(DEFAULT_SUPABASE_URL);

// Env vars are only honoured when the URL and key agree with each other AND
// point at this project. Anything else — a mismatched pair, or a leftover
// pair from the old Supabase project — is ignored. Without the second check a
// stale-but-internally-consistent pair would silently win and send the whole
// app at a database that no longer backs it.
const envPairIsConsistent =
  !!envUrl && !!envKey &&
  projectRefOf(envUrl) === keyRefOf(envKey) &&
  projectRefOf(envUrl) === EXPECTED_REF;

if (envUrl && envKey && !envPairIsConsistent) {
  console.warn(
    `[AuraPal] Ignoring Supabase env vars (url ref "${projectRefOf(envUrl)}", ` +
    `key ref "${keyRefOf(envKey)}"); expected "${EXPECTED_REF}". ` +
    `Using the built-in project instead.`
  );
}

export const SUPABASE_URL = envPairIsConsistent ? envUrl! : DEFAULT_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = envPairIsConsistent ? envKey! : DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Implicit, not PKCE. PKCE keeps a one-time code_verifier in localStorage
    // on the origin that started the flow. AuraPal is served from three
    // origins (apex -> 308 -> www, plus *.vercel.app previews), so a login
    // begun on one and returned to another loses the verifier and fails with
    // "PKCE code verifier not found in storage". This is a pure browser SPA
    // with no server to hold the verifier in a cookie, so implicit is both
    // sufficient and far more robust here.
    flowType: 'implicit',
  },
});
