"use client"

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useState, useEffect } from "react";
import NotificationPopover from '@/components/notifications/notification-popover';

export default function AppHeader() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Initial set
    setTime(new Date().toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));

    const interval = setInterval(() => {
      setTime(new Date().toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads, deals, contacts..."
            className="w-full bg-background pl-10"
          />
        </div>
        <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground tabular-nums">
          {time}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationPopover />
        <UserNav />
      </div>
    </header>
  );
}
