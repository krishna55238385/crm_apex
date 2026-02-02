"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AnalyticsLiveUpdater() {
    const router = useRouter();
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIsRefreshing(true);
            router.refresh();
            setLastUpdated(new Date());
            setTimeout(() => setIsRefreshing(false), 1000); // Visual delay
        }, 15000); // Refresh every 15 seconds

        return () => clearInterval(intervalId);
    }, [router]);

    const handleManualRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setLastUpdated(new Date());
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("bg-background transition-colors duration-500", isRefreshing ? "border-green-500 text-green-600" : "text-muted-foreground")}>
                <span className={cn("w-2 h-2 rounded-full mr-2", isRefreshing ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                {isRefreshing ? "Live Updating..." : "Live Connection Active"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleManualRefresh} title="Force Refresh">
                <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            </Button>
        </div>
    );
}
