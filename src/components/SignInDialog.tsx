import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/landing-mono.css";

/**
 * Sign-in as a small dialog over whatever page the visitor is on, instead of
 * a separate full-screen page. Any link to /auth (or /auth?next=...) anywhere
 * in the app opens this dialog in place; /auth itself renders the homepage
 * with the dialog open (see pages/Auth.tsx).
 */

type Ctx = { openSignIn: (next?: string) => void };
const SignInContext = createContext<Ctx>({ openSignIn: () => {} });
// eslint-disable-next-line react-refresh/only-export-components
export const useSignIn = () => useContext(SignInContext);

const safeNext = (next?: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") && next !== "/" && !next.startsWith("/auth") ? next : "/dashboard";

export function SignInProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("/dashboard");

  const openSignIn = useCallback((n?: string) => {
    setNext(safeNext(n));
    setOpen(true);
  }, []);

  // Intercept every in-app link to /auth so it opens the dialog instead of
  // navigating away. Runs in the capture phase, before React Router's Link
  // handler, which skips navigation when the event is already prevented.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!/^\/auth(\?|$)/.test(href)) return;
      e.preventDefault();
      openSignIn(new URLSearchParams(href.split("?")[1] ?? "").get("next") ?? undefined);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openSignIn]);

  const value = useMemo(() => ({ openSignIn }), [openSignIn]);
  return (
    <SignInContext.Provider value={value}>
      {children}
      <SignInDialog open={open} onOpenChange={setOpen} next={next} />
    </SignInContext.Provider>
  );
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const inputCls =
  "w-full h-11 rounded-lg px-3.5 text-sm bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors";

export function SignInDialog({ open, onOpenChange, next }: { open: boolean; onOpenChange: (o: boolean) => void; next: string }) {
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => { if (!open) { setShowEmail(false); setLoading(false); setGoogleLoading(false); } }, [open]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) { toast.error(error.message || "Google sign-in failed"); setGoogleLoading(false); }
      // On success the browser redirects to Google.
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onOpenChange(false);
        navigate(next);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="lm fixed z-50 left-1/2 -translate-x-1/2 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 w-full sm:max-w-[400px] rounded-t-2xl sm:rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4"
          style={{ background: "#0a0a0a" }}
        >
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl mb-5" />
          <DialogPrimitive.Title className="font-display text-[22px] font-bold tracking-[-0.02em] leading-tight">
            {mode === "login" && showEmail ? "Welcome back" : "Keep going with AuraPal"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed" style={{ color: "var(--lm-fg-2)" }}>
            All ten tools, free. Your results are saved to your account. No credit card.
          </DialogPrimitive.Description>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-invert mt-6 w-full h-12 text-[15px] inline-flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {!showEmail ? (
            <button
              onClick={() => setShowEmail(true)}
              className="mt-3 w-full h-11 text-sm rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "var(--lm-fg-2)" }}
            >
              Use email instead
            </button>
          ) : (
            <form onSubmit={handleEmail} className="mt-5 pt-5 border-t border-white/10 space-y-3">
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" aria-label="Email" autoComplete="email" className={inputCls} />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" aria-label="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputCls} />
              <button type="submit" disabled={loading}
                className="btn-ghost w-full h-11 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "Sign in" : "Create free account"}
              </button>
              <p className="text-center text-xs" style={{ color: "var(--lm-fg-3)" }}>
                {mode === "login" ? "New here? " : "Already have an account? "}
                <button type="button" onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))} className="underline underline-offset-2 text-white/70 hover:text-white">
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </form>
          )}

          <p className="mt-5 text-[11px] leading-relaxed text-center" style={{ color: "var(--lm-fg-3)" }}>
            By continuing you agree to the{" "}
            <Link to="/terms" onClick={() => onOpenChange(false)} className="underline underline-offset-2">Terms</Link> and{" "}
            <Link to="/privacy" onClick={() => onOpenChange(false)} className="underline underline-offset-2">Privacy Policy</Link>.
          </p>

          {/* Last in the DOM so initial focus lands on the Google button, not the close icon. */}
          <DialogPrimitive.Close className="absolute right-4 top-4 p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="Close">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
