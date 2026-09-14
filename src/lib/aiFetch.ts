import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

/**
 * Authenticated fetch to a Supabase edge function. Sends the user's session JWT
 * so the function can validate the caller and enforce server-side limits.
 * Throws if the user is not signed in.
 */
export async function aiFetch(path: "ai-tool" | "aura-agent" | "salary-data", body: unknown): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });
}
