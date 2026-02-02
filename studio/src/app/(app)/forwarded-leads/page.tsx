'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Inbox, Send, StickyNote, CheckCircle, XCircle, Clock } from "lucide-react";
import LeadCard from "@/components/leads/lead-card";
import { Lead, ActivityLog } from "@/lib/types";
import { format, parseISO, differenceInHours } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function ForwardedLeadsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("received");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock current user ID (In real app, get from auth context)
    const currentUserId = "user-1";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { fetchLeads, fetchActivityLogs } = await import('@/lib/api');
            const [leadsData, logsData] = await Promise.all([fetchLeads(), fetchActivityLogs()]);

            if (leadsData) setLeads(leadsData);
            if (logsData) setActivityLogs(logsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (leadId: string, action: 'accept' | 'return') => {
        try {
            const { updateLead } = await import('@/lib/api');
            if (action === 'accept') {
                await updateLead(leadId, { transfer_status: 'Accepted' });
            } else {
                // Return logic: Set status to Rejected OR unassign. 
                // For now, setting status to Rejected and clearing owner implies "Returned to Pool" or just marked rejected.
                // Let's mark as Rejected so it stays in list but inactive, or clear owner.
                // To prevent it disappearing immediately effectively "loss", let's just mark Rejected.
                await updateLead(leadId, { transfer_status: 'Rejected' }); // Or owner_id: null
            }
            await fetchData(); // Refresh data
            router.refresh();
        } catch (error) {
            alert("Action failed");
        }
    };

    // Filter: Leads Received (Assigned to Me)
    // Showing all for demo, but prioritizing Pending ones
    const receivedLeads = Array.isArray(leads) ? leads.sort((a, b) => {
        // Show Pending first
        if (a.transfer_status === 'Pending' && b.transfer_status !== 'Pending') return -1;
        if (a.transfer_status !== 'Pending' && b.transfer_status === 'Pending') return 1;
        return 0;
    }) : [];

    // Filter: Sent (Forwarded by Me)
    const forwardedLogs = activityLogs.filter(log => log.action === 'ASSIGN' || log.summary.includes('Forwarded'));

    // Pagination for Forwarded Logs
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(forwardedLogs.length / itemsPerPage);
    const paginatedLogs = forwardedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Forwarded Leads</h2>
                    <p className="text-muted-foreground">Manage leads shared with you and by you.</p>
                </div>
            </div>

            <Tabs defaultValue="received" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="received" className="flex items-center gap-2">
                        <Inbox className="h-4 w-4" /> Forwarded to Me
                        {receivedLeads.filter(l => l.transfer_status === 'Pending').length > 0 &&
                            <Badge className="ml-1 bg-blue-600 hover:bg-blue-600">{receivedLeads.filter(l => l.transfer_status === 'Pending').length}</Badge>
                        }
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-2">
                        <Send className="h-4 w-4" /> Forwarded by Me
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Date Received</TableHead>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Forwarded By</TableHead>
                                    <TableHead>Note / Details</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receivedLeads.length > 0 ? (
                                    receivedLeads.map(lead => {
                                        const isPending = lead.transfer_status === 'Pending';

                                        // Find the log event where this lead was forwarded/assigned
                                        const assignmentLog = activityLogs.find(log =>
                                            log.target.id === lead.id &&
                                            (log.action === 'ASSIGN' || log.summary.includes('Forwarded'))
                                        );

                                        // Fallback date if log not found
                                        const dateDisplay = assignmentLog
                                            ? format(parseISO(assignmentLog.timestamp), "MMM d, yyyy h:mm a")
                                            : lead.transfer_date
                                                ? format(parseISO(lead.transfer_date), "MMM d, yyyy h:mm a")
                                                : "N/A";

                                        const forwardedBy = assignmentLog ? (assignmentLog.actor as any).name || 'System' : 'Unknown';

                                        return (
                                            <TableRow key={lead.id}>
                                                <TableCell className="font-medium text-xs">
                                                    {dateDisplay}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <Link href={`/leads/${lead.id}`} className="hover:underline text-primary font-semibold">
                                                            {lead.name}
                                                        </Link>
                                                        <span className="text-xs text-muted-foreground">{lead.company}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                                                        <span>{forwardedBy}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    {lead.transfer_note ? (
                                                        <div className="flex items-start gap-1 text-sm bg-yellow-50/50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-900/50">
                                                            <StickyNote className="h-3 w-3 mt-0.5 text-yellow-600" />
                                                            <span className="italic">"{lead.transfer_note}"</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">No notes</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {isPending ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleAction(lead.id, 'accept')}>
                                                                <CheckCircle className="mr-2 h-3.5 w-3.5" /> Accept
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={() => handleAction(lead.id, 'return')}>
                                                                <XCircle className="mr-2 h-3.5 w-3.5" /> Return
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Badge variant={lead.transfer_status === 'Accepted' ? 'default' : 'secondary'}>
                                                            {lead.transfer_status}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No leads received yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="sent">
                    <Card>
                        <CardHeader>
                            <CardTitle>Forwarding History</CardTitle>
                            <CardDescription>History of leads you have assigned to others.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">Date</TableHead>
                                            <TableHead>Lead</TableHead>
                                            <TableHead>Forwarded To</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedLogs.length > 0 ? (
                                            paginatedLogs.map(log => {
                                                // Extract "Forwarded to user X"
                                                const forwardedTo = log.summary.match(/Forwarded to user (.+)/)?.[1] || "Unknown User";

                                                return (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="font-medium text-xs">
                                                            {format(parseISO(log.timestamp), "MMM d, yyyy h:mm a")}
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.target && log.target.type === 'Lead' ? (
                                                                <Link href={`/leads/${log.target.id}`} className="hover:underline text-primary font-semibold">
                                                                    {log.target.name || "Unknown Lead"}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-muted-foreground">N/A</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                                                                <span>{forwardedTo}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {log.summary}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No forwarding history found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-4">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(c => c - 1); }}
                                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: totalPages }).map((_, i) => (
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={currentPage === i + 1}
                                                        onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(c => c + 1); }}
                                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
