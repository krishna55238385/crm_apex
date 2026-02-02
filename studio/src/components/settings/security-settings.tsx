
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fingerprint, Computer, Bot, CheckCircle, XCircle, MoreHorizontal, KeyRound, Smartphone, Monitor, Tablet, Power, Shield, BarChart, LineChart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Session, SessionRiskLevel, User } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import SecurityAnalyticsDashboard from "./security-analytics-dashboard";
import { useState, useEffect } from "react";

const aiActions = [
    {
        id: 'create-task',
        label: 'Create Tasks & Follow-ups',
        description: 'Automatically create tasks based on lead activity or triggers.',
        risk: 'Low',
        defaultEnabled: true,
    },
    {
        id: 'update-score',
        label: 'Update Lead Scores',
        description: 'Dynamically adjust lead scores based on new engagement data.',
        risk: 'Medium',
        defaultEnabled: true,
    },
    {
        id: 'update-stage',
        label: 'Update Pipeline Stage',
        description: 'Move deals to the next stage based on detected milestones.',
        risk: 'Medium',
        defaultEnabled: false,
    },
    {
        id: 'reassign-lead',
        label: 'Reassign Leads',
        description: 'Suggest or automatically reassign stale or unmanaged leads.',
        risk: 'High',
        defaultEnabled: false,
    },
    {
        id: 'generate-message',
        label: 'Generate Email/Message Drafts',
        description: 'Create contextual follow-up message suggestions for reps.',
        risk: 'Low',
        defaultEnabled: true,
    },
    {
        id: 'change-automation',
        label: 'Modify Automation Rules',
        description: 'AI can suggest changes to existing automation workflows.',
        risk: 'High',
        defaultEnabled: false,
    },
];

const getRiskBadgeVariant = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
        case 'Low': return 'bg-green-500/20 text-green-700 border-green-500/30';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
        case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
    }
};

