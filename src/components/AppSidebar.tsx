
import { AuthStatus } from "./auth/AuthStatus";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  Calculator,
  Users,
  Briefcase,
  Settings,
  Shield,
  Bot,
  Building2,
  Receipt,
  Wrench,
  CreditCard,
  UserCheck,
  BarChart3,
  Camera,
  Clock,
  Lock,
} from "lucide-react";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Projects", url: "/projects", icon: Briefcase },
      { title: "Business Manager", url: "/business-manager", icon: Building2 },
    ],
  },
  {
    title: "Financial",
    items: [
      { title: "Invoices", url: "/invoices", icon: FileText },
      { title: "Quotes", url: "/quotes", icon: Calculator },
      { title: "Expenses", url: "/expenses", icon: Receipt },
      { title: "VAT Settings", url: "/vat-settings", icon: CreditCard },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Site Manager", url: "/site-manager", icon: Camera },
      { title: "Tools", url: "/tools", icon: Wrench },
      { title: "Time Tracking", url: "/business-manager?tab=timesheets", icon: Clock },
      { title: "CRM", url: "/crm", icon: Users },
    ],
  },
  {
    title: "AI & Analytics", 
    items: [
      { title: "AI Agents", url: "/agents", icon: Bot },
      { title: "Advisor", url: "/advisor", icon: BarChart3 },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "HR Management", url: "/hr", icon: UserCheck },
      { title: "Security", url: "/security", icon: Shield },
      { title: "Auth Config", url: "/auth-config", icon: Lock },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold">Construction Suite</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 space-y-3">
        <AuthStatus />
        <div className="text-xs text-muted-foreground">
          Construction Management Suite v2.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
