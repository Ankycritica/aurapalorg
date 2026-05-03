import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCheck, Linkedin, Twitter, MessageCircle, Gift, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReferralModalProps { open: boolean; onClose: () => void; }

const SITE_URL = "https://aurapal.org";

export function ReferralModal({ open, onClose }: ReferralModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ referrals: 0 });

  const code = (profile as any)?.referral_code || "";
  const link = useMemo(() => code ? `${SITE_URL}/?ref=${code}` : SITE_URL, [code]);
  const referralCredits = (profile as any)?.referral_credits_earned ?? 0;
  const shareCredits = (profile as any)?.share_credits_earned ?? 0;

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { count } = await supabase.from("referrals" as any)
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      setStats({ referrals: count ?? 0 });
    })();
  }, [open, user]);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
    await reward("copy");
  };

  const reward = async (platform: string) => {
    const { data, error } = await supabase.functions.invoke("award-credits", {
      body: { action: "share", platform },
    });
    if (error) return;
    if ((data as any)?.awarded) {
      toast.success(`🎉 +${(data as any).awarded} credits unlocked!`);
      refreshProfile();
    } else if ((data as any)?.daily_capped) {
      toast("Daily share limit reached. Come back tomorrow!");
    } else if ((data as any)?.capped) {
      toast("You've maxed out share credits 🎉");
    }
  };

  const shareLinkedIn = () => {
    const text = `I just tried this AI tool called AuraPal and it actually surprised me.\nIt helps with career decisions, ideas, and more.\nWorth trying: ${link}`;
    navigator.clipboard.writeText(text).catch(() => {});
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, "_blank", "noopener,noreferrer");
    reward("linkedin");
  };
  const shareTwitter = () => {
    const text = `Just tried AuraPal — pretty useful AI tool for ideas and career growth.\nTry it: ${link}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    reward("twitter");
  };
  const shareWhatsapp = () => {
    const text = `Try AuraPal — free AI career tools: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    reward("whatsapp");
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
            className="glass-card p-6 max-w-lg w-full relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-xl">Earn free credits</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Invite friends (+10) or share AuraPal (+5). Up to 150 bonus credits.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-5">
              <Stat icon={Users} label="Referrals" value={stats.referrals} />
              <Stat icon={Gift} label="Referral cr." value={referralCredits} suffix="/100" />
              <Stat icon={Sparkles} label="Share cr." value={shareCredits} suffix="/50" />
            </div>

            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your link</label>
            <div className="flex gap-2 mt-1.5 mb-4">
              <input readOnly value={link}
                className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono" />
              <button onClick={copy} className="px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 text-sm font-semibold">
                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ShareBtn onClick={shareLinkedIn} icon={Linkedin} label="LinkedIn" color="#0A66C2" />
              <ShareBtn onClick={shareTwitter} icon={Twitter} label="X / Twitter" color="#000" />
              <ShareBtn onClick={shareWhatsapp} icon={MessageCircle} label="WhatsApp" color="#25D366" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon: Icon, label, value, suffix }: any) {
  return (
    <div className="rounded-lg bg-secondary/40 border border-border/50 p-3">
      <Icon className="h-3.5 w-3.5 text-primary mb-1" />
      <div className="text-lg font-bold tabular-nums">{value}<span className="text-xs text-muted-foreground font-normal">{suffix || ""}</span></div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function ShareBtn({ onClick, icon: Icon, label, color }: any) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all active:scale-[0.98]">
      <Icon className="h-4 w-4" style={{ color }} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
