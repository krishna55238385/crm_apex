
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from 'date-fns';

interface TasksListProps {
  tasks: Task[];
}

export default function TasksList({ tasks }: TasksListProps) {
  const activeTasks = tasks.filter(t => !t.completed).sort((a,b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="space-y-3">
      {activeTasks.slice(0, 5).map((task) => (
        <div key={task.id} className="flex items-center gap-3 group">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-colors">
            <Check className="h-4 w-4 text-transparent group-hover:text-primary transition-colors" />
          </Button>
          <div className="flex-grow grid gap-0.5">
            <p className="text-sm font-medium leading-none">
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Due {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
            </p>
          </div>
           {task.priority && task.priority > 80 && (
                <div className="w-2 h-2 rounded-full bg-accent" title="High Priority"></div>
            )}
        </div>
      ))}
       {activeTasks.length === 0 && (
        <div className="text-center py-8">
            <Check className="mx-auto h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground mt-2">All tasks cleared!</p>
        </div>
      )}
    </div>
  );
}
