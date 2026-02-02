'use client';

import { useState, useEffect } from 'react';
import { fetchFollowUps, fetchTasks } from "@/lib/api";
import type { FollowUp, Task, FollowUpStatus } from "@/lib/types";
import { isToday, isPast, isFuture } from 'date-fns';
import FollowUpPageClient from "@/components/follow-ups/follow-up-page-client";

function getStatus(dueDate: string, completed: boolean): FollowUpStatus {
    if (completed) return 'Completed';
    const date = new Date(dueDate);
    if (isToday(date)) return 'Due';
    if (isPast(date)) return 'Overdue';
    return 'Upcoming';
}

export default function FollowUpsPage() {
    const [sortedItems, setSortedItems] = useState<FollowUp[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [followUpsData, tasksData] = await Promise.all([fetchFollowUps(), fetchTasks()]);

                // Unify tasks and follow-ups into a single format
                const allItems: FollowUp[] = [
                    ...(Array.isArray(followUpsData) ? followUpsData : []),
                    ...(Array.isArray(tasksData) ? tasksData : []).map((task): FollowUp => ({
                        id: `task-${task.id}`,
                        title: task.title,
                        lead: (task as any).lead || null,
                        deal: task.relatedDeal,
                        dueDate: task.dueDate,
                        priorityScore: 30, // Lower default priority for manual tasks
                        status: getStatus(task.dueDate, task.completed),
                        isAiGenerated: false,
                        lastInteractionSummary: 'Manually created task',
                        actionType: 'Task',
                    })),
                ];

                // Sort all items by priority score (descending)
                const sorted = allItems.sort((a, b) => b.priorityScore - a.priorityScore);
                setSortedItems(sorted);
            } catch (error) {
                console.error("Failed to load follow-ups data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <FollowUpPageClient initialItems={sortedItems} />
    );
}
