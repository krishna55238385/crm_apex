'use client';

import { Lead, Task, ActivityLog } from "@/lib/types";
import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit, Mail, MessageSquare, Phone, PlusCircle, Sparkles, MoreHorizontal, AlertTriangle, Loader2, FileText, UserPlus, Star, Trash2, History } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { toast } from "sonner";
import TaskList from "@/components/tasks/task-list";
import ActivityTimeline from "@/components/activity-log/activity-timeline";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddFollowUpSheet from "@/components/follow-ups/add-follow-up-sheet";
import FollowUpCard from "@/components/follow-ups/follow-up-card";
import EditLeadSheet from "@/components/leads/edit-lead-sheet";
import AddNoteSheet from "@/components/leads/add-note-sheet";
import AssignLeadSheet from "@/components/leads/assign-lead-sheet";

const getScoreColor = (score: number) => {
  if (score > 85) return "text-green-500";
  if (score > 60) return "text-yellow-500";
  return "text-red-500";
};

const getTemperatureClasses = (temperature: Lead['temperature']) => {
  switch (temperature) {
    case 'Hot': return 'border-red-500/50 bg-red-500/10 text-red-600';
    case 'Warm': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700';
    case 'Cold': return 'border-blue-500/50 bg-blue-500/10 text-blue-600';
  }
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.leadId as string;
  const [lead, setLead] = useState<Lead | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        setLoading(true);
        // Try fetch from API
        const { fetchLead, fetchTasks, fetchActivityLogs, fetchFollowUps } = await import('@/lib/api');

        // Parallel fetch for speed
        const [loadedLead, logs, loadedFollowUps] = await Promise.all([
          fetchLead(leadId),
          fetchActivityLogs(),
          fetchFollowUps()
        ]);

        if (loadedLead) {
          setLead(loadedLead);
        }

        if (logs) {
          if (Array.isArray(logs)) {
            setActivityLogs(logs);
          } else if ((logs as any).data && Array.isArray((logs as any).data)) {
            setActivityLogs((logs as any).data);
          }
        }

        if (loadedFollowUps && Array.isArray(loadedFollowUps)) {
          setFollowUps(loadedFollowUps.filter((f: any) => f.leadId === leadId || (f.lead && f.lead.id === leadId)));
        }

      } catch (error) {
        console.error("Error fetching lead details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLeadData();
    }
  }, [leadId]);

  // Update effect to fetch tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { fetchTasks } = await import('@/lib/api');
        const allTasks = await fetchTasks();
        // Filter locally for now (ideally API filters)
        setTasks(allTasks.filter(t => t.relatedLead?.id === leadId));
      } catch (e) { console.error(e) }
    }
    if (leadId) loadTasks();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!lead) {
    notFound();
  }

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!lead) return;
    // Optimistic update
    const previousStatus = lead.status;
    setLead(prev => prev ? { ...prev, status: newStatus } : undefined);

    try {
      const { updateLead } = await import('@/lib/api');
      await updateLead(lead.id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
      // Revert on failure
      setLead(prev => prev ? { ...prev, status: previousStatus } : undefined);
    }
  };

  const handleMarkAsUrgent = async () => {
    if (!lead) return;
    try {
      const { updateLead } = await import('@/lib/api');
      await updateLead(lead.id, { temperature: 'Hot' });
      setLead({ ...lead, temperature: 'Hot' });
      window.location.reload();
    } catch (error) {
      console.error("Failed to mark as urgent", error);
      alert("Failed to update lead");
    }
  };

  const relatedTasks = tasks; // Use state instead of mock
  // Filter logs for this lead
  const leadActivities = activityLogs.filter(log =>
    (log.target.type === 'Lead' && log.target.id === lead.id) ||
    (log.target.type === 'ActivityLog' && log.summary.includes(lead.name)) // fallback
  );

  const notes = leadActivities.filter(log => log.action === 'NOTE');
  const otherActivities = leadActivities.filter(log => log.action !== 'NOTE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">{lead.name}</h1>
            <p className="text-muted-foreground">{lead.company}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {lead.phone && (
            <Button variant="outline" size="icon" asChild>
              <a href={`tel:${lead.phone.replace(/\D/g, '')}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
          {lead.email && (
            <Button variant="outline" size="icon" asChild>
              <a href={`mailto:${lead.email}`}>
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          )}
          {lead.phone && (
            <Button variant="outline" size="icon" asChild>
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-4 w-4" />
              </a>
            </Button>
          )}

          <AddFollowUpSheet>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Follow-up</Button>
          </AddFollowUpSheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditLeadSheet lead={lead}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Lead</span>
                </DropdownMenuItem>
              </EditLeadSheet>

              <DropdownMenuItem onSelect={() => setIsAddNoteOpen(true)} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Add Note</span>
              </DropdownMenuItem>

              <AssignLeadSheet lead={lead}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Assign / Forward</span>
                </DropdownMenuItem>
              </AssignLeadSheet>

              <DropdownMenuItem className="cursor-pointer" onClick={() => document.getElementById('history-tab')?.click()}>
                <History className="mr-2 h-4 w-4" />
                <span>View History</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleMarkAsUrgent} className="cursor-pointer">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                <span>Mark as Urgent</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`tel:${lead.phone.replace(/\D/g, '')}`} className="w-full">
                  <Phone className="mr-2 h-4 w-4" /> Call
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`mailto:${lead.email}`} className="w-full">
                  <Mail className="mr-2 h-4 w-4" /> Email
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hygiene Alert */}
      {lead.hygieneStatus && lead.hygieneStatus !== 'Clean' && (
        <Card className="border-amber-500/50 bg-amber-500/10 text-amber-700">
          <div className="flex items-center p-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-4 flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="text-base font-semibold text-amber-800">
                {lead.hygieneStatus === 'Duplicate Suspected' ? 'Potential Duplicate Found' : 'Incomplete Data'}
              </h3>
              <p className="text-amber-700/90 text-sm">
                {lead.hygieneStatus === 'Duplicate Suspected'
                  ? 'We found one or more leads with similar details. Merging helps keep your data clean.'
                  : 'This lead is missing important information. Completing it can improve engagement.'}
              </p>
            </div>
            <Button size="sm" variant="outline" className="ml-4 flex-shrink-0 border-amber-600/50 bg-transparent text-amber-800 hover:bg-amber-500/20 hover:text-amber-900">
              {lead.hygieneStatus === 'Duplicate Suspected' ? 'Review & Merge' : 'Complete Data'}
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature</span>
                <Badge variant="outline" className={getTemperatureClasses(lead.temperature)}>{lead.temperature}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AI Deal Score</span>
                <span className={`font-bold text-lg ${getScoreColor(lead.dealScore)}`}>{lead.dealScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Owner</span>
                <div className="flex items-center gap-2">
                  {lead.owner ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.owner.avatarUrl} />
                        <AvatarFallback>{lead.owner.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <span>{lead.owner.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Source</span>
                <span>{lead.source || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Interaction</span>
                <span>{lead.lastInteraction.date ? format(parseISO(lead.lastInteraction.date), "MMM d, yyyy") : 'Never'}</span>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">{lead.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.phone}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">History & Activity ({leadActivities.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({relatedTasks.length})</TabsTrigger>
              <TabsTrigger value="followups">Follow-ups ({followUps.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ActivityTimeline activities={leadActivities} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="followups" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {followUps.length > 0 ? (
                    followUps.map(fu => (
                      <FollowUpCard key={fu.id} followUp={fu} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No follow-ups found.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <TaskList tasks={relatedTasks} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <Card>
                {notes.length > 0 ? (
                  <CardContent className="pt-6">
                    <ActivityTimeline activities={notes} />
                  </CardContent>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
                    <CardHeader>
                      <CardTitle className="font-headline text-xl">No Notes Yet</CardTitle>
                      <CardDescription>
                        Add notes to keep track of conversations and details.
                      </CardDescription>
                    </CardHeader>
                    <AddNoteSheet lead={lead}>
                      <Button>Add Note</Button>
                    </AddNoteSheet>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AddNoteSheet lead={lead} open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen} />
    </div>
  )
}
