// Supabase browser client.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    "[AuraPal] Missing Supabase env vars. VITE_SUPABASE_URL and " +
    "VITE_SUPABASE_PUBLISHABLE_KEY must be set in the Vercel project."
  );
}

// Guard against a very common deploy mistake: URL from one project,
// anon key from another. The key is a JWT whose `ref` claim must match
// the project ref in the URL, otherwise every auth call fails silently.
try {
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    const urlRef = new URL(SUPABASE_URL).hostname.split(".")[0];
    const payload = JSON.parse(atob(SUPABASE_PUBLISHABLE_KEY.split(".")[1]));
    if (payload?.ref && payload.ref !== urlRef) {
      console.error(
        `[AuraPal] Supabase misconfiguration: VITE_SUPABASE_URL points at ` +
        `"${urlRef}" but VITE_SUPABASE_PUBLISHABLE_KEY belongs to "${payload.ref}". ` +
        `Auth and all database calls will fail until these match.`
      );
    }
  }
} catch {
  /* key isn't a decodable JWT — ignore, Supabase will surface it */
}

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
