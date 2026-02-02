"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchUsers } from "@/lib/api";
import { type Lead, type User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AssignLeadSheetProps {
    children: React.ReactNode;
    lead: Lead;
}

export default function AssignLeadSheet({ children, lead }: AssignLeadSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState(lead.owner?.id || "");
    const [note, setNote] = useState("");

    useEffect(() => {
        async function loadUsers() {
            const data = await fetchUsers();
            setUsers(data);
        }
        if (open) {
            loadUsers();
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!selectedUserId) {
            console.error("No user selected");
            return;
        }
        setLoading(true);
        try {
            const { updateLead } = await import('@/lib/api');
            await updateLead(lead.id, {
                owner_id: selectedUserId,
                transfer_status: 'Pending',
                transfer_note: note,
                transfer_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Failed to assign lead", error);
            alert("Failed to assign lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Assign Lead</SheetTitle>
                    <SheetDescription>
                        Assign this lead to a team member.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="owner">Select New Owner</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select user..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="note">Transfer Note <span className="text-muted-foreground text-xs">(Context for the receiver)</span></Label>
                        <Textarea
                            id="note"
                            placeholder="Why are you forwarding this lead? e.g. 'Needs specific expertise'"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSubmit} disabled={loading || !selectedUserId}>
                        {loading ? 'Assigning...' : 'Confirm & Forward'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
