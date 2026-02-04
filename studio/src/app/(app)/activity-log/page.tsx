'use client';

import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { subDays, parseISO } from 'date-fns';
import ActivityFilters from "@/components/activity-log/activity-filters";
import ActivityTimeline from "@/components/activity-log/activity-timeline";
import { fetchActivityLogs, fetchUsers } from "@/lib/api";
import type { ActivityLog } from '@/lib/types';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [actor, setActor] = useState<string>('all');
  const [entity, setEntity] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [logsData, usersData] = await Promise.all([
          fetchActivityLogs(),
          fetchUsers()
        ]);
        setActivities(Array.isArray(logsData) ? logsData : (logsData as any).data || []);
        setUsers(usersData);
      } catch (err) {
        console.error("Failed to data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredActivities = activities.filter((activity: ActivityLog) => {
    const activityDate = parseISO(activity.timestamp);
    const fromDate = date?.from;
    const toDate = date?.to;

    // Date filter
    if (fromDate && activityDate < fromDate) return false;
    if (toDate) {
      const toDateWithEndOfDay = new Date(toDate);
      toDateWithEndOfDay.setHours(23, 59, 59, 999);
      if (activityDate > toDateWithEndOfDay) return false;
    }

    // Actor filter
    const activityActorId = 'id' in activity.actor ? activity.actor.id : 'ai';
    if (actor !== 'all' && activityActorId !== actor) return false;

    // Entity filter
    if (entity !== 'all' && activity.target.type !== entity) return false;

    return true;
  });

  const clearFilters = () => {
    setDate({ from: subDays(new Date(), 7), to: new Date() });
    setActor('all');
    setEntity('all');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">An immutable log of all actions taken in the workspace.</p>
      </div>

      <div className="space-y-6">
        <ActivityFilters
          date={date}
          setDate={setDate}
          actor={actor}
          setActor={setActor}
          entity={entity}
          setEntity={setEntity}
          clearFilters={clearFilters}
          users={users}
        />
        <ActivityTimeline activities={filteredActivities} />
      </div>
    </div>
  );
}
