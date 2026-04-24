import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCheck, Linkedin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface LinkedInShareModalProps {
  open: boolean;
  onClose: () => void;
  initialText: string;
  shareUrl: string;
}

export function LinkedInShareModal({ open, onClose, initialText, shareUrl }: LinkedInShareModalProps) {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied! Paste into LinkedIn ✓");
    setTimeout(() => setCopied(false), 2000);
  };

  const openLinkedIn = () => {
    copy();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 max-w-xl w-full relative"
            // reset text whenever modal reopens with fresh input
            key={initialText.slice(0, 40)}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              <h3 className="font-display font-bold text-lg">Your LinkedIn post</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Edit the copy below, then paste into LinkedIn. Tuned to maximize impressions.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 text-right tabular-nums">{text.length} chars · {text.split(/\s+/).filter(Boolean).length} words</p>
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <button
                onClick={copy}
                className="py-2.5 rounded-lg font-semibold text-sm bg-secondary/60 hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {copied ? <CheckCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy for LinkedIn"}
              </button>
              <button
                onClick={openLinkedIn}
                className="py-2.5 rounded-lg font-semibold text-sm bg-[#0A66C2] hover:bg-[#0a5aab] text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" /> Open LinkedIn
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
