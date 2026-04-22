import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Linkedin, Image as ImageIcon, Share2, Gift, X, Loader2, Copy, CheckCheck, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getReferralLink, getOrCreateReferralCode, REFERRAL_SITE_URL } from "@/lib/referral";

interface SharePanelProps {
  result: string;
  toolTitle: string;
  toolSlug: string;
}

const SITE_URL = REFERRAL_SITE_URL;

// Convert markdown-ish text into a clean LinkedIn post
function toLinkedInPost(result: string, toolTitle: string, refLink: string): string {
  const stripped = result
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = stripped.split("\n").filter(l => l.trim().length > 0);
  const hook = `I just used AuraPal's ${toolTitle} and the result blew my mind 🤯\n`;
  const body = lines.slice(0, 14).join("\n");
  const cta = `\n\n---\n\nIf you're working on your career, this is a goldmine.\nTry it free → ${refLink}\n\n#CareerGrowth #AI #AuraPal`;
  return `${hook}\n${body}${cta}`;
}

// Convert into a Twitter / X thread (numbered tweets, ~270 chars each)
function toTwitterThread(result: string, toolTitle: string, refLink: string): string[] {
  const stripped = result
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();

  const sentences = stripped.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const tweets: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).length > 240) {
      if (buf) tweets.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf) tweets.push(buf.trim());

  const hook = `Used AuraPal's ${toolTitle} today. The output is too good not to share 🧵👇`;
  const outro = `That's it. \n\nTry the same tool free → ${refLink}`;
  return [hook, ...tweets.slice(0, 8), outro].map((t, i, arr) => `${i + 1}/${arr.length} ${t}`);
}

