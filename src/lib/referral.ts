// Lightweight client-side referral tracking.
// - Captures ?ref=CODE on first visit and stores it in localStorage.
// - Generates a stable referral code per user (or anonymous device).
// - Provides helpers for share URLs and an attribution footer.

const SITE_URL = "https://aurapal.org";
const STORAGE_REF_CODE = "aurapal_referral_code";       // this user's own code
const STORAGE_REFERRED_BY = "aurapal_referred_by";       // code that referred this user
const STORAGE_REFERRAL_CREDITS = "aurapal_referral_credits";

function generateCode(seed?: string | null): string {
  // Short, URL-safe, somewhat memorable
  if (seed) {
    // Use first 6 chars of base36'd hash of seed for stability
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36).slice(0, 7).toUpperCase();
  }
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

export function captureReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && !localStorage.getItem(STORAGE_REFERRED_BY)) {
      localStorage.setItem(STORAGE_REFERRED_BY, ref.slice(0, 24));
      return ref;
    }
  } catch {}
  return null;
}

export function getReferredBy(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(STORAGE_REFERRED_BY); } catch { return null; }
}

export function getOrCreateReferralCode(userId?: string | null): string {
  if (typeof window === "undefined") return "GUEST";
  try {
    const existing = localStorage.getItem(STORAGE_REF_CODE);
    if (existing) return existing;
    const code = generateCode(userId || null);
    localStorage.setItem(STORAGE_REF_CODE, code);
    return code;
  } catch {
    return generateCode(userId || null);
  }
}

export function getReferralLink(userId?: string | null): string {
  const code = getOrCreateReferralCode(userId);
  return `${SITE_URL}/?ref=${code}`;
}

export function getReferralCredits(): number {
  if (typeof window === "undefined") return 0;
  try { return Number(localStorage.getItem(STORAGE_REFERRAL_CREDITS) || 0); } catch { return 0; }
}

export function addReferralCredits(amount: number): number {
  if (typeof window === "undefined") return 0;
  const next = getReferralCredits() + amount;
  try { localStorage.setItem(STORAGE_REFERRAL_CREDITS, String(next)); } catch {}
  return next;
}

// Attribution footer appended to copied / shared text outputs.
export function attributionFooter(): string {
  return `\n\n— Generated via AuraPal · Free AI Career Engine\n${SITE_URL}`;
}

export const REFERRAL_SITE_URL = SITE_URL;
