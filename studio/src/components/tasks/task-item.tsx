
"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Sparkles,
  ChevronDown,
  Briefcase,
  Calendar,
  Contact,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, formatDistanceToNowStrict } from "date-fns";

interface TaskItemProps {
  task: Task;
}

const getIntentIcon = (intent: Task["intent"]) => {
  const props = {className: "h-4 w-4"};
  switch (intent) {
    case "High-value deal":
      return <Sparkles {...props} />;
    case "Deal at risk":
      return <Zap {...props} />;
    case "No reply in 3 days":
      return <Clock {...props} />;
    default:
      return <Info {...props} />;
  }
};

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Overdue":
      return "text-amber-600 font-semibold";
    case "Focus Now":
        return "text-primary font-semibold";
    default:
      return "";
  }
};

function formatDueDate(dateString: string) {
    const date = parseISO(dateString);
    return formatDistanceToNowStrict(date, { addSuffix: true });
}


export default function TaskItem({ task }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  const priorityColor = task.priority ? `hsl(225, 100%, ${100 - ((task.priority || 0) / 100 * 40)}%)` : 'hsl(var(--border))';

  return (
    <Collapsible
      className={cn(
        "rounded-lg border bg-card text-card-foreground transition-all duration-300",
        isCompleted && "bg-muted/50 text-muted-foreground"
      )}
    >
      <div className="flex items-center p-3 sm:p-4 gap-3">
        <div className="flex items-center gap-3 flex-grow">
          <div style={{ background: priorityColor }} className="w-1.5 h-12 rounded-full self-stretch" title={`Priority: ${task.priority}`}></div>
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => setIsCompleted(!isCompleted)}
            className="hidden sm:flex"
            id={`task-${task.id}`}
          />
          
          <CollapsibleTrigger asChild className="cursor-pointer flex-grow">
            <div className="grid gap-0.5">
              <label htmlFor={`task-${task.id}`} className={cn("font-semibold", isCompleted && "line-through")}>
                {task.title}
              </label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {(task.relatedLead || task.relatedDeal?.lead) &&
                    <div className="flex items-center gap-1.5">
                        <Contact className="h-3 w-3"/>
                        <span>{task.relatedLead?.name || task.relatedDeal?.lead.name} • {task.relatedLead?.company || task.relatedDeal?.lead.company}</span>
                    </div>
                }
                {task.relatedDeal && 
                    <div className="hidden md:flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        <span>{task.relatedDeal.stage}</span>
                    </div>
                }
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3"/>
                    <span className={cn(getStatusColor(task.status))}>
                        Due {formatDueDate(task.dueDate)}
                    </span>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto pl-2">
           {task.priority && task.priority > 80 && (
             <Badge variant="outline" className="border-yellow-400/50 text-yellow-600 bg-yellow-500/10 hidden lg:flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex"><Phone className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex"><Mail className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex"><Clock className="h-4 w-4" /></Button>
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => setIsCompleted(!isCompleted)}
            className="sm:hidden flex"
            id={`task-mobile-${task.id}`}
          />
           <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-muted">
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180"/>
                </Button>
           </CollapsibleTrigger>
        </div>
      </div>
      {(task.aiReason || task.intent) && (
      <CollapsibleContent>
        <div className="border-t p-4 space-y-4 bg-muted/30">
            {task.intent &&
             <div className="p-3 rounded-md border bg-background/50 border-primary/20">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
                    {getIntentIcon(task.intent)} AI Intent
                </h4>
                {task.aiReason && 
                    <div className="text-sm bg-primary/10 p-2 rounded-md italic">
                        "{task.aiReason}"
                    </div>
                }
             </div>
            }
        </div>
      </CollapsibleContent>
      )}
    </Collapsible>
  );
}

    