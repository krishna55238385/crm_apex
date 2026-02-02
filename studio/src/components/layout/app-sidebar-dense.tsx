"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CheckSquare, Kanban, LayoutDashboard, Mail, Settings, Users, BellRing, ClipboardList, History, LineChart, Share2, ChevronRight } from "lucide-react";

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AppSidebarDense() {
    const pathname = usePathname();
    const { hasRole } = useAuth();

    // Mock counts for dense view
    const counts = {
        inbox: 12,
        leads: 145,
        tasks: 5,
        notifications: 3
    };

    const groups = [
        {
            label: "GENERAL",
            items: [
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/inbox", label: "Inbox", icon: Mail, count: counts.inbox },
                { href: "/notifications", label: "Notifications", icon: BellRing, count: counts.notifications },
            ]
        },
        {
            label: "SALES OPS",
            items: [
                { href: "/leads", label: "Leads", icon: Users, count: counts.leads },
                { href: "/pipeline", label: "Pipeline", icon: Kanban },
                { href: "/follow-ups", label: "Follow-ups", icon: BellRing },
            ]
        },
        {
            label: "MANAGEMENT",
            items: [
                { href: "/tasks", label: "Tasks", icon: CheckSquare, count: counts.tasks },
                { href: "/forwarded-leads", label: "Forwarded", icon: Share2 },
                { href: "/attendance", label: "Attendance", icon: ClipboardList, roles: ['admin', 'super_admin'] },
            ]
        },
        {
            label: "ANALYSIS",
            items: [
                { href: "/analytics", label: "Analytics", icon: LineChart, roles: ['admin', 'super_admin'] },
                { href: "/activity-log", label: "Activity Log", icon: History, roles: ['admin', 'super_admin'] },
            ]
        },
        {
            label: "CONFIGURATION",
            items: [
                { href: "/settings", label: "Settings", icon: Settings, roles: ['admin', 'super_admin'] },
            ]
        },
    ];

    return (
        <Sidebar side="left" className="border-r border-sidebar-border bg-sidebar h-full text-sidebar-foreground w-[260px]">
            <SidebarHeader className="h-12 flex items-center px-4 border-b border-sidebar-border/50 bg-sidebar-accent/10">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                    <Bot className="h-5 w-5 text-primary" />
                    <span>ApexAI CRM <span className="text-[10px] text-muted-foreground ml-1">PRO</span></span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="gap-0 py-0">
                {groups.map((group, index) => {
                    const hasVisibleItems = group.items.some(item => !item.roles || hasRole(item.roles as any));
                    if (!hasVisibleItems) return null;

                    return (
                        <div key={group.label}>
                            <SidebarGroup className="py-1">
                                <SidebarGroupLabel className="px-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest h-8 flex items-center">
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
                                                        size="sm"
                                                        className={cn(
                                                            "w-full justify-between h-8 text-xs px-4 border-l-2 border-transparent transition-all rounded-none",
                                                            isActive
                                                                ? "bg-sidebar-accent border-l-primary text-sidebar-accent-foreground font-medium"
                                                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                                                        )}
                                                    >
                                                        <Link href={item.href}>
                                                            <div className="flex items-center gap-2">
                                                                <item.icon className="h-3.5 w-3.5 opacity-70" />
                                                                <span>{item.label}</span>
                                                            </div>
                                                            {item.count && (
                                                                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] rounded-sm min-w-[1.5rem] justify-center bg-sidebar-border text-sidebar-foreground">
                                                                    {item.count}
                                                                </Badge>
                                                            )}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                            {index < groups.length - 1 && <div className="h-px bg-sidebar-border/40 mx-4" />}
                        </div>
                    );
                })}
            </SidebarContent>

            <SidebarFooter className="p-2 border-t border-sidebar-border/50 bg-sidebar-accent/5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground px-2">
                    <span>System Status</span>
                    <span className="flex items-center gap-1.5 before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500 text-emerald-600">
                        Operational
                    </span>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
