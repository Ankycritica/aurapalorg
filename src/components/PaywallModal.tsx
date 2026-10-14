import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

// AuraPal is free. The only limit is a high daily cap to stop abuse, so this
// modal just explains the reset — there is nothing to buy.
export function PaywallModal({ open, onClose }: PaywallModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 sm:p-8 max-w-md w-full relative text-center"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Daily limit reached</h2>
            <p className="text-muted-foreground text-sm mb-6">
              AuraPal is free. To keep it that way there's a daily cap per account, and it resets at midnight UTC.
              Your saved results are still in History.
            </p>
            <button onClick={onClose} className="w-full py-3 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90">
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
