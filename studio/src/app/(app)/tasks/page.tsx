'use client';

import { useState, useEffect } from 'react';
import { fetchTasks } from "@/lib/api";
import TaskList from "@/components/tasks/task-list";
import type { Task, TaskStatus } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Zap } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTasks();
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Tasks data is not an array:", data);
          setTasks([]);
        }
      } catch (error) {
        console.error("Failed to load tasks", error);
        // Might want to adding toast error handling here
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

  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const focusTasks = (groupedTasks['Focus Now'] || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const todayTasks = (groupedTasks['Today'] || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const upcomingTasks = (groupedTasks['Upcoming'] || []);
  const overdueTasks = (groupedTasks['Overdue'] || []);
  const completedTasks = (groupedTasks['Completed'] || []);

  const highValueTasks = tasks.filter(t => t.intent === 'High-value deal').length;
  // Estimate: 15 mins per non-completed task? The previous code used 0.25 (15 mins)
  const totalHours = tasks.filter(t => t.status !== 'Completed').length * 0.25;


  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Tasks Command Center</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-primary" />
            <span><span className="font-bold text-foreground">{focusTasks.length + todayTasks.length}</span> tasks today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span>~{totalHours.toFixed(1)}h estimated</span>
          </div>
          {highValueTasks > 0 &&
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              <span><span className="font-bold text-foreground">{highValueTasks}</span> linked to high-value deals</span>
            </div>
          }
        </div>
      </div>

      <Tabs defaultValue="focus" className="flex-grow flex flex-col">
        <TabsList className="w-full sm:w-auto self-start">
          <TabsTrigger value="focus">
            Focus Now
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{focusTasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="today">
            Today
            <Badge variant="secondary" className="ml-2">{todayTasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            <Badge variant="secondary" className="ml-2">{upcomingTasks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-700">{overdueTasks.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="focus" className="flex-grow mt-4">
          <TaskList tasks={focusTasks} />
        </TabsContent>
        <TabsContent value="today" className="flex-grow mt-4">
          <TaskList tasks={todayTasks} />
        </TabsContent>
        <TabsContent value="upcoming" className="flex-grow mt-4">
          <TaskList tasks={upcomingTasks} />
        </TabsContent>
        <TabsContent value="overdue" className="flex-grow mt-4">
          <TaskList tasks={overdueTasks} />
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="completed">
          <AccordionTrigger className="text-base font-medium">
            Completed ({completedTasks.length})
          </AccordionTrigger>
          <AccordionContent>
            <TaskList tasks={completedTasks} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
