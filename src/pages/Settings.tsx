import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Account</h2>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">U</div>
          <div>
            <p className="font-medium text-foreground">Free Plan</p>
            <p className="text-sm text-muted-foreground">3 AI generations remaining today</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 gradient-border">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg gradient-text">Upgrade to Premium</h2>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2 mb-4">
          <li>✓ Unlimited AI generations</li>
          <li>✓ Priority support</li>
          <li>✓ Advanced analytics</li>
          <li>✓ Export to PDF/DOCX</li>
          <li>✓ Custom branding</li>
        </ul>
        <button className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
          Upgrade Now — $19/mo
        </button>
      </div>
    </div>
  );
}
