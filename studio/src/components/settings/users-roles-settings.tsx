
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, ShieldCheck, UserCheck, CheckCircle, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserStatus, Role, Invite } from "@/lib/types";
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InviteUserSheet from "./invite-user-sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const getStatusVariant = (status: UserStatus) => {
    switch (status) {
        case 'Active': return 'bg-green-500/20 text-green-700 border-green-500/30';
        case 'Suspended': return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
        case 'Invited': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
    }
}

const getRoleVariant = (role: User['role']) => {
    switch (role) {
        case 'super_admin': return 'bg-primary/20 text-primary border-primary/30';
        case 'admin': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
        default: return 'outline';
    }
}


import { fetchUsers } from "@/lib/api";
import { useEffect } from "react";

import { useSocket } from "@/providers/socket-provider";

export default function UsersAndRolesSettings() {
    const { hasRole } = useAuth();
    const { onlineUsers } = useSocket();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            const { fetchUsers, getInvites, getRoles } = await import("@/lib/api");
            const [usersData, invitesData, rolesData] = await Promise.all([fetchUsers(), getInvites(), getRoles()]);
            setUsers(usersData);
            setInvites(invitesData);
            if (rolesData.length > 0) setRoles(rolesData);
            if (rolesData.length > 0) setRoles(rolesData);
            else setRoles([]); // Fallback if API fails/empty
        } catch (err) {
            console.error("Failed to load data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const userWithMetrics = users.map(user => {
        // Mocks for metrics as those tables are large to aggregate on client, ideally API returns summary
        const assignedLeads = 0;
        const activeTasks = 0;
        return { ...user, assignedLeads, activeTasks };
    });

    const [inviteFilters, setInviteFilters] = useState({
        status: 'all',
        search: '',
    });

    const handleInviteFilterChange = (key: string, value: string) => {
        setInviteFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredInvites = invites.filter(invite => {
        if (inviteFilters.status !== 'all' && invite.status !== inviteFilters.status) return false;
        if (inviteFilters.search && !invite.email.toLowerCase().includes(inviteFilters.search.toLowerCase())) return false;
        return true;
    });

    // Actions
    const handleSuspend = async (id: string, currentStatus: string) => {
        if (!confirm(`Are you sure you want to ${currentStatus === 'Suspended' ? 'activate' : 'suspend'} this user?`)) return;
        try {
            const { updateUserStatus } = await import("@/lib/api");
            await updateUserStatus(id, currentStatus === 'Suspended' ? 'Active' : 'Suspended');
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const { deleteUser } = await import("@/lib/api");
            await deleteUser(id);
            loadData();
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    const handleCancelInvite = async (id: string) => {
        if (!confirm("Cancel this invite?")) return;
        try {
            const { deleteInvite } = await import("@/lib/api");
            await deleteInvite(id);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleReassign = async (id: string) => {
        const targetId = prompt("Enter the User ID to reassign work to:");
        if (!targetId) return;
        try {
            const { reassignWork } = await import("@/lib/api");
            await reassignWork(id, targetId);
            alert("Work reassigned successfully.");
        } catch (e: any) {
            alert(e.message);
        }
    };

    // Role Actions
    const handlePermissionChange = (roleName: string, permId: string, checked: boolean) => {
        setRoles(prev => prev.map(r => {
            if (r.name === roleName) {
                const newPerms = { ...r.permissions, [permId]: checked };
                return { ...r, permissions: newPerms };
            }
            return r;
        }));
    };

    const handleSaveRole = async (role: Role) => {
        try {
            const { updateRole } = await import("@/lib/api");
            await updateRole(role.name, { permissions: role.permissions, description: role.description });
            alert(`Role ${role.name} updated successfully.`);
        } catch (e: any) {
            alert("Error saving role: " + e.message);
        }
    };

    const handleCreateRole = async () => {
        const name = prompt("Enter new role name:");
        if (!name) return;
        const description = prompt("Enter description:");

        try {
            const { createRole } = await import("@/lib/api");
            // Default basic permissions
            const defaultPerms = { 'leads.view': true };
            await createRole({ name, description, permissions: defaultPerms });
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };


    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="font-headline">Users &amp; Roles</CardTitle>
                    <CardDescription>Manage who can access your CRM and what they can do.</CardDescription>
                </div>
                <InviteUserSheet>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Invite User
                    </Button>
                </InviteUserSheet>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="users">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                        <TabsTrigger value="roles">Roles &amp; Permissions ({roles.length})</TabsTrigger>
                        <TabsTrigger value="invites">Pending Invites ({invites.filter(i => i.status === 'Pending').length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="mt-6">
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Workload</TableHead>
                                        <TableHead>MFA</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userWithMetrics.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        {onlineUsers.includes(user.id) && (
                                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" title="Online" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(getRoleVariant(user.role), 'capitalize')}>{user.role?.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusVariant(user.status)}>{user.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="text-muted-foreground italic">Check Dashboard</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.mfaEnabled ?
                                                    <CheckCircle className="h-5 w-5 text-green-500" /> :
                                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {user.lastActive ? formatDistanceToNow(parseISO(user.lastActive), { addSuffix: true }) : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => alert(`ID: ${user.id}`)}>View Details (Copy ID)</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleReassign(user.id)}>Reassign Work</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleSuspend(user.id, user.status)}>{user.status === 'Suspended' ? 'Activate User' : 'Suspend User'}</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>Delete User</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="roles" className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-muted-foreground">Define roles and manage fine-grained permissions for your team.</p>
                            {hasRole(['super_admin']) && <Button variant="outline" onClick={handleCreateRole}><PlusCircle className="mr-2 h-4 w-4" /> Create Role</Button>}
                        </div>
                        <Accordion type="single" collapsible className="w-full" defaultValue="user">
                            {roles.map((role: Role) => (
                                <AccordionItem key={role.name} value={role.name}>
                                    <AccordionTrigger>
                                        <div className="flex flex-col items-start text-left">
                                            <h3 className="font-semibold capitalize text-base">{role.name.replace('_', ' ')}</h3>
                                            <p className="text-sm text-muted-foreground font-normal">{role.description}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 bg-muted/30 rounded-md">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {Object.entries(roles[0]?.permissions || {}).map(([key]) => {
                                                // Placeholder for permission map
                                                return null;
                                            })}
                                            {/* Static Permission Categories for UI Structure */}
                                            {['Leads', 'Deals', 'Automation', 'Settings'].map(category => (
                                                <div key={category} className="space-y-4">
                                                    <h4 className="font-medium">{category}</h4>
                                                    {/* This part needs refactoring to match dynamic permissions from API role object */}
                                                    <p className="text-xs text-muted-foreground">Permissions are managed via API.</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t mt-6 pt-4 flex justify-end">
                                            <Button disabled={!hasRole('super_admin')} onClick={() => handleSaveRole(role)}>Save Changes</Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </TabsContent>
                    <TabsContent value="invites" className="mt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by email..."
                                    value={inviteFilters.search}
                                    onChange={(e) => handleInviteFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={inviteFilters.status} onValueChange={(value) => handleInviteFilterChange('status', value)}>
                                <SelectTrigger className="w-auto sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="border rounded-lg">
                            {filteredInvites.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Assigned Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Invited By</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvites.map((invite: any) => (
                                            <TableRow key={invite.id}>
                                                <TableCell className="font-medium">{invite.email}</TableCell>
                                                <TableCell><Badge variant="outline" className={cn(getRoleVariant(invite.role), 'capitalize')}>{invite.role.replace('_', ' ')}</Badge></TableCell>
                                                <TableCell><Badge variant={invite.status === 'Pending' ? 'default' : 'secondary'}>{invite.status}</Badge></TableCell>
                                                <TableCell>{invite.invited_by || 'System'}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {format(parseISO(invite.invite_date), 'MMM d, yyyy')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="text-destructive" disabled={invite.status !== 'Pending'} onClick={() => handleCancelInvite(invite.id)}>Cancel Invite</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-muted-foreground">No pending invites match your filters.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
