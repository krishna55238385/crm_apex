import { useState, useEffect } from "react"; // Added hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceholderSection from "./placeholder-section";
import { GitPullRequest, ShieldCheck, Bot, Milestone, Trash2, CheckCircle2, Sliders, CheckCircle, GitBranch, Users, RefreshCw, PlusCircle, Pencil, Trash } from "lucide-react"; // Added icons
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

// Removed hardcoded arrays

export default function LeadManagementSettings() {
    const { hasRole } = useAuth();
    const [statusTab, setStatusTab] = useState("status");

    // Dynamic Data
    const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
    const [pipelineStages, setPipelineStages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Hygiene Data
    const [dedupeEnabled, setDedupeEnabled] = useState(true);
    const [dedupeRules, setDedupeRules] = useState<any>({
        email: true, phone: false, nameDomain: true, companyPhone: false
    });
    const [mergeMode, setMergeMode] = useState("manual");
    const [conflictResolution, setConflictResolution] = useState("latest");
    const [staleThreshold, setStaleThreshold] = useState("30");
    const [staleAction, setStaleAction] = useState("ai-suggest");
    const [requiredFields, setRequiredFields] = useState<any>({
        email: true, phone: false, company: true, source: false
    });

    // AI Data
    const [aiGlobalMode, setAiGlobalMode] = useState("suggest-approve");
    const [aiAutoCreateFollowup, setAiAutoCreateFollowup] = useState(true);
    const [aiAutoUpdateStatus, setAiAutoUpdateStatus] = useState(true);
    const [aiAutoFlagStale, setAiAutoFlagStale] = useState(true);
    const [aiAutoReassign, setAiAutoReassign] = useState(false);
    const [aiSuggestThreshold, setAiSuggestThreshold] = useState([50]);
    const [aiAutoThreshold, setAiAutoThreshold] = useState([90]);

    const loadHygieneData = async () => {
        try {
            const { fetchSettings } = await import("@/lib/api");
            const [
                dedupe, rules, merge, conflict, staleDays, staleAct, reqFields,
                // AI Settings
                aiMode, aiFollowup, aiStatus, aiStale, aiReassign, aiSuggest, aiAuto
            ] = await Promise.all([
                fetchSettings('hygiene_dedupe_enabled').catch(() => ({})),
                fetchSettings('hygiene_rules').catch(() => ({})),
                fetchSettings('hygiene_merge_mode').catch(() => ({})),
                fetchSettings('hygiene_conflict_resolution').catch(() => ({})),
                fetchSettings('hygiene_stale_days').catch(() => ({})),
                fetchSettings('hygiene_stale_action').catch(() => ({})),
                fetchSettings('hygiene_required_fields').catch(() => ({})),
                // AI Settings Fetch
                fetchSettings('ai_global_mode').catch(() => ({})),
                fetchSettings('ai_auto_followup').catch(() => ({})),
                fetchSettings('ai_auto_status').catch(() => ({})),
                fetchSettings('ai_auto_stale').catch(() => ({})),
                fetchSettings('ai_auto_reassign').catch(() => ({})),
                fetchSettings('ai_suggest_threshold').catch(() => ({})),
                fetchSettings('ai_auto_threshold').catch(() => ({})),
            ]);

            if (dedupe?.value !== undefined) setDedupeEnabled(dedupe.value);
            if (rules?.value) setDedupeRules(rules.value);
            if (merge?.value) setMergeMode(merge.value);
            if (conflict?.value) setConflictResolution(conflict.value);
            if (staleDays?.value) setStaleThreshold(staleDays.value);
            if (staleAct?.value) setStaleAction(staleAct.value);
            if (reqFields?.value) setRequiredFields(reqFields.value);

            // Set AI State
            if (aiMode?.value) setAiGlobalMode(aiMode.value);
            if (aiFollowup?.value !== undefined) setAiAutoCreateFollowup(aiFollowup.value);
            if (aiStatus?.value !== undefined) setAiAutoUpdateStatus(aiStatus.value);
            if (aiStale?.value !== undefined) setAiAutoFlagStale(aiStale.value);
            if (aiReassign?.value !== undefined) setAiAutoReassign(aiReassign.value);
            if (aiSuggest?.value) setAiSuggestThreshold(aiSuggest.value);
            if (aiAuto?.value) setAiAutoThreshold(aiAuto.value);

        } catch (error) {
            console.error("Failed to load settings", error);
        }
    };

    const saveHygieneSettings = async () => {
        try {
            const { saveSettings } = await import("@/lib/api");
            await Promise.all([
                saveSettings('hygiene_dedupe_enabled', { value: dedupeEnabled }),
                saveSettings('hygiene_rules', { value: dedupeRules }),
                saveSettings('hygiene_merge_mode', { value: mergeMode }),
                saveSettings('hygiene_conflict_resolution', { value: conflictResolution }),
                saveSettings('hygiene_stale_days', { value: staleThreshold }),
                saveSettings('hygiene_stale_action', { value: staleAction }),
                saveSettings('hygiene_required_fields', { value: requiredFields }),
            ]);
            alert("Hygiene settings saved!");
        } catch (e: any) { alert(e.message); }
    };

    const saveAiSettings = async () => {
        try {
            const { saveSettings } = await import("@/lib/api");
            await Promise.all([
                saveSettings('ai_global_mode', { value: aiGlobalMode }),
                saveSettings('ai_auto_followup', { value: aiAutoCreateFollowup }),
                saveSettings('ai_auto_status', { value: aiAutoUpdateStatus }),
                saveSettings('ai_auto_stale', { value: aiAutoFlagStale }),
                saveSettings('ai_auto_reassign', { value: aiAutoReassign }),
                saveSettings('ai_suggest_threshold', { value: aiSuggestThreshold }),
                saveSettings('ai_auto_threshold', { value: aiAutoThreshold }),
            ]);
            alert("AI settings saved!");
        } catch (e: any) { alert(e.message); }
    };

    const loadData = async () => {
        try {
            const { getLeadStatuses, getPipelineStages } = await import("@/lib/api");
            const [statuses, stages] = await Promise.all([getLeadStatuses(), getPipelineStages()]);
            setLeadStatuses(Array.isArray(statuses) ? statuses : []);
            setPipelineStages(Array.isArray(stages) ? stages : []);
        } catch (error) {
            console.error("Failed to load settings data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        loadHygieneData();
    }, []);

    const handleAddStatus = async () => {
        const name = prompt("Enter new status name:");
        if (!name) return;
        try {
            const { addLeadStatus } = await import("@/lib/api");
            await addLeadStatus(name);
            loadData();
        } catch (e: any) { alert(e.message); }
    };

    const handleEditStatus = async (id: string, currentName: string) => {
        const name = prompt("Enter new status name:", currentName);
        if (!name || name === currentName) return;
        try {
            const { updateLeadStatus } = await import("@/lib/api");
            await updateLeadStatus(id, { label: name });
            loadData();
        } catch (e: any) { alert(e.message); }
    };

    const handleDeleteStatus = async (id: string) => {
        if (!confirm("Are you sure? leads with this status might be affected.")) return;
        try {
            const { deleteLeadStatus } = await import("@/lib/api");
            await deleteLeadStatus(id);
            loadData();
        } catch (e: any) { alert(e.message); }
    }

    const handleAddStage = async () => {
        const name = prompt("Enter new stage name:");
        if (!name) return;
        try {
            const { addPipelineStage } = await import("@/lib/api");
            await addPipelineStage(name);
            loadData();
        } catch (e: any) { alert(e.message); }
    };

    const handleEditStage = async (id: string, currentName: string) => {
        const name = prompt("Enter new stage name:", currentName);
        if (!name || name === currentName) return;
        try {
            const { updatePipelineStage } = await import("@/lib/api");
            await updatePipelineStage(id, { label: name });
            loadData();
        } catch (e: any) { alert(e.message); }
    };

    const handleDeleteStage = async (id: string) => {
        if (!confirm("Are you sure? Deals in this stage might be affected.")) return;
        try {
            const { deletePipelineStage } = await import("@/lib/api");
            await deletePipelineStage(id);
            loadData();
        } catch (e: any) { alert(e.message); }
    }

    if (loading) return <div className="p-10 text-center">Loading settings...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Lead Management</CardTitle>
                <CardDescription>
                    Configure how leads are created, assigned, progressed, and governed across the CRM.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="status" value={statusTab} onValueChange={setStatusTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="status">Status & Pipeline</TabsTrigger>
                        <TabsTrigger value="assignment">Assignment</TabsTrigger>
                        <TabsTrigger value="hygiene">Hygiene</TabsTrigger>
                        <TabsTrigger value="ai">AI Behavior</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status" className="mt-6">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold font-headline">Lead Statuses</h3>
                                <p className="text-sm text-muted-foreground mb-4">Define the custom statuses for your lead lifecycle (Drag to reorder - Coming Soon).</p>
                                <div className="border rounded-lg">
                                    <div className="divide-y relative">
                                        {leadStatuses.length === 0 && <div className="p-4 text-center text-muted-foreground">No statuses defined.</div>}
                                        {leadStatuses.map(status => (
                                            <div key={status.id} className="p-3 flex items-center justify-between hover:bg-muted/50 group">
                                                <div className="flex items-center gap-3">
                                                    {status.is_default && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Default</span>}
                                                    <p className="font-medium">{status.label}</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditStatus(status.id, status.label)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {!status.is_default && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteStatus(status.id)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="outline" className="mt-4" onClick={handleAddStatus}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Status
                                </Button>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold font-headline">Deal Pipeline Stages</h3>
                                <p className="text-sm text-muted-foreground mb-4">Configure the stages for your sales pipeline.</p>
                                <div className="border rounded-lg">
                                    <div className="divide-y">
                                        {pipelineStages.length === 0 && <div className="p-4 text-center text-muted-foreground">No stages defined.</div>}
                                        {pipelineStages.map(stage => (
                                            <div key={stage.id} className="p-3 flex items-center justify-between hover:bg-muted/50 group">
                                                <p className="font-medium">{stage.label}</p>
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditStage(stage.id, stage.label)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteStage(stage.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="outline" className="mt-4" onClick={handleAddStage}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Stage
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="assignment" className="mt-6">
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Assignment Mode</CardTitle>
                                    <CardDescription>Enable and configure the primary method for lead allocation.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="enable-auto-assignment" className="text-base">Enable Auto-Assignment</Label>
                                            <p className="text-sm text-muted-foreground">Automatically assign new leads based on the rules below.</p>
                                        </div>
                                        <Switch id="enable-auto-assignment" defaultChecked />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="assignment-mode">Primary Assignment Mode</Label>
                                        <Select defaultValue="round-robin">
                                            <SelectTrigger id="assignment-mode" className="w-full md:w-1/2">
                                                <SelectValue placeholder="Select a mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual Only</SelectItem>
                                                <SelectItem value="round-robin">Round-Robin</SelectItem>
                                                <SelectItem value="rule-based">Source-based Routing</SelectItem>
                                                <SelectItem value="ai-assisted">AI-Assisted Routing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="space-y-1.5">
                                        <CardTitle className="text-lg font-headline">Auto-Allocation Rules</CardTitle>
                                        <CardDescription>Create prioritized rules to route leads to specific users or teams.</CardDescription>
                                    </div>
                                    <Button variant="outline">Add Rule</Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold flex items-center gap-2"><GitBranch className="h-4 w-4" /> IF Lead Source is 'Referral'</div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="ml-8 mt-2 text-sm">
                                            <p><span className="font-semibold text-muted-foreground">THEN</span> Assign to <span className="font-semibold">Priya Patel</span></p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold flex items-center gap-2"><GitBranch className="h-4 w-4" /> IF Est. Value is &gt; $50,000</div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="ml-8 mt-2 text-sm">
                                            <p><span className="font-semibold text-muted-foreground">THEN</span> Assign to team <span className="font-semibold">Enterprise Sales</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Round-Robin Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="skip-inactive" className="flex-grow">Skip inactive or users on leave</Label>
                                        <Switch id="skip-inactive" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="skip-overloaded" className="flex-grow">Skip users with more than 15 open tasks</Label>
                                        <Switch id="skip-overloaded" />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Manage included users and weights.</p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm"><Users className="mr-2 h-4 w-4" /> Manage Users</Button>
                                            <Button variant="ghost" size="sm"><RefreshCw className="mr-2 h-4 w-4" /> Reset Rotation</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">AI-Assisted Routing</CardTitle>
                                    <CardDescription>Let AI suggest the best owner based on historical performance and workload.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="ai-routing-mode">AI Mode</Label>
                                        <Select defaultValue="suggest">
                                            <SelectTrigger id="ai-routing-mode">
                                                <SelectValue placeholder="Select a mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="suggest">Suggest Only</SelectItem>
                                                <SelectItem value="approve">Require Approval</SelectItem>
                                                <SelectItem value="auto" disabled={!hasRole('super_admin')}>Auto-Assign (Super Admin)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="ai-routing-confidence">Confidence Threshold (for auto-assignment)</Label>
                                        <Slider id="ai-routing-confidence" defaultValue={[85]} max={100} step={5} />
                                        <p className="text-xs text-muted-foreground">AI will require approval for assignments with confidence below this level.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Reassignment Rules</CardTitle>
                                    <CardDescription>Automatically reassign leads that are not being worked on.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="enable-reassignment" className="text-base">Enable Auto-Reassignment</Label>
                                            <p className="text-sm text-muted-foreground">Trigger reassignments for stale or inactive leads.</p>
                                        </div>
                                        <Switch id="enable-reassignment" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reassign-days">Stale Threshold</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="reassign-days" type="number" defaultValue="7" className="w-24" />
                                            <span className="text-sm text-muted-foreground">days of no activity (calls, emails, meetings).</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button>Save Assignment Settings</Button>
                            </CardFooter>
                        </div>
                    </TabsContent>


                    <TabsContent value="hygiene" className="mt-6">
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Duplicate Detection</CardTitle>
                                    <CardDescription>Configure how the system identifies potential duplicate leads.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="enable-dedupe" className="text-base">Enable Duplicate Detection</Label>
                                            <p className="text-sm text-muted-foreground">Continuously scan for duplicates on creation and import.</p>
                                        </div>
                                        <Switch id="enable-dedupe" checked={dedupeEnabled} onCheckedChange={setDedupeEnabled} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Detection Rules</Label>
                                        <div className="space-y-4 rounded-lg border p-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Exact Match</h4>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="dedupe-email" checked={dedupeRules.email} onCheckedChange={(c) => setDedupeRules({ ...dedupeRules, email: !!c })} />
                                                        <Label htmlFor="dedupe-email">Email Address</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="dedupe-phone" checked={dedupeRules.phone} onCheckedChange={(c) => setDedupeRules({ ...dedupeRules, phone: !!c })} />
                                                        <Label htmlFor="dedupe-phone">Phone Number</Label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">Fuzzy Match</h4>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="dedupe-name-domain" checked={dedupeRules.nameDomain} onCheckedChange={(c) => setDedupeRules({ ...dedupeRules, nameDomain: !!c })} />
                                                        <Label htmlFor="dedupe-name-domain">Name + Domain</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="dedupe-company-phone" checked={dedupeRules.companyPhone} onCheckedChange={(c) => setDedupeRules({ ...dedupeRules, companyPhone: !!c })} />
                                                        <Label htmlFor="dedupe-company-phone">Company + Phone</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Merge & Conflict Rules</CardTitle>
                                    <CardDescription>Define how duplicates are merged and what happens when data conflicts.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="merge-mode">Merge Mode</Label>
                                        <Select value={mergeMode} onValueChange={setMergeMode}>
                                            <SelectTrigger id="merge-mode">
                                                <SelectValue placeholder="Select a mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual Approval Only</SelectItem>
                                                <SelectItem value="auto-exact">Auto-merge Exact Matches</SelectItem>
                                                <SelectItem value="ai-suggest">AI-Suggested Merges</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">"Auto-merge" only applies to records with the same email.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
                                        <Select value={conflictResolution} onValueChange={setConflictResolution}>
                                            <SelectTrigger id="conflict-resolution">
                                                <SelectValue placeholder="Select a rule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="latest">Latest Updated Wins</SelectItem>
                                                <SelectItem value="most-complete">Most Complete Record Wins</SelectItem>
                                                <SelectItem value="manual">Always Require Manual Resolution</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Determines which value is kept when merged records have different data.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Stale & Inactive Leads</CardTitle>
                                    <CardDescription>Define and manage leads that have not been engaged with recently.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="stale-days">Stale Threshold</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="stale-days" type="number" value={staleThreshold} onChange={(e) => setStaleThreshold(e.target.value)} className="w-24" />
                                            <span className="text-sm text-muted-foreground">days of no activity</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stale-action">Action for Stale Leads</Label>
                                        <Select value={staleAction} onValueChange={setStaleAction}>
                                            <SelectTrigger id="stale-action">
                                                <SelectValue placeholder="Select an action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ai-suggest">AI Suggestion Only</SelectItem>
                                                <SelectItem value="tag">Tag as "Stale"</SelectItem>
                                                <SelectItem value="notify-owner">Notify Owner</SelectItem>
                                                <SelectItem value="auto-archive" disabled={!hasRole(['super_admin'])}>Auto-Archive (Super Admin only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Data Completeness</CardTitle>
                                    <CardDescription>Enforce data quality by defining required fields for leads.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Required Fields</Label>
                                        <p className="text-sm text-muted-foreground mb-4">Select the fields that must be filled out to consider a lead profile "complete".</p>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="require-email" checked={requiredFields.email} onCheckedChange={(c) => setRequiredFields({ ...requiredFields, email: !!c })} />
                                                <Label htmlFor="require-email">Email</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="require-phone" checked={requiredFields.phone} onCheckedChange={(c) => setRequiredFields({ ...requiredFields, phone: !!c })} />
                                                <Label htmlFor="require-phone">Phone</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="require-company" checked={requiredFields.company} onCheckedChange={(c) => setRequiredFields({ ...requiredFields, company: !!c })} />
                                                <Label htmlFor="require-company">Company</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="require-source" checked={requiredFields.source} onCheckedChange={(c) => setRequiredFields({ ...requiredFields, source: !!c })} />
                                                <Label htmlFor="require-source">Lead Source</Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button onClick={saveHygieneSettings}>Save Hygiene Settings</Button>
                            </CardFooter>
                        </div>
                    </TabsContent>
                    <TabsContent value="ai" className="mt-6">
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">AI Modes & Permissions</CardTitle>
                                    <CardDescription>Define what AI is allowed to do with leads and when human approval is required.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ai-mode">Global AI Mode</Label>
                                        <Select defaultValue="suggest-approve">
                                            <SelectTrigger id="ai-mode" className="w-full md:w-1/2">
                                                <SelectValue placeholder="Select AI mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="disabled">Disabled</SelectItem>
                                                <SelectItem value="suggest">Suggest Only</SelectItem>
                                                <SelectItem value="suggest-approve">Suggest + Approve</SelectItem>
                                                <SelectItem value="autonomous" disabled={!hasRole(['super_admin'])}>Autonomous (Super Admin Only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">"Autonomous" mode allows AI to take action without approval, based on confidence thresholds.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">AI Automation Controls</CardTitle>
                                    <CardDescription>Define which specific actions the AI can perform automatically if the confidence threshold is met.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="auto-create-followup" className="text-base">Auto-create Follow-ups</Label>
                                            <p className="text-sm text-muted-foreground">AI can create follow-up tasks based on triggers like "no reply".</p>
                                        </div>
                                        <Switch id="auto-create-followup" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="auto-update-status" className="text-base">Auto-update Lead Status</Label>
                                            <p className="text-sm text-muted-foreground">AI can change a lead's status, e.g., from "New" to "Contacted" after a call.</p>
                                        </div>
                                        <Switch id="auto-update-status" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="auto-flag-stale" className="text-base">Auto-flag Stale Leads</Label>
                                            <p className="text-sm text-muted-foreground">AI will apply a "Stale" tag to leads with no activity.</p>
                                        </div>
                                        <Switch id="auto-flag-stale" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4 bg-destructive/5 border-destructive/20">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="auto-reassign" className="text-base text-destructive">Auto-reassign Leads</Label>
                                            <p className="text-sm text-destructive/80">Allow AI to reassign leads from inactive or overloaded reps. Requires Super Admin.</p>
                                        </div>
                                        <Switch id="auto-reassign" disabled={!hasRole(['super_admin'])} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-headline">Confidence Thresholds & Approvals</CardTitle>
                                    <CardDescription>Set the minimum AI confidence required to suggest or execute actions automatically.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <Label htmlFor="suggest-threshold">Minimum confidence to SUGGEST (e.g., 50%)</Label>
                                        <Slider id="suggest-threshold" defaultValue={[50]} max={100} step={5} />
                                        <p className="text-xs text-muted-foreground">AI will not show suggestions with confidence below this level.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="auto-threshold">Minimum confidence to AUTO-EXECUTE (e.g., 90%)</Label>
                                        <Slider id="auto-threshold" defaultValue={[90]} max={100} step={5} />
                                        <p className="text-xs text-muted-foreground">Actions above this level can be automated if enabled. Requires approval otherwise.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button>Save AI Settings</Button>
                            </CardFooter>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent >
        </Card >
    );
}
