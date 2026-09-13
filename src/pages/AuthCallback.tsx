import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dedicated OAuth landing route.
 *
 * Providers redirect here with either a `?code=` (PKCE) or a `#access_token=`
 * fragment. Sending them to a guarded route instead caused a race: the guard
 * ran before supabase-js had exchanged the code, saw no user, and bounced
 * straight back to /auth — which looked like "login does nothing".
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      // Provider or Supabase returned an explicit error.
      const providerError =
        params.get("error_description") || params.get("error") ||
        hash.get("error_description") || hash.get("error");
      if (providerError) {
        if (!cancelled) setError(decodeURIComponent(providerError));
        return;
      }

      const next = params.get("next") || "/dashboard";

      // PKCE: exchange the code for a session explicitly so we can report failures.
      const code = params.get("code");
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr && !cancelled) { setError(exErr.message); return; }
      }

      // Implicit flow, or session already restored from storage.
      const { data, error: sesErr } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sesErr) { setError(sesErr.message); return; }

      if (data.session) {
        navigate(next, { replace: true });
      } else {
        setError("Signed in with the provider, but no session was created. Check that this site's URL is listed under Redirect URLs in Supabase.");
      }
    };

    finish();
    return () => { cancelled = true; };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold">Sign-in failed</h1>
          <p className="text-sm text-muted-foreground break-words">{error}</p>
          <button
            onClick={() => navigate("/auth", { replace: true })}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
