import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ResumeBuilder from "@/pages/ResumeBuilder";
import SeoArticleGenerator from "@/pages/SeoArticleGenerator";
import BusinessPlan from "@/pages/BusinessPlan";
import SideHustle from "@/pages/SideHustle";
import LinkedInRoaster from "@/pages/LinkedInRoaster";
import ResumeRoast from "@/pages/ResumeRoast";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/seo-article-generator" element={<SeoArticleGenerator />} />
              <Route path="/business-plan" element={<BusinessPlan />} />
              <Route path="/side-hustle-ideas" element={<SideHustle />} />
              <Route path="/linkedin-roaster" element={<LinkedInRoaster />} />
              <Route path="/resume-roast" element={<ResumeRoast />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
