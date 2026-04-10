import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, TrendingUp, RefreshCw, DollarSign, FileText, MessageSquareWarning, Lightbulb, ArrowRight, Check } from "lucide-react";

const goals = [
  { id: "new-job", label: "Find a new job", icon: Briefcase, color: "#00C4EE" },
  { id: "promoted", label: "Get promoted", icon: TrendingUp, color: "#32D583" },
  { id: "switch", label: "Switch careers", icon: RefreshCw, color: "#7C6FF7" },
  { id: "side-income", label: "Grow a side income", icon: DollarSign, color: "#F5C842" },
];

const experienceLevels = ["0-1 years", "1-3 years", "3-7 years", "7+ years"];

const toolRecommendations: Record<string, { title: string; desc: string; url: string; icon: any; color: string }> = {
  "new-job": { title: "Resume Builder", desc: "Create an ATS-optimized resume that gets you interviews.", url: "/resume-builder", icon: FileText, color: "#00C4EE" },
  "promoted": { title: "LinkedIn Roaster", desc: "Get brutally honest feedback to optimize your LinkedIn presence.", url: "/linkedin-roaster", icon: MessageSquareWarning, color: "#F97066" },
  "switch": { title: "Resume Builder", desc: "Reposition your experience for your new target career.", url: "/resume-builder", icon: FileText, color: "#00C4EE" },
  "side-income": { title: "Side Hustle Ideas", desc: "Discover personalized income opportunities based on your skills.", url: "/side-hustle-ideas", icon: Lightbulb, color: "#F5C842" },
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const completeOnboarding = async () => {
    if (user) {
      await supabase.auth.updateUser({
        data: { onboarding_complete: true, goal: selectedGoal, job_title: jobTitle, experience_level: experience },
      });
    }
  };

  const handleGoToDashboard = async () => {
    await completeOnboarding();
    navigate("/dashboard");
  };

  const handleOpenTool = async (url: string) => {
    await completeOnboarding();
    navigate(url);
  };

  const recommendation = toolRecommendations[selectedGoal] || toolRecommendations["new-job"];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step > s ? "bg-primary text-primary-foreground" : step === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center">
                <h1 className="font-display text-2xl md:text-3xl font-bold">What's your main goal?</h1>
                <p className="text-muted-foreground mt-2">This helps us personalize your experience.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button key={goal.id} onClick={() => { setSelectedGoal(goal.id); setStep(2); }}
                    className={`glass-card p-5 text-left hover:border-primary/50 transition-all group ${selectedGoal === goal.id ? "border-primary" : ""}`}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${goal.color}15` }}>
                      <goal.icon className="h-5 w-5" style={{ color: goal.color }} />
                    </div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{goal.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center">
                <h1 className="font-display text-2xl md:text-3xl font-bold">Tell us about you</h1>
                <p className="text-muted-foreground mt-2">Just a couple quick details.</p>
              </div>
              <div className="glass-card p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Current Job Title</label>
                  <input type="text" placeholder="e.g. Marketing Manager" value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Years of Experience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {experienceLevels.map((lvl) => (
                      <button key={lvl} onClick={() => setExperience(lvl)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          experience === lvl ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 text-foreground border-border/50 hover:border-primary/50"
                        }`}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(3)} disabled={!jobTitle.trim() || !experience}
                  className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center">
                <h1 className="font-display text-2xl md:text-3xl font-bold">Your first tool is ready! 🎉</h1>
                <p className="text-muted-foreground mt-2">Based on your goal, we recommend starting here.</p>
              </div>
              <div className="glass-card p-6 text-center" style={{ borderTop: `3px solid ${recommendation.color}` }}>
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${recommendation.color}15` }}>
                  <recommendation.icon className="h-7 w-7" style={{ color: recommendation.color }} />
                </div>
                <h2 className="font-display text-xl font-bold mb-2">{recommendation.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">{recommendation.desc}</p>
                <button onClick={() => handleOpenTool(recommendation.url)}
                  className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  Open {recommendation.title} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <button onClick={handleGoToDashboard}
                className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
                Skip to dashboard →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
