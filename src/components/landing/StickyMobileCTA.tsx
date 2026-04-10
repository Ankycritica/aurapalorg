import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/90 backdrop-blur-xl border-t border-border/50 md:hidden">
      <Link to="/auth" className="block w-full py-3 rounded-xl font-semibold text-sm text-center bg-gradient-to-r from-primary to-accent text-primary-foreground">
        Get started free →
      </Link>
    </div>
  );
}
