
'use client';

import React, { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Bot, Zap, Sparkles, Play, Eye, Shield, Search, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkflowTemplate, ExecutionLog, ExecutionStatus, ExecutionActor } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { WorkflowTemplateCard } from "./workflow-template-card";


const mockWorkflows = [
    {
        id: 'wf-1',
        name: 'Inactive Lead Follow-up',
        description: 'When a lead has no activity for 3 days, create a "Check-in" task for the owner.',
        status: 'active',
        trigger: 'Lead Inactive',
        source: 'System Template'
    },
    {
        id: 'wf-2',
        name: 'New High-Value Lead Alert',
        description: 'When a new lead with a deal score > 90 is created, send a notification to the #sales channel.',
        status: 'active',
        trigger: 'Lead Created',
        source: 'Manual'
    },
    {
        id: 'wf-3',
        name: 'Overdue Task Reassignment',
        description: 'When a task is overdue by 2 days, reassign it to the team manager.',
        status: 'inactive',
        trigger: 'Task Overdue',
        source: 'Manual'
    }
];

const getStatusVariant = (status: ExecutionStatus) => {
    switch (status) {
        case 'Success': return 'bg-green-500/20 text-green-700 border-green-500/30';
        case 'Failed': return 'bg-destructive/20 text-destructive border-destructive/30';
        case 'Skipped': return 'outline';
    }
}

const getActorVariant = (actor: ExecutionActor) => {
    switch (actor) {
        case 'AI': return 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30';
        case 'System': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
        case 'User': return 'secondary';
    }
}

