import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleName } from "@/config/rbac";
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  Database,
  Bot,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
  Settings,
  HardHat,
  ClipboardCheck,
  Wrench,
  Eye,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation: { name: string; href: string; icon: any; description: string; module?: ModuleName }[] = [
  { name: "Mission Control", href: "/", icon: LayoutDashboard, description: "Executive Dashboard", module: 'dashboard' },
  { name: "Handover", href: "/handover", icon: ClipboardCheck, description: "Commissioning", module: 'handover' },
  { name: "7D Asset Registry", href: "/assets", icon: Database, description: "O&M Assets", module: 'assets' },
  { name: "CV Analytics", href: "/cv-analytics", icon: Eye, description: "Computer Vision", module: 'ai_cv' },
  { name: "AI Intelligence", href: "/ai-lab", icon: Bot, description: "RAG Chatbot", module: 'ai_cv' },
];

const departmentsNav: { name: string; href: string; icon: any; description: string; module?: ModuleName }[] = [
  { name: "Design", href: "/design-control", icon: FileText, description: "Deliverables & RFIs", module: 'design' },
  { name: "Clinical", href: "/clinical", icon: Stethoscope, description: "Design Sign-offs", module: 'clinical' },
  { name: "Construction", href: "/construction", icon: HardHat, description: "Site Execution", module: 'construction' },
  { name: "Sourcing Hub", href: "/sourcing", icon: Users, description: "Vendor Management", module: 'sourcing' },
  { name: "Operations & Maintenance", href: "/operations", icon: Wrench, description: "FM & Helpdesk", module: 'assets' },
];

const secondaryNav: { name: string; href: string; icon: any; module?: ModuleName }[] = [
  { name: "Data Hub", href: "/data-hub", icon: Cloud, module: 'admin' },
  { name: "Audit Trail", href: "/audit", icon: FileText, module: 'construction' },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission } = useAuth();

  const filterNav = (items: typeof navigation) => {
    return items.filter(item => !item.module || hasPermission(item.module, 'view'));
  };

  const filteredNavigation = filterNav(navigation);
  const filteredDepartments = filterNav(departmentsNav);
  const filteredSecondary = filterNav(secondaryNav);

  const renderNavItem = (item: any) => {
    const isActive = location.pathname === item.href;
    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group",
          isActive
            ? "bg-sidebar-primary/20 text-sidebar-primary shadow-glow"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
        )}
      >
        <item.icon
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
            isActive && "text-sidebar-primary"
          )}
        />
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-sidebar-foreground/50">
              {item.description}
            </p>
          </div>
        )}
        {isActive && !collapsed && (
          <div className="ml-auto w-1.5 h-8 rounded-full bg-sidebar-primary animate-pulse-glow" />
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        "gradient-dark flex flex-col h-screen transition-all duration-300 ease-in-out border-r border-sidebar-border",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-sidebar-foreground text-gradient-primary">
                Adani Health
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Parivartaan Nerve Centre
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          {!collapsed && filteredNavigation.length > 0 && (
            <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
              Modules
            </p>
          )}
          {filteredNavigation.map(renderNavItem)}
        </div>

        <div className="mb-4">
          {!collapsed && filteredDepartments.length > 0 && (
            <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
              Departments
            </p>
          )}
          {filteredDepartments.map(renderNavItem)}
        </div>

        {/* Secondary Nav */}
        <div className="pt-4 border-t border-sidebar-border">
          {!collapsed && filteredSecondary.length > 0 && (
            <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
              System
            </p>
          )}
          {filteredSecondary.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent/20 text-sidebar-accent"
                    : "text-sidebar-foreground/50 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground/70"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm animate-fade-in">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Integration Status */}
      {/* Integration Status - Removed Mock Data */}
      {!collapsed && (
        <div className="p-4 mx-3 mb-3 rounded-lg bg-sidebar-accent/10 border border-sidebar-border animate-fade-in">
          <p className="text-xs font-medium text-sidebar-foreground/60 mb-2">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs text-sidebar-foreground/60">Online</span>
          </div>
        </div>
      )}

      {/* Powered By Logo */}
      {!collapsed && (
        <a
          href="https://www.unoteams.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 mb-4 block transition-transform hover:scale-105 active:scale-95"
        >
          <p className="text-[10px] text-sidebar-foreground/40 mb-1.5 uppercase tracking-widest font-semibold ml-1">Powered By</p>
          <img
            src="/UnoTEAM%20logo%205.png"
            alt="UnoTEAM Software"
            className="w-full h-auto max-h-12 object-contain bg-white/5 rounded-md p-1.5 border border-white/10"
          />
        </a>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
