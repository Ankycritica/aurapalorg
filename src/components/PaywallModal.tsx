import { motion, AnimatePresence } from "framer-motion";
import { Crown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card gradient-border p-8 max-w-md w-full text-center relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Daily Limit Reached</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You've used all your free AI generations for today. Upgrade to Pro for 100 daily generations or go Premium for unlimited access.
            </p>
            <button
              onClick={() => { onClose(); navigate("/pricing"); }}
              className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all mb-3"
            >
              View Pricing Plans
            </button>
            <p className="text-xs text-muted-foreground">Your limit resets at midnight UTC</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
