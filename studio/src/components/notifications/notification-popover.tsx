'use client';

import { useState, useEffect } from 'react';
import { Bell, Bot, CheckSquare, Briefcase, User, HardDrive, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'AI': return <Bot className="h-5 w-5 text-primary" />;
        case 'Task': return <CheckSquare className="h-5 w-5 text-green-500" />;
        case 'Lead': return <User className="h-5 w-5 text-blue-500" />;
        case 'Deal': return <Briefcase className="h-5 w-5 text-purple-500" />;
        case 'System': return <HardDrive className="h-5 w-5 text-gray-500" />;
        default: return <Bell className="h-5 w-5" />;
    }
};

export default function NotificationPopover() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const loadNotifications = async () => {
        const data = await fetchNotifications(user?.id);
        setNotifications(data);
    };

    useEffect(() => {
        loadNotifications();
        // Optional: Poll for new notifications every minute
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

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

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <div className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                            {unreadCount}
                        </div>
                    )}
                    <span className="sr-only">Open notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 sm:w-96 p-0">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold font-headline">Notifications</h3>
                    <Button variant="link" size="sm" className="text-primary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                        Mark all as read
                    </Button>
                </div>
                <ScrollArea className="h-96">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={cn("p-3 flex items-start gap-3 hover:bg-muted/50 cursor-pointer", !notification.isRead && "bg-blue-500/5")}
                                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                                >
                                    {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-2" />}
                                    <div className={cn("shrink-0", notification.isRead && "ml-4")}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            <Bell className="mx-auto h-8 w-8 mb-2" />
                            You have no new notifications.
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="link" size="sm" asChild>
                        <Link href="/notifications">View all notifications</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