export default function AutomationSettings() {
    const { hasRole } = useAuth();
    const [workflows, setWorkflows] = useState<any[]>([]); // Using 'any' for now matching backend schema response
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [logFilters, setLogFilters] = useState({
        search: '',
        status: 'all',
        workflow: 'all',
        date: undefined as DateRange | undefined,
    });

    // Load data on mount
    // Load data on mount
    // Trigger HMR
    useEffect(() => {
        loadData();
    }, []);

    // Reload logs when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs();
        }, 500); // Debounce
        return () => clearTimeout(timer);
    }, [logFilters]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { fetchWorkflows } = await import("@/lib/api");
            const wfs = await fetchWorkflows();
            setWorkflows(wfs);
            await loadLogs();
        } catch (error) {
            console.error("Failed to load automation data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            const { fetchWorkflowLogs } = await import("@/lib/api");

            const params = new URLSearchParams();
            if (logFilters.search) params.append('search', logFilters.search);
            if (logFilters.status !== 'all') params.append('status', logFilters.status);
            if (logFilters.workflow !== 'all') params.append('workflowId', logFilters.workflow);
            if (logFilters.date?.from) params.append('dateFrom', logFilters.date.from.toISOString());
            if (logFilters.date?.to) params.append('dateTo', logFilters.date.to.toISOString());

            const fetchedLogs = await fetchWorkflowLogs(params.toString());

            // Map backend response if needed to ExecutionLog type
            const mappedLogs: ExecutionLog[] = fetchedLogs.map((l: any) => ({
                id: l.id,
                timestamp: l.timestamp,
                workflowName: l.workflow_name || l.workflowName, // Handle both just in case
                triggeredEntity: typeof l.triggered_entity === 'string' ? JSON.parse(l.triggered_entity) : (l.triggered_entity || { type: 'System', name: 'Unknown' }),
                actionExecuted: l.action_executed || l.actionExecuted,
                status: l.status,
                actor: l.actor,
                executionTime: l.execution_time_ms || l.executionTime || 0
            }));
            setLogs(mappedLogs);
        } catch (error) {
            console.error("Failed to load logs", error);
        }
    }

    const [activeTab, setActiveTab] = useState("workflows");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null);

    const handleCreateCustomWorkflow = async (formData: FormData) => {
        try {
            const workflowData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                trigger_type: formData.get('trigger_type') as string,
                actions: [{ summary: formData.get('action_summary') as string }],
                source: 'Manual',
                risk_level: formData.get('risk_level') as string || 'Low',
                is_active: editingWorkflow ? editingWorkflow.is_active : true
            };

            if (editingWorkflow && editingWorkflow.id) {
                const { updateWorkflow } = await import("@/lib/api");
                await updateWorkflow(editingWorkflow.id, workflowData);
                alert("Workflow updated successfully!");
            } else {
                const { createWorkflow } = await import("@/lib/api");
                await createWorkflow(workflowData);
                alert("Workflow created successfully!");
            }

            setIsCreateOpen(false);
            setEditingWorkflow(null);

            // Reload workflows
            const { fetchWorkflows } = await import("@/lib/api");
            const wfs = await fetchWorkflows();
            setWorkflows(wfs);
            setActiveTab("workflows");

        } catch (error) {
            console.error("Failed to create workflow", error);
            alert("Failed to create workflow");
        }
    };

    const handleDeleteWorkflow = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workflow?")) return;
        try {
            const { deleteWorkflow } = await import("@/lib/api");
            await deleteWorkflow(id);
            setWorkflows(prev => prev.filter(w => w.id !== id));
        } catch (error) {
            console.error("Failed to delete workflow", error);
            alert("Failed to delete workflow");
        }
    };

    const handleLogFilterChange = (key: string, value: string | DateRange | undefined) => {
        setLogFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleToggleWorkflow = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w));

            const { updateWorkflow } = await import("@/lib/api");
            await updateWorkflow(id, { is_active: !currentStatus });
        } catch (error) {
            console.error("Failed to toggle workflow", error);
            // Revert on error
            setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: currentStatus } : w));
            alert("Failed to update status");
        }
    };

    // Removed duplicate handler

    const handleUseTemplate = async (template: any) => {
        if (!confirm(`Create new workflow from template "${template.name}"?`)) return;

        try {
            const { createWorkflow } = await import("@/lib/api");
            await createWorkflow({
                name: template.name,
                description: template.description,
                trigger_type: template.triggerSummary, // Mapping summary to type for simplicity, ideal would be structured
                actions: [{ summary: template.actionSummary }], // Simplifying actions to JSON
                source: 'Template',
                risk_level: template.riskLevel
            });
            alert("Workflow created!");

            // Switch to workflows tab and reload
            const { fetchWorkflows } = await import("@/lib/api");
            const wfs = await fetchWorkflows();
            setWorkflows(wfs);
            setActiveTab("workflows");
        } catch (error) {
            console.error("Failed to create workflow", error);
            alert("Failed to create workflow");
        }
    };

    const workflowNames = Array.from(new Set(workflows.map(w => w.name)));
    const uniqueLogWorkflowNames = Array.from(new Set(logs.map(l => l.workflowName)));
    const filterOptions = Array.from(new Set([...workflowNames, ...uniqueLogWorkflowNames]));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Automation &amp; AI</CardTitle>
                <CardDescription>Automate repetitive tasks and configure AI decision-making to streamline your sales process.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <TabsList>
                            <TabsTrigger value="workflows">Workflows</TabsTrigger>
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                        </TabsList>
                        <Dialog open={isCreateOpen} onOpenChange={(open) => {
                            setIsCreateOpen(open);
                            if (!open) setEditingWorkflow(null);
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Workflow
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Custom Workflow'}</DialogTitle>
                                    <DialogDescription>
                                        Define triggers and actions for your new automation workflow.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    handleCreateCustomWorkflow(formData);
                                }}>

                                    {!editingWorkflow && (
                                        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 text-yellow-500" /> Generate with AI
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="ai-prompt"
                                                    placeholder="Describe your workflow (e.g., 'Email the manager if a task is overdue')"
                                                    className="bg-background"
                                                />
                                                <Button type="button" size="sm" onClick={async () => {
                                                    const input = document.getElementById('ai-prompt') as HTMLInputElement;
                                                    if (!input.value) return;

                                                    const btn = document.activeElement as HTMLButtonElement;
                                                    const originalText = btn.innerText;
                                                    btn.innerText = "Generating...";
                                                    btn.disabled = true;

                                                    try {
                                                        const { generateWorkflowConfig } = await import("@/lib/api");
                                                        const config = await generateWorkflowConfig(input.value);

                                                        // Populate form logic
                                                        const nameInput = document.getElementById('name') as HTMLInputElement;
                                                        const descInput = document.getElementById('description') as HTMLInputElement;
                                                        const actionInput = document.getElementById('action') as HTMLInputElement;
                                                        // For Selects, native DOM manipulation is tricky with Radix/Custom UI. 
                                                        // Ideally we should use state for form values controller by React Hook Form or useState.
                                                        // For this rapid implementation, updating the defaultValue prop won't re-render.
                                                        // We set state to force re-render with new defaults if we refactor to state-driven form.
                                                        // Given the current 'uncontrolled' form approach (defaultValue), we might need to switch to controlled or force a re-render.
                                                        // Let's assume we update the DOM directly for Inputs, but for Selects it's harder.
                                                        // BETTER: Let's use `setEditingWorkflow` to "edit" this new ephemeral workflow.

                                                        // Update inputs
                                                        if (nameInput) nameInput.value = config.name;
                                                        if (descInput) descInput.value = config.description;
                                                        if (actionInput) actionInput.value = config.actions[0].summary;

                                                        // For trigger/risk selects, we'll cheat a bit by setting the "editingWorkflow" state which controls defaultValues
                                                        // But that might flip the UI to "Edit Mode".
                                                        // Instead, let's just make the user fill the dropdowns or hope they match? 
                                                        // No, that defeats the purpose.
                                                        // Let's use `setEditingWorkflow` but keeps `isCreateOpen` true. 
                                                        // The "Edit" mode logic checks `if (editingWorkflow)`. We can add a flag `isNew` to `editingWorkflow` object maybe?
                                                        // Or just populate it and let it be "Edit" mode but with no ID, so the submit handler creates instead of updates?
                                                        // Let's modify handleCreateCustomWorkflow to check for ID.

                                                        setEditingWorkflow({ ...config, id: null }); // Passing null ID to signify new

                                                    } catch (error) {
                                                        console.error(error);
                                                        alert("Failed to generate.");
                                                    } finally {
                                                        btn.innerText = originalText;
                                                        btn.disabled = false;
                                                    }
                                                }}>
                                                    <Sparkles className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-4 py-4" key={editingWorkflow ? 'ai-generated' : 'empty'}>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" name="name" defaultValue={editingWorkflow?.name} placeholder="e.g., VIP Lead Alert" required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea id="description" name="description" defaultValue={editingWorkflow?.description} placeholder="Describe what this workflow does..." />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="trigger_type">Trigger</Label>
                                                <Select name="trigger_type" defaultValue={editingWorkflow?.trigger_type || "Lead Created"}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select event" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Lead Created">Lead Created</SelectItem>
                                                        <SelectItem value="Lead Assigned">Lead Assigned / Forwarded</SelectItem>
                                                        <SelectItem value="Lead Inactive">Lead Inactive (7+ days)</SelectItem>
                                                        <SelectItem value="Task Overdue">Task Overdue</SelectItem>
                                                        <SelectItem value="Time Elapsed">Scheduled / Time Elapsed</SelectItem>
                                                        <SelectItem value="Call Logged">Call Logged</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="risk_level">Risk Level</Label>
                                                <Select name="risk_level" defaultValue={editingWorkflow?.risk_level || "Low"}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select risk" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Low">Low (Safe)</SelectItem>
                                                        <SelectItem value="Medium">Medium (Caution)</SelectItem>
                                                        <SelectItem value="High">High (Critical)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="action_summary">Action</Label>
                                            <Textarea
                                                id="action_summary"
                                                name="action_summary"
                                                defaultValue={editingWorkflow?.actions?.[0]?.summary}
                                                placeholder="What should happen? (e.g., Send email to lead)"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">{editingWorkflow ? 'Save Changes' : 'Create Workflow'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <TabsContent value="workflows">
                        <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                            {isLoading && workflows.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">Loading workflows...</div>
                            ) : (
                                <div className="divide-y">
                                    {workflows.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No workflows active. Use a template to get started.
                                        </div>
                                    ) : (
                                        workflows.map(wf => (
                                            <div key={wf.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="grid gap-1">
                                                    <p className="font-semibold flex items-center gap-2">
                                                        {wf.name}
                                                        {wf.risk_level === 'High' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">High Risk</Badge>}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{wf.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {wf.trigger_type}</span>
                                                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {Array.isArray(wf.actions) ? wf.actions[0]?.summary : 'Actions'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Switch
                                                        checked={!!wf.is_active}
                                                        onCheckedChange={() => handleToggleWorkflow(wf.id, !!wf.is_active)}
                                                    />
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        setEditingWorkflow(wf);
                                                        setIsCreateOpen(true);
                                                    }}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteWorkflow(wf.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="templates" className="mt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Templates can be static for now */}
                            {[{
                                id: 'TPL-001',
                                name: 'Auto-follow-up on New Lead',
                                description: 'When a new lead is created, wait 1 business day and then create an "Initial Contact" task.',
                                category: 'Follow-ups & SLA',
                                triggerSummary: 'New Lead Created',
                                actionSummary: 'Wait 1 day, Create Task',
                                hasAi: false,
                                riskLevel: 'Low',
                            }].map((template: any) => (
                                <WorkflowTemplateCard
                                    key={template.id}
                                    template={template}
                                    onUse={() => handleUseTemplate(template)}
                                />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="logs" className="mt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                            <div className="relative flex-grow w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-10"
                                    value={logFilters.search}
                                    onChange={(e) => handleLogFilterChange('search', e.target.value)}
                                />
                            </div>
                            <Select value={logFilters.workflow} onValueChange={(v) => handleLogFilterChange('workflow', v)}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Workflows" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Workflows</SelectItem>
                                    {filterOptions.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={logFilters.status} onValueChange={(v) => handleLogFilterChange('status', v)}>
                                <SelectTrigger className="w-full sm:w-[120px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Success">Success</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                    <SelectItem value="Skipped">Skipped</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full sm:w-auto justify-start text-left font-normal",
                                            !logFilters.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {logFilters.date?.from ? (
                                            logFilters.date.to ? (
                                                <>
                                                    {format(logFilters.date.from, "LLL dd, y")} -{" "}
                                                    {format(logFilters.date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(logFilters.date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={logFilters.date?.from}
                                        selected={logFilters.date}
                                        onSelect={(d) => handleLogFilterChange('date', d)}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Workflow</TableHead>
                                        <TableHead>Trigger Entity</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actor</TableHead>
                                        <TableHead className="text-right">Time (ms)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No execution logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map(log => (
                                            <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>{format(parseISO(log.timestamp), "MMM d, h:mm:ss a")}</TableCell>
                                                <TableCell className="font-medium">{log.workflowName}</TableCell>
                                                <TableCell>{log.triggeredEntity?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-muted-foreground">{log.actionExecuted}</TableCell>
                                                <TableCell><Badge variant="outline" className={getStatusVariant(log.status)}>{log.status}</Badge></TableCell>
                                                <TableCell><Badge variant="outline" className={getActorVariant(log.actor)}>{log.actor}</Badge></TableCell>
                                                <TableCell className="text-right">{log.executionTime}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <CardFooter className="pt-4 flex justify-end">
                            <Button variant="outline" disabled={!hasRole(['super_admin'])}>Export Logs</Button>
                        </CardFooter>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
