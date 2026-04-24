import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCheck, Twitter, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface TwitterShareModalProps {
  open: boolean;
  onClose: () => void;
  tweets: string[];
}

export function TwitterShareModal({ open, onClose, tweets }: TwitterShareModalProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success(`Tweet ${idx + 1} copied ✓`);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(tweets.join("\n\n---\n\n"));
    toast.success("Full thread copied ✓");
  };

  const openTweetIntent = (text: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
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
            className="glass-card p-6 max-w-xl w-full relative max-h-[88vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Twitter className="h-4 w-4 text-foreground" />
              <h3 className="font-display font-bold text-lg">Your Twitter thread</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{tweets.length}-tweet thread, ready to post. Tap any tweet to copy.</p>

            <div className="space-y-3">
              {tweets.map((t, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Tweet {i + 1} / {tweets.length}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{t.length} / 280</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{t}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => copy(t, i)}
                      className="py-2 rounded-lg font-semibold text-xs bg-secondary/60 hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      {copiedIdx === i ? <CheckCheck className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedIdx === i ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => openTweetIntent(t)}
                      className="py-2 rounded-lg font-semibold text-xs bg-foreground/90 hover:bg-foreground text-background transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Tweet this
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={copyAll}
              className="w-full mt-4 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Copy className="h-4 w-4" /> Copy full thread
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
