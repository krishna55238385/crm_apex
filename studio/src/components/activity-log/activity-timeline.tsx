"use client";

import type { ActivityLog } from "@/lib/types";
import ActivityItem from "./activity-item";
import { useAuth } from "@/hooks/use-auth";

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

import { format, isToday, isYesterday, parseISO } from "date-fns";

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const { user, hasRole } = useAuth();

  const filteredActivities = activities.filter(activity => {
    if (!user) return false;
    if (hasRole(['admin', 'super_admin'])) {
      return true;
    }
    const actorId = 'id' in activity.actor ? activity.actor.id : null;
    return actorId === user.id;
  });

  // Group by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = parseISO(activity.timestamp);
    let dateLabel = format(date, 'MMMM d, yyyy');

    if (isToday(date)) dateLabel = 'Today';
    else if (isYesterday(date)) dateLabel = 'Yesterday';

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(activity);
    return groups;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <div className="space-y-8 max-w-4xl">
      {Object.entries(groupedActivities).map(([dateLabel, items]) => (
        <div key={dateLabel} className="relative">
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur py-2 mb-4 border-b border-border/40">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{dateLabel}</h3>
          </div>
          <div className="pl-2">
            {items.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === items.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No activity found for the selected filters.
        </div>
      )}
    </div>
  );
}
