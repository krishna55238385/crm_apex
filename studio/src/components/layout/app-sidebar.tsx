"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CheckSquare, Kanban, LayoutDashboard, Mail, Settings, Users, BellRing, ClipboardList, History, LineChart, Share2 } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";



export default function AppSidebar() {
  const pathname = usePathname();
  const { hasRole } = useAuth();

  const groups = [
    {
      label: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/inbox", label: "Inbox", icon: Mail },
        { href: "/notifications", label: "Notifications", icon: BellRing },
      ]
    },
    {
      label: "Pipeline",
      items: [
        { href: "/leads", label: "Leads", icon: Users },
        { href: "/pipeline", label: "Pipeline", icon: Kanban },
        { href: "/follow-ups", label: "Follow-ups", icon: BellRing }, // Using BellRing for follow-ups as well? Maybe ClipboardList or Phone? Let's stick to original or better. Original was BellRing. Let's try Phone or similar if available, or keep BellRing.
      ]
    },
    {
      label: "Work",
      items: [
        { href: "/tasks", label: "Tasks", icon: CheckSquare },
        { href: "/forwarded-leads", label: "Forwarded", icon: Share2 },
        { href: "/attendance", label: "Attendance", icon: ClipboardList, roles: ['admin', 'super_admin'] },
      ]
    },
    {
      label: "Insights",
      items: [
        { href: "/analytics", label: "Analytics", icon: LineChart, roles: ['admin', 'super_admin'] },
        { href: "/activity-log", label: "Activity Log", icon: History, roles: ['admin', 'super_admin'] },
      ]
    },
    {
      label: "System",
      items: [
        { href: "/settings", label: "Settings", icon: Settings, roles: ['admin', 'super_admin'] },
      ]
    },
  ];

  return (
    <Sidebar side="left" collapsible="icon" className="border-r border-sidebar-border bg-sidebar h-full text-sidebar-foreground">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl font-headline tracking-tight text-primary group-data-[collapsible=icon]:justify-center">
          <Bot className="h-8 w-8 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">ApexAI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        {groups.map((group, index) => {
          // Check if user has access to at least one item in the group
          const hasVisibleItems = group.items.some(item => !item.roles || hasRole(item.roles as any));
          if (!hasVisibleItems) return null;

          return (
            <SidebarGroup key={group.label} className="py-2">
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    if (item.roles && !hasRole(item.roles as any)) return null;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            "w-full justify-start gap-3 px-4 py-2 h-auto text-sm font-medium transition-colors mb-0.5 rounded-md",
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span className="text-[10px] text-muted-foreground/50 font-mono group-data-[collapsible=icon]:hidden">
            v1.2.0 • ApexAI
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
