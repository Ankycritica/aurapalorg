import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSignIn } from "@/components/SignInDialog";
import Landing from "@/pages/Landing";

/**
 * /auth no longer has its own full-screen page. Visiting it (a bookmark, an
 * old link, or a redirect from a signed-in-only page) shows the homepage with
 * the sign-in dialog open; `next` is kept so sign-in returns the visitor to
 * where they were going. Links to /auth inside the app open the same dialog in
 * place without navigating here at all.
 */
export default function Auth() {
  const { user, loading } = useAuth();
  const { openSignIn } = useSignIn();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? undefined;

  useEffect(() => {
    if (loading || user) return;
    openSignIn(next);
    navigate("/", { replace: true });
  }, [loading, user, next, openSignIn, navigate]);

  if (user) {
    const dest = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/auth") && next !== "/" ? next : "/dashboard";
    return <Navigate to={dest} replace />;
  }
  return <Landing />;
}
