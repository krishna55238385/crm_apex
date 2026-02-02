"use client";

import type { Lead } from "@/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail, Phone, MessageSquare, PlusCircle, UserPlus, ChevronDown, Sparkles, Clock,
  AlertTriangle, MoreHorizontal, Edit, FileText, History, Star, Eye, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import AddFollowUpSheet from "@/components/follow-ups/add-follow-up-sheet";
import EditLeadSheet from "@/components/leads/edit-lead-sheet";
import AddNoteSheet from "@/components/leads/add-note-sheet";
import AssignLeadSheet from "@/components/leads/assign-lead-sheet";

interface LeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  onSelect?: (isSelected: boolean) => void;
  onRefresh?: () => void;
}

const getScoreColor = (score: number) => {
  if (score > 85) return "text-green-500";
  if (score > 60) return "text-yellow-500";
  return "text-red-500";
};

const getFollowUpBadgeVariant = (status?: 'Pending' | 'Overdue' | 'None') => {
  switch (status) {
    case 'Overdue': return 'destructive';
    case 'Pending': return 'secondary';
    default: return 'outline';
  }
};

export default function LeadCard({ lead, isSelected, onSelect, onRefresh }: LeadCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        const { deleteLead } = await import('@/lib/api');
        await deleteLead(lead.id);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error("Failed to delete lead", error);
        alert("Failed to delete lead");
      }
    }
  };

  const handleMarkAsUrgent = async () => {
    try {
      const { updateLead } = await import('@/lib/api');
      await updateLead(lead.id, { temperature: 'Hot' });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to mark as urgent", error);
      alert("Failed to update lead");
    }
  };

  return (
    <Card className={cn("transition-all", isSelected && "border-primary ring-1 ring-primary")}>
      <Collapsible>
        <div className="flex items-center p-3 gap-3">
          <Checkbox
            checked={isSelected || false}
            onCheckedChange={(checked) => onSelect && onSelect(!!checked)}
            className="mt-1"
          />

          <Link href={`/leads/${lead.id}`} className="flex-grow grid gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            <p className="font-semibold">{lead.name} <span className="text-muted-foreground font-normal">• {lead.company}</span></p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <Badge variant="outline" className="py-0">{lead.status}</Badge>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last activity: {lead.lastInteraction.date ? formatDistanceToNow(parseISO(lead.lastInteraction.date), { addSuffix: true }) : 'Never'}</span>
              </div>
              {lead.followUpStatus &&
                <Badge variant={getFollowUpBadgeVariant(lead.followUpStatus)} className="py-0">
                  {lead.followUpStatus === 'None' ? 'No Follow-up' : `Follow-up ${lead.followUpStatus}`}
                </Badge>
              }
              {lead.hygieneStatus && lead.hygieneStatus !== 'Clean' && (
                <Badge variant="outline" className="py-0 border-amber-500/50 text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {lead.hygieneStatus}
                </Badge>
              )}
            </div>
          </Link>



          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-muted">
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="border-t bg-muted/30 p-4 space-y-4">


            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</h4>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" asChild>
                  <a href={`tel:${lead.phone?.replace(/\D/g, '')}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
                <AddFollowUpSheet leadId={lead.id} defaultName={lead.name}>
                  <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Follow-up</Button>
                </AddFollowUpSheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <Link href={`/leads/${lead.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </Link>
                    </DropdownMenuItem>

                    <EditLeadSheet lead={lead}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Lead</span>
                      </DropdownMenuItem>
                    </EditLeadSheet>

                    <AddNoteSheet lead={lead}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Add Note</span>
                      </DropdownMenuItem>
                    </AddNoteSheet>

                    <AssignLeadSheet lead={lead}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Assign / Forward</span>
                      </DropdownMenuItem>
                    </AssignLeadSheet>

                    <DropdownMenuItem asChild>
                      <Link href={`/leads/${lead.id}`}>
                        <History className="mr-2 h-4 w-4" />
                        <span>View History</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMarkAsUrgent}>
                      <Star className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>Mark as Urgent</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete Lead</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
