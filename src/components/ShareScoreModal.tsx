import { useState } from "react";
import { X, CheckCheck, Copy } from "lucide-react";
import { toast } from "sonner";

interface ShareScoreModalProps {
  open: boolean;
  onClose: () => void;
  score: number;
  type: "resume" | "LinkedIn";
}

export function ShareScoreModal({ open, onClose, score, type }: ShareScoreModalProps) {
  const defaultText = `My ${type} got roasted by AuraPal AI: ${score}/100 😂\nGet yours roasted free → aurapal.org #AuraPal #CareerTips`;
  const [text, setText] = useState(defaultText);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-display font-bold text-lg mb-4">Share Your Score 🔥</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
        />
        <div className="flex gap-3">
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3 rounded-lg font-semibold text-sm bg-[#1DA1F2] text-white hover:opacity-90 transition-all text-center">
            Tweet / X
          </a>
          <button onClick={copyText}
            className="flex-1 py-3 rounded-lg font-semibold text-sm bg-secondary/60 hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-2">
            {copied ? <><CheckCheck className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy text</>}
          </button>
        </div>
      </div>
    </div>
  );
}
