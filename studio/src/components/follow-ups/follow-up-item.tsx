import { useState } from "react";
import type { FollowUp } from "@/lib/types";
import { useRouter } from "next/navigation";
import { updateFollowUp } from "@/lib/api";
import { addDays, addHours, format, parseISO } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Sparkles,
  Bot,
  ChevronDown,
  Briefcase,
  Calendar,
  Contact,
  DollarSign,
  Info,
  CalendarDays,
  CalendarClock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpItemProps {
  item: FollowUp;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const getActionIcon = (actionType: FollowUp["actionType"]) => {
  switch (actionType) {
    case "Email":
      return <Mail className="h-4 w-4" />;
    case "Call":
      return <Phone className="h-4 w-4" />;
    case "WhatsApp":
      return <MessageSquare className="h-4 w-4" />;
    case "Task":
      return <Briefcase className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}


export default function FollowUpItem({ item, selectionMode, isSelected, onToggleSelect }: FollowUpItemProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(item.status === 'Completed');
  const [loading, setLoading] = useState(false);

  // ... (existing code)

  const handleCheckboxChange = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect();
    } else {
      handleStatusChange();
    }
  };

  const priorityColor = `hsl(225, 100%, ${100 - (item.priorityScore / 100 * 40)}%)`;

  const handleStatusChange = async () => {
    const newStatus = !isCompleted ? 'Completed' : 'Due'; // Simple toggle logic
    setIsCompleted(!isCompleted);
    try {
      await updateFollowUp(item.id, { status: newStatus });
      router.refresh();
    } catch (error) {
      console.error("Failed to update status", error);
      setIsCompleted(isCompleted); // Revert on error
    }
  };

  // ... (rest of methods)

  // In return statement:
  /*
          <Checkbox
            checked={selectionMode ? isSelected : isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="hidden sm:flex"
          />
  */


  const handleSnooze = async (hours: number, days: number) => {
    setLoading(true);
    try {
      let newDate = new Date();
      if (hours > 0) newDate = addHours(newDate, hours);
      if (days > 0) newDate = addDays(newDate, days);

      await updateFollowUp(item.id, {
        dueDate: newDate.toISOString(),
        status: 'Upcoming' // Reset status to upcoming if snoozed
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to snooze", error);
      alert("Failed to reschedule");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (item.lead?.phone) {
      window.location.href = `tel:${item.lead.phone}`;
    } else {
      alert("No phone number available for this lead.");
    }
  };

  const handleEmail = () => {
    if (item.lead?.email) {
      window.location.href = `mailto:${item.lead.email}`;
    } else {
      alert("No email address available for this lead.");
    }
  };

  const handleMessage = () => {
    if (item.lead?.phone) {
      // Rudimentary SMS link, implies mobile usage
      window.location.href = `sms:${item.lead.phone}`;
    } else {
      alert("No phone number available for this lead.");
    }
  };

  return (
    <Collapsible
      className={cn(
        "rounded-lg border bg-card text-card-foreground transition-all duration-300",
        isCompleted && "bg-muted/50 text-muted-foreground",
        loading && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center p-3 sm:p-4 gap-3">
        <div className="flex items-center gap-3 flex-grow">
          <div style={{ background: priorityColor }} className="w-1.5 h-12 rounded-full self-stretch" title={`Priority: ${item.priorityScore}`}></div>
          <Checkbox
            checked={selectionMode ? isSelected : isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="hidden sm:flex"
          />
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/20">
            {getActionIcon(item.actionType)}
          </div>

          <CollapsibleTrigger asChild className="cursor-pointer flex-grow hover:bg-muted/30 p-2 rounded-md -ml-2 transition-colors">
            <div className="grid gap-0.5 ml-2">
              <p className={cn("font-semibold text-sm sm:text-base", isCompleted && "line-through decoration-muted-foreground/50")}>
                {item.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Contact className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{item.lead?.name || 'Unknown Lead'}</span>
                  {item.lead?.company && <span className="hidden sm:inline opacity-70">• {item.lead.company}</span>}
                </div>
                {item.deal &&
                  <div className="hidden md:flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3" />
                    <span>{item.deal.name} ({formatCurrency(item.deal.value)})</span>
                  </div>
                }
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span className={cn(item.status === 'Overdue' && !isCompleted && "text-amber-600 font-bold")}>
                    {item.dueDate ? format(parseISO(item.dueDate), "MMM d, h:mm a") : 'No Date'}
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto pl-2">
          {item.isAiGenerated && (
            <Badge variant="outline" className="border-yellow-400/50 text-yellow-500 hidden lg:flex items-center gap-1 bg-yellow-400/5">
              <Sparkles className="h-3 w-3 text-yellow-500" /> AI
            </Badge>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex hover:text-green-600 hover:bg-green-50" onClick={handleCall} title="Call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex hover:text-blue-600 hover:bg-blue-50" onClick={handleEmail} title="Email">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex hover:text-indigo-600 hover:bg-indigo-50" onClick={handleMessage} title="Message">
            <MessageSquare className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-600 hover:bg-orange-50" title="Reschedule / Snooze">
                <Clock className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Snooze until...</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSnooze(1, 0)}>
                <Clock className="mr-2 h-4 w-4" /> In 1 Hour
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(3, 0)}>
                <Clock className="mr-2 h-4 w-4" /> In 3 Hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(24, 0)}>
                <CalendarDays className="mr-2 h-4 w-4" /> Tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(0, 7)}>
                <CalendarClock className="mr-2 h-4 w-4" /> Next Week
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Checkbox
            checked={selectionMode ? isSelected : isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="sm:hidden flex"
          />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-muted hover:bg-muted/80">
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className="border-t p-4 space-y-4 bg-muted/30 animate-in slide-in-from-top-2 duration-200">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">Last Interaction</h4>
            <p className="text-sm text-foreground/90">{item.lastInteractionSummary || "No interaction summary available."}</p>
          </div>

          {item.isAiGenerated && (item.aiSuggestedMessage || item.aiBestTimeToContact) &&
            <div className="p-3 rounded-md border bg-background/80 border-primary/20 shadow-sm">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
                <Bot className="h-4 w-4" /> AI Suggestions
              </h4>
              {item.aiBestTimeToContact && <div className="text-xs text-primary/80 font-medium mb-2">
                <span className="font-semibold">Best time to contact:</span> {item.aiBestTimeToContact}
              </div>}
              {item.aiSuggestedMessage &&
                <div className="text-sm bg-primary/5 p-3 rounded-md italic text-primary/90 border border-primary/10">
                  "{item.aiSuggestedMessage}"
                </div>
              }
            </div>
          }
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
