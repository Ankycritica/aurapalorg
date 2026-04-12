import {
  LayoutDashboard, FileText, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, Settings, Crown, CreditCard, Mail, MessageCircle, ShieldCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAIL = "dongare.ankit29@gmail.com";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const tools = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Resume Builder", url: "/resume-builder", icon: FileText },
  { title: "Cover Letter", url: "/cover-letter", icon: Mail },
  { title: "Interview Prep", url: "/interview-prep", icon: MessageCircle },
  { title: "SEO Article", url: "/seo-article-generator", icon: PenLine },
  { title: "Business Plan", url: "/business-plan", icon: Briefcase },
  { title: "Side Hustle", url: "/side-hustle-ideas", icon: Lightbulb },
  { title: "LinkedIn Roaster", url: "/linkedin-roaster", icon: MessageSquareWarning },
  { title: "Resume Roast", url: "/resume-roast", icon: FlameKindling },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, user } = useAuth();
  const isPaid = profile?.plan === "pro" || profile?.plan === "premium";
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3">
          <img src="/logo.png" alt="AuraPal" className="h-9 w-9 rounded-xl object-contain shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-none">AuraPal</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Career Engine</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/dashboard"} className="hover:bg-sidebar-accent/50 transition-colors duration-200" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium" onClick={onNavigate}>
                      <item.icon className="h-4 w-4 mr-2 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/pricing" className="hover:bg-sidebar-accent/50 transition-colors duration-200" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium" onClick={onNavigate}>
                    <CreditCard className="h-4 w-4 mr-2 shrink-0" />
                    {!collapsed && <span>Pricing</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className="hover:bg-sidebar-accent/50 transition-colors duration-200" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium" onClick={onNavigate}>
                    <Settings className="h-4 w-4 mr-2 shrink-0" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className="hover:bg-sidebar-accent/50 transition-colors duration-200" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium" onClick={onNavigate}>
                      <ShieldCheck className="h-4 w-4 mr-2 shrink-0" />
                      {!collapsed && <span>Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && !isPaid && (
          <div className="mx-3 mb-3 p-4 rounded-xl glass-card gradient-border">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Go Premium</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Unlimited AI generations, priority support, and advanced analytics.</p>
            <NavLink to="/pricing" className="w-full py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-[0.98] block text-center" onClick={onNavigate}>
              Upgrade Now
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
