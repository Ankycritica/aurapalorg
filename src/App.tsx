import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ResumeBuilder from "@/pages/ResumeBuilder";
import SeoArticleGenerator from "@/pages/SeoArticleGenerator";
import BusinessPlan from "@/pages/BusinessPlan";
import SideHustle from "@/pages/SideHustle";
import LinkedInRoaster from "@/pages/LinkedInRoaster";
import ResumeRoast from "@/pages/ResumeRoast";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/seo-article-generator" element={<SeoArticleGenerator />} />
            <Route path="/business-plan" element={<BusinessPlan />} />
            <Route path="/side-hustle-ideas" element={<SideHustle />} />
            <Route path="/linkedin-roaster" element={<LinkedInRoaster />} />
            <Route path="/resume-roast" element={<ResumeRoast />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
