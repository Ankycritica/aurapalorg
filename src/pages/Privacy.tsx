import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="font-display text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-secondary-foreground">
          <p><strong>Last updated:</strong> April 10, 2025</p>

          <h2 className="font-display text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Account information:</strong> Email address, name, and profile picture when you sign up via email or Google/Apple OAuth.</li>
            <li><strong>Usage data:</strong> Which tools you use, frequency of use, and generation counts.</li>
            <li><strong>Content data:</strong> Resume content, job descriptions, and other text you submit to our AI tools for processing. This data is used solely to generate your requested outputs.</li>
            <li><strong>Payment information:</strong> Processed securely by Stripe. We do not store credit card numbers.</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and improve our AI-powered career tools</li>
            <li>To manage your account and subscription</li>
            <li>To track usage for rate limiting purposes</li>
            <li>To communicate important service updates</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground">3. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Supabase:</strong> Authentication and database hosting</li>
            <li><strong>AI Providers (Google, OpenAI):</strong> Content generation — your inputs are sent to AI models for processing</li>
            <li><strong>Stripe:</strong> Payment processing</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground">4. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can request deletion of your account and associated data at any time by contacting us.</p>

          <h2 className="font-display text-lg font-semibold text-foreground">5. Your Rights</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Access, correct, or delete your personal data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of non-essential communications</li>
            <li>Request account deletion</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground">6. Security</h2>
          <p>We implement industry-standard security measures including encryption in transit and at rest, secure authentication, and regular security audits.</p>

          <h2 className="font-display text-lg font-semibold text-foreground">7. Contact</h2>
          <p>For privacy-related inquiries, contact us at <a href="mailto:contact@aurapal.org" className="text-primary hover:underline">contact@aurapal.org</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
