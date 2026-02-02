'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Bot, CheckSquare, Briefcase, User, HardDrive, Check, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'AI': return <Bot className="h-6 w-6 text-primary" />;
    case 'Task': return <CheckSquare className="h-6 w-6 text-green-500" />;
    case 'Lead': return <User className="h-6 w-6 text-blue-500" />;
    case 'Deal': return <Briefcase className="h-6 w-6 text-purple-500" />;
    case 'System': return <HardDrive className="h-6 w-6 text-gray-500" />;
    default: return <Bell className="h-6 w-6" />;
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications(user?.id);
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your latest activities.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} Unread</Badge>}
          <Button onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <Dialog key={notification.id}>
                <DialogTrigger asChild>
                  <div
                    className={cn(
                      "p-4 md:p-6 flex items-start gap-4 transition-colors hover:bg-muted/50 cursor-pointer",
                      !notification.isRead ? "bg-blue-500/5" : ""
                    )}
                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                  >
                    <div className={cn("p-2 rounded-full bg-background border shadow-sm", !notification.isRead && "ring-2 ring-primary ring-offset-2")}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-grow min-w-0 text-left">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={cn("text-base font-semibold truncate pr-2", !notification.isRead && "text-primary")}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {format(new Date(notification.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 pb-1 line-clamp-2 text-left">{notification.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <div className="shrink-0 self-center">
                        <div className="h-3 w-3 rounded-full bg-primary" title="Unread" />
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <DialogTitle>{notification.title}</DialogTitle>
                        <DialogDescription>{format(new Date(notification.timestamp), "PPP 'at' p")}</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {notification.description}
                    </div>

                    {/* Context Actions based on Type */}
                    {notification.type === 'Lead' && (
                      <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
                        Tip: Check the Leads tab for more details.
                      </div>
                    )}
                  </div>
                  <DialogFooter className="sm:justify-end">
                    <Button variant="secondary" onClick={() => handleMarkAsRead(notification.id, notification.isRead)}>
                      {notification.isRead ? 'Close' : 'Mark as Read'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">All caught up!</h3>
              <p>You have no new notifications.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
