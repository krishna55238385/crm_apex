"use client";

import type { ActivityLog, ActivityAction, ActivityEntityType } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bot,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Edit,
  Trash,
  ArrowRightLeft,
  CheckCircle,
  Briefcase,
  Settings,
  Shield,
  History,
  ChevronDown,
  Sparkles,
  Info
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  activity: ActivityLog;
  isLast: boolean;
}

const getActionIcon = (action: ActivityAction) => {
  const props = { className: "h-4 w-4 text-muted-foreground" };
  switch (action) {
    case 'CREATE': return <UserPlus {...props} />;
    case 'UPDATE': return <Edit {...props} />;
    case 'DELETE': return <Trash {...props} />;
    case 'ASSIGN': return <ArrowRightLeft {...props} />;
    case 'LOGIN': return <LogIn {...props} />;
    case 'LOGOUT': return <LogOut {...props} />;
    case 'CHECK_IN': return <LogIn {...props} />;
    case 'CHECK_OUT': return <LogOut {...props} />;
    case 'COMPLETE': return <CheckCircle {...props} />;
    case 'EXECUTE': return <Sparkles {...props} />;
    case 'OVERRIDE': return <History {...props} />;
    default: return <Info {...props} />;
  }
};

const getEntityIcon = (entityType: ActivityEntityType) => {
  const props = { className: "h-3 w-3" };
  switch (entityType) {
    case 'Lead': return <User {...props} />;
    case 'Deal': return <Briefcase {...props} />;
    case 'Task': return <CheckCircle {...props} />;
    case 'FollowUp': return <History {...props} />;
    case 'User': return <User {...props} />;
    case 'Setting': return <Settings {...props} />;
    case 'Role': return <Shield {...props} />;
    default: return <Info {...props} />;
  }
};

export default function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const { actor, action, target, summary, timestamp, source, details } = activity;
  const isAi = 'role' in actor && actor.role === 'AI';

  // Parse date
  const dateObj = parseISO(timestamp);
  const timeStr = format(dateObj, "h:mm a");

  return (
    <Collapsible>
      <div className="relative group">
        {/* Connector Line */}
        {!isLast && (
          <div className="absolute left-[0.93rem] top-8 bottom-[-2rem] w-0.5 bg-border/40 group-hover:bg-border/60 transition-colors" />
        )}

        <div className="flex items-start gap-4">
          {/* Icon/Avatar Bubble */}
          <div className="relative z-10 flex-shrink-0 mt-0.5">
            <div className="absolute -left-2 -top-2 w-12 h-12 bg-background rounded-full -z-10" /> {/* Mask for line intersection */}
            {isAi ? (
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-background ring-2 ring-yellow-50 shadow-sm">
                <Bot className="h-4 w-4 text-yellow-600" />
              </div>
            ) : (
              <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-muted shadow-sm">
                <AvatarImage src={'avatarUrl' in actor ? actor.avatarUrl : ''} alt={actor.name} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{actor.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border">
              {getActionIcon(action)}
            </div>
          </div>

          {/* Content Card */}
          <div className="flex-grow pb-8 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-foreground/90">
                  <span className="font-semibold text-foreground">{actor.name}</span> <span className="text-muted-foreground">{summary}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{timeStr}</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/40 bg-background/50">
                    {getEntityIcon(target.type)}
                    <span className="font-medium">{target.type}: {target.name}</span>
                  </div>
                </div>
              </div>
              <Badge variant={source === 'AI' ? "default" : "secondary"} className={cn("text-[10px] h-5 px-2 tracking-wide font-normal", source === 'AI' ? 'bg-yellow-400/20 text-yellow-700 hover:bg-yellow-400/30' : 'text-muted-foreground')}>
                {source}
              </Badge>
            </div>

            {details && (
              <CollapsibleTrigger className="mt-2 text-xs font-medium text-primary/80 hover:text-primary flex items-center gap-1 transition-colors">
                Show Details <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
            )}

            <CollapsibleContent className="mt-3">
              <div className="bg-muted/30 rounded-md p-3 text-xs space-y-1.5 border border-border/50">
                {details?.before && details?.after && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Change</span>
                    <span className="line-through opacity-70">{details.before}</span>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium bg-green-500/10 text-green-700 px-1 rounded">{details.after}</span>
                  </div>
                )}
                {details?.reason && (
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="italic text-muted-foreground">"{details.reason}"</p>
                  </div>
                )}
                {details?.confidence && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Confidence</span>
                    <span>{details.confidence}%</span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </div>
    </Collapsible>
  );
}
