import { supabase } from "@/integrations/supabase/client";

/**
 * Authenticated fetch to a Supabase edge function. Sends the user's session JWT
 * so the function can validate the caller and enforce server-side limits.
 * Throws if the user is not signed in.
 */
export async function aiFetch(path: "ai-tool" | "aura-agent", body: unknown): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });
}
