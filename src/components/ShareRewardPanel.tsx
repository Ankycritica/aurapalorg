import { useState } from "react";
import { Gift, Share2 } from "lucide-react";
import { ReferralModal } from "./ReferralModal";

interface Props { compact?: boolean; }

export function ShareRewardPanel({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={`glass-card ${compact ? "p-4" : "p-5"} mt-4 flex items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent`}>
        <div className="min-w-0">
          <p className="font-display font-bold text-sm flex items-center gap-1.5">🔥 Want more free runs?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Invite friends → +10 credits · Share result → +5 credits</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setOpen(true)}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 active:scale-[0.98]">
            <Gift className="h-3.5 w-3.5" /> Invite
          </button>
          <button onClick={() => setOpen(true)}
            className="px-3 py-2 rounded-lg bg-secondary/60 hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98]">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>
      <ReferralModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
