import {
  LayoutDashboard, FileText, PenLine, Briefcase, Lightbulb, MessageSquareWarning, FlameKindling, Settings, Crown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const tools = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Resume Builder", url: "/resume-builder", icon: FileText },
  { title: "SEO Article", url: "/seo-article-generator", icon: PenLine },
  { title: "Business Plan", url: "/business-plan", icon: Briefcase },
  { title: "Side Hustle", url: "/side-hustle-ideas", icon: Lightbulb },
  { title: "LinkedIn Roaster", url: "/linkedin-roaster", icon: MessageSquareWarning },
  { title: "Resume Roast", url: "/resume-roast", icon: FlameKindling },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-lg shrink-0">
            A
          </div>
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
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
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
                  <NavLink to="/settings" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                    <Settings className="h-4 w-4 mr-2 shrink-0" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <div className="mx-3 mb-3 p-4 rounded-xl glass-card gradient-border">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Go Premium</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Unlimited AI generations, priority support, and advanced analytics.</p>
            <button className="w-full py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
