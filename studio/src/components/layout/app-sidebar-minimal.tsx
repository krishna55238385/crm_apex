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
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function AppSidebarMinimal() {
    const pathname = usePathname();
    const { hasRole } = useAuth();

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/inbox", icon: Mail, label: "Inbox" },
        { href: "/leads", icon: Users, label: "Leads" },
        { href: "/pipeline", icon: Kanban, label: "Pipeline" },
        { href: "/tasks", icon: CheckSquare, label: "Tasks" },
        { href: "/notifications", icon: BellRing, label: "Notifications" },
        { href: "/analytics", icon: LineChart, label: "Analytics", roles: ['admin', 'super_admin'] },
        { href: "/settings", icon: Settings, label: "Settings", roles: ['admin', 'super_admin'] },
    ];

    return (
        <Sidebar side="left" collapsible="icon" className="border-r border-border bg-background">
            <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/10">
                <Link href="/dashboard" className="flex items-center justify-center text-primary hover:opacity-80 transition-opacity">
                    <Bot className="h-8 w-8" />
                </Link>
            </SidebarHeader>

            <SidebarContent className="py-6">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2 flex flex-col items-center">
                            {navItems.map((item) => {
                                if (item.roles && !hasRole(item.roles as any)) return null;
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.label}
                                            className={cn(
                                                "h-10 w-10 justify-center rounded-xl transition-all duration-200",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-5 w-5" />
                                                <span className="sr-only">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 flex justify-center">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    AI
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