export function SharePanel({ result, toolTitle, toolSlug }: SharePanelProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [copiedKind, setCopiedKind] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const referralLink = getReferralLink(user?.id);
  const referralCode = getOrCreateReferralCode(user?.id);

  const summary = (result || "")
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim()
    .slice(0, 480);

  const copyAs = async (kind: "linkedin" | "twitter") => {
    const text = kind === "linkedin"
      ? toLinkedInPost(result, toolTitle, referralLink)
      : toTwitterThread(result, toolTitle, referralLink).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedKind(kind);
    toast.success(kind === "linkedin" ? "LinkedIn post copied — paste & post!" : "Twitter thread copied!");
    setTimeout(() => setCopiedKind(null), 2500);
  };

  const copyReferralLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    toast.success(`Your referral link is copied 🎁  Code: ${referralCode}`);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const generateImage = async () => {
    setShowImageModal(true);
    setImageDataUrl(null);
    setGeneratingImage(true);
    // wait one frame for the hidden card to mount
    await new Promise(r => setTimeout(r, 50));
    if (!cardRef.current) { setGeneratingImage(false); return; }
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0A0F1E",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      setImageDataUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      toast.error("Couldn't generate image. Try again.");
      setShowImageModal(false);
    } finally {
      setGeneratingImage(false);
    }
  };

  const downloadImage = () => {
    if (!imageDataUrl) return;
    const a = document.createElement("a");
    a.href = imageDataUrl;
    a.download = `aurapal-${toolSlug}.png`;
    a.click();
    toast.success("Saved! Now share it on socials 🚀");
  };

  const nativeShareImage = async () => {
    if (!imageDataUrl) return;
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], `aurapal-${toolSlug}.png`, { type: "image/png" });
      const shareData: ShareData = {
        title: `My ${toolTitle} result from AuraPal`,
        text: `Just used AuraPal's ${toolTitle} 🤯 — try it free at ${SITE_URL}`,
        files: [file],
      };
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        downloadImage();
      }
    } catch {
      downloadImage();
    }
  };

  const shareReferral = async () => {
    const text = `I'm using AuraPal — free AI career tools (resume, LinkedIn audit, interview prep, salary checker). Worth a look:`;
    if (navigator.share) {
      try { await navigator.share({ title: "AuraPal", text, url: referralLink }); return; } catch {}
    }
    await navigator.clipboard.writeText(`${text} ${referralLink}`);
    toast.success(`Referral link copied 🎁  Code: ${referralCode}`);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Share your result</p>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
            Viral mode
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button onClick={generateImage}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 hover:from-primary/25 hover:to-accent/25 border border-primary/20 transition-all duration-200 active:scale-[0.97]">
            <ImageIcon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-foreground">Share as image</span>
          </button>
          <button onClick={() => copyAs("linkedin")}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-[#0A66C2]/40 transition-all duration-200 active:scale-[0.97]">
            {copiedKind === "linkedin" ? <CheckCheck className="h-4 w-4 text-[#0A66C2]" /> : <Linkedin className="h-4 w-4 text-[#0A66C2] group-hover:scale-110 transition-transform" />}
            <span className="text-xs font-semibold text-foreground">{copiedKind === "linkedin" ? "Copied!" : "LinkedIn post"}</span>
          </button>
          <button onClick={() => copyAs("twitter")}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-foreground/40 transition-all duration-200 active:scale-[0.97]">
            {copiedKind === "twitter" ? <CheckCheck className="h-4 w-4 text-foreground" /> : <Twitter className="h-4 w-4 text-foreground group-hover:scale-110 transition-transform" />}
            <span className="text-xs font-semibold text-foreground">{copiedKind === "twitter" ? "Copied!" : "Twitter thread"}</span>
          </button>
          <button onClick={shareReferral}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/30 transition-all duration-200 active:scale-[0.97]">
            <Gift className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-foreground">+10 credits</span>
          </button>
        </div>

        {/* Unique referral link row */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground leading-tight">Your unique referral link · earn <span className="text-amber-400 font-semibold">+10 credits</span> per signup</p>
            <p className="text-xs font-mono text-foreground truncate mt-0.5">{referralLink}</p>
          </div>
          <button onClick={copyReferralLink}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all active:scale-[0.97]">
            {copiedRef ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedRef ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Every output includes <span className="text-foreground font-medium">"Generated via AuraPal"</span> attribution — sustainable growth, no spam.
        </p>
      </motion.div>

      {/* Hidden render target for image export */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <div ref={cardRef} style={{ width: 1080, padding: 64, background: "linear-gradient(135deg, #0A0F1E 0%, #131B36 50%, #0A0F1E 100%)", color: "#E5E7EB", fontFamily: "Inter, system-ui, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, hsl(173,80%,40%), hsl(262,83%,58%))", display: "flex", alignItems: "center", justifyContent: "center", color: "#0A0F1E", fontWeight: 800, fontSize: 28, fontFamily: "Space Grotesk, Inter, sans-serif" }}>A</div>
            <div>
              <div style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontWeight: 700, fontSize: 28, color: "#fff", lineHeight: 1 }}>AuraPal</div>
              <div style={{ fontSize: 12, color: "hsl(173,80%,55%)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>Career Engine</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 999, background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.35)", fontSize: 13, fontWeight: 600, color: "hsl(173,80%,60%)" }}>{toolTitle}</div>
          </div>
          <div style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontWeight: 700, fontSize: 44, lineHeight: 1.15, color: "#fff", marginBottom: 28, letterSpacing: -0.5 }}>
            “{summary.split("\n")[0].slice(0, 120)}{summary.split("\n")[0].length > 120 ? "…" : ""}”
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.55, color: "#CBD5E1", whiteSpace: "pre-wrap" }}>
            {summary.split("\n").slice(1, 6).join("\n").slice(0, 420)}
          </div>
          <div style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <div style={{ fontSize: 14, color: "#94A3B8" }}>Generated with AI on</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "Space Grotesk, Inter, sans-serif" }}>aurapal.org</div>
            </div>
            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Free AI Career Engine · Try it yourself</div>
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowImageModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-2xl w-full relative">
              <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-display font-bold text-lg mb-1">Your shareable card 🔥</h3>
              <p className="text-sm text-muted-foreground mb-4">Download or share directly. Branded with AuraPal.</p>
              <div className="rounded-xl overflow-hidden bg-secondary/40 min-h-[280px] flex items-center justify-center">
                {generatingImage || !imageDataUrl ? (
                  <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Designing your card…</p>
                  </div>
                ) : (
                  <img src={imageDataUrl} alt="Shareable card" className="w-full h-auto" />
                )}
              </div>
              {imageDataUrl && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={downloadImage}
                    className="py-3 rounded-lg font-semibold text-sm bg-secondary/60 hover:bg-secondary text-foreground transition-all flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Download PNG
                  </button>
                  <button onClick={nativeShareImage}
                    className="py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" /> Share now
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