export default function SecuritySettings() {
    const { hasRole } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { fetchUsers, fetchSessions } = await import("@/lib/api");
                const [u, s] = await Promise.all([fetchUsers(), fetchSessions()]);
                setUsers(u);
                setSessions(s);
            } catch (e) {
                console.error(e);
            }
        };
        loadData();
    }, []);

    const getSessionIcon = (deviceType: Session['deviceType']) => {
        switch (deviceType) {
            case 'Web': return <Monitor className="h-4 w-4 text-muted-foreground" />;
            case 'Mobile': return <Smartphone className="h-4 w-4 text-muted-foreground" />;
            case 'Tablet': return <Tablet className="h-4 w-4 text-muted-foreground" />;
        }
    }

    const getRiskColor = (riskLevel: SessionRiskLevel) => {
        switch (riskLevel) {
            case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
            case 'Medium': return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
            case 'Low': return 'bg-green-500/20 text-green-700 border-green-500/30';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Security</CardTitle>
                <CardDescription>
                    Manage authentication, access control, and other security settings for your workspace.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="auth">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
                        <TabsTrigger value="auth">Authentication</TabsTrigger>
                        <TabsTrigger value="mfa">MFA</TabsTrigger>
                        <TabsTrigger value="sessions">Sessions &amp; Devices</TabsTrigger>
                        <TabsTrigger value="ai-safeguards">AI Safeguards</TabsTrigger>
                        <TabsTrigger value="analytics">Security Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="auth" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Authentication &amp; Passwords</CardTitle>
                                <CardDescription>Define how users sign in and the security requirements for their passwords.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label>Password Policy</Label>
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="min-length">Minimum Length</Label>
                                                <Input id="min-length" type="number" defaultValue="8" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry-days">Password Expiry (days)</Label>
                                                <Input id="expiry-days" type="number" placeholder="90 (0 for never)" />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Switch id="complexity-enabled" defaultChecked />
                                            <Label htmlFor="complexity-enabled">Enforce complexity (uppercase, number, symbol)</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Force Password Reset</Label>
                                    <p className="text-sm text-muted-foreground">This will require all users to reset their password on their next login.</p>
                                    <Button variant="destructive">Force Reset for All Users</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mfa" className="mt-6 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">MFA Policy</CardTitle>
                                <CardDescription>Configure and enforce Multi-Factor Authentication for your organization.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enforce-mfa-all" className="text-base">Enforce MFA for all users</Label>
                                        <p className="text-sm text-muted-foreground">All users will be required to set up MFA on their next login.</p>
                                    </div>
                                    <Switch id="enforce-mfa-all" disabled={!hasRole(['super_admin'])} />
                                </div>
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enforce-mfa-admins" className="text-base">Enforce MFA for Admins</Label>
                                        <p className="text-sm text-muted-foreground">Users with 'Admin' or 'Super Admin' roles must use MFA.</p>
                                    </div>
                                    <Switch id="enforce-mfa-admins" defaultChecked disabled />
                                </div>
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow-sms" className="text-base">Allow SMS as an MFA factor</Label>
                                        <p className="text-sm text-muted-foreground">Allow users to receive MFA codes via text message as a fallback.</p>
                                    </div>
                                    <Switch id="allow-sms" defaultChecked disabled={!hasRole(['super_admin'])} />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button disabled={!hasRole(['super_admin'])}>Save MFA Policy</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">User MFA Status</CardTitle>
                                <CardDescription>View and manage the MFA status for all users in your workspace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>MFA Status</TableHead>
                                                <TableHead>Primary Method</TableHead>
                                                <TableHead>Last Verified</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{user.name}</p>
                                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.mfaEnabled ? (
                                                            <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30 flex items-center gap-2 w-fit">
                                                                <CheckCircle className="h-4 w-4" /> Enabled
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30 flex items-center gap-2 w-fit">
                                                                <XCircle className="h-4 w-4" /> Disabled
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.mfaEnabled && user.primaryMfaMethod ? (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                {user.primaryMfaMethod === 'Authenticator App' ? <KeyRound className="h-4 w-4 text-muted-foreground" /> : <Smartphone className="h-4 w-4 text-muted-foreground" />}
                                                                <span>{user.primaryMfaMethod}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {user.lastMfaVerification ? formatDistanceToNow(parseISO(user.lastMfaVerification), { addSuffix: true }) : 'Never'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {!user.mfaEnabled && <DropdownMenuItem disabled={!hasRole(['super_admin'])}>Force Enrollment</DropdownMenuItem>}
                                                                {user.mfaEnabled && <DropdownMenuItem disabled={!hasRole(['super_admin'])}>Reset MFA</DropdownMenuItem>}
                                                                <DropdownMenuItem className="text-destructive" disabled={!hasRole(['super_admin'])}>Disable MFA</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="sessions" className="mt-6 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Session &amp; Device Policy</CardTitle>
                                <CardDescription>Define how user sessions are managed and secured across the workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="idle-timeout" className="text-base">Auto-expire idle sessions</Label>
                                        <p className="text-sm text-muted-foreground">Automatically log out users after a period of inactivity.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Input id="idle-timeout" type="number" defaultValue="30" className="w-20" />
                                        <span className="text-sm text-muted-foreground">minutes</span>
                                        <Switch defaultChecked disabled={!hasRole(['super_admin'])} />
                                    </div>
                                </div>
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="require-mfa-new-device" className="text-base">Require MFA on new device</Label>
                                        <p className="text-sm text-muted-foreground">Challenge users for MFA when they log in from an unrecognized device.</p>
                                    </div>
                                    <Switch id="require-mfa-new-device" defaultChecked disabled />
                                </div>
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="revoke-on-password-reset" className="text-base">Revoke all sessions on password reset</Label>
                                        <p className="text-sm text-muted-foreground">Enhance security by logging out all devices after a password change.</p>
                                    </div>
                                    <Switch id="revoke-on-password-reset" defaultChecked disabled={!hasRole(['super_admin'])} />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button disabled={!hasRole(['super_admin'])}>Save Session Policy</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Active Sessions</CardTitle>
                                <CardDescription>View and manage all active login sessions across your workspace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Device &amp; Browser</TableHead>
                                                <TableHead>Location / IP</TableHead>
                                                <TableHead>Risk</TableHead>
                                                <TableHead>Last Active</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sessions.map(session => (
                                                <TableRow key={session.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage src={session.user.avatarUrl} alt={session.user.name} />
                                                                <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{session.user.name}</p>
                                                                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getSessionIcon(session.deviceType)}
                                                            <div>
                                                                <p className="font-medium">{session.os}</p>
                                                                <p className="text-sm text-muted-foreground">{session.browser}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium">{session.location}</p>
                                                        <p className="text-sm text-muted-foreground">{session.ipAddress}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getRiskColor(session.riskLevel)}>{session.riskLevel}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDistanceToNow(parseISO(session.lastActivity), { addSuffix: true })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" disabled={!hasRole(['super_admin'])}>Revoke Session</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="ai-safeguards" className="mt-6 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Global AI Autonomy Level</CardTitle>
                                <CardDescription>Set the default operating mode for all AI actions across the workspace. This can be overridden by more specific rules.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select defaultValue="suggest-approve" disabled={!hasRole(['super_admin'])}>
                                    <SelectTrigger className="w-full md:w-1/2">
                                        <SelectValue placeholder="Select AI mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="suggest">Suggest Only</SelectItem>
                                        <SelectItem value="suggest-approve">Suggest + Approve</SelectItem>
                                        <SelectItem value="autonomous" disabled={!hasRole(['super_admin'])}>Autonomous (Super Admin Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">"Autonomous" mode allows AI to execute actions without human approval if confidence is high.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">AI Action Permissions</CardTitle>
                                <CardDescription>Define which actions AI is permitted to take, and which require explicit human approval.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Risk</TableHead>
                                                <TableHead>Allow</TableHead>
                                                <TableHead>Require Approval</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aiActions.map((action) => (
                                                <TableRow key={action.id}>
                                                    <TableCell>
                                                        <p className="font-medium">{action.label}</p>
                                                        <p className="text-sm text-muted-foreground">{action.description}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getRiskBadgeVariant(action.risk as 'Low' | 'Medium' | 'High')}>
                                                            {action.risk} Risk
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            defaultChecked={action.defaultEnabled}
                                                            disabled={!hasRole(['super_admin'])}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            defaultChecked={action.risk === 'High' || action.risk === 'Medium'}
                                                            disabled={!hasRole(['super_admin'])}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Confidence Thresholds &amp; Approvals</CardTitle>
                                <CardDescription>Set the minimum AI confidence required to suggest or execute actions automatically.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2 pt-4">
                                <div className="space-y-4">
                                    <Label htmlFor="suggest-threshold">Minimum confidence to SUGGEST (e.g., 50%)</Label>
                                    <Slider id="suggest-threshold" defaultValue={[50]} max={100} step={5} disabled={!hasRole(['super_admin'])} />
                                    <p className="text-xs text-muted-foreground">AI will not show suggestions with confidence below this level.</p>
                                </div>
                                <div className="space-y-4">
                                    <Label htmlFor="auto-threshold">Minimum confidence to AUTO-EXECUTE (e.g., 90%)</Label>
                                    <Slider id="auto-threshold" defaultValue={[90]} max={100} step={5} disabled={!hasRole(['super_admin'])} />
                                    <p className="text-xs text-muted-foreground">Actions above this level can be automated if enabled. Requires approval otherwise.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button disabled={!hasRole(['super_admin'])}>Save AI Safeguards</Button>
                            </CardFooter>
                        </Card>

                        <Card className="border-destructive/50 bg-destructive/10">
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center gap-2 text-destructive">
                                    <Shield className="h-5 w-5" /> Emergency Kill Switch
                                </CardTitle>
                                <CardDescription className="text-destructive/80">Immediately pause all autonomous and approval-based AI actions across the entire platform.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-destructive/90">This is a last-resort safety measure. All AI automations will be reverted to "Suggest Only" mode until manually re-enabled. This action will be logged and will notify all Super Admins.</p>
                            </CardContent>
                            <CardFooter className="border-t border-destructive/20 pt-6 flex justify-end">
                                <Button variant="destructive" disabled={!hasRole(['super_admin'])}>
                                    <Power className="mr-2 h-4 w-4" />
                                    Activate Kill Switch
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-6">
                        <SecurityAnalyticsDashboard />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
