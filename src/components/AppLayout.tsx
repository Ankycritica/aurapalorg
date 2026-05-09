import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { UsageBadge } from "@/components/UsageBadge";
import { TrialBanner } from "@/components/TrialBanner";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, CreditCard, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "@/components/AuroraBackground";
import { AnimatePresence, motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

export function AppLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = (profile?.display_name || user?.email || "U").slice(0, 1).toUpperCase();

  const handleNavigate = () => setSidebarOpen(false);

  const location = useLocation();

  return (
    <SidebarProvider>
      <AuroraBackground />
      <div className="min-h-screen flex w-full relative">
        {/* Desktop sidebar */}
        {!isMobile && <AppSidebar />}

        {/* Mobile sidebar in Sheet */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border">
              <AppSidebar onNavigate={handleNavigate} mobile />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between px-4 backdrop-blur-xl bg-background/60 sticky top-0 z-30 hairline-bottom">
            <div className="flex items-center gap-3">
              {isMobile ? (
                <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              ) : (
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              )}
              <span className="font-display font-bold text-foreground text-sm md:hidden">AuraPal</span>
            </div>
            <div className="flex items-center gap-3">
              <UsageBadge />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-[0_0_0_2px_hsl(var(--background)),0_4px_18px_-4px_hsl(var(--primary)/0.5)] hover:scale-[1.05] active:scale-[0.96] transition-transform duration-200">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/pricing")}>
                    <CreditCard className="h-4 w-4 mr-2" /> Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto mb-4"><TrialBanner /></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.32, ease: easeOutExpo }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
