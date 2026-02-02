"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { type Lead } from "@/lib/types";

export interface AddNoteSheetProps {
    children?: React.ReactNode;
    lead: Lead;
    onNoteAdded?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

import { useAuth } from "@/hooks/use-auth";

export default function AddNoteSheet({ children, lead, onNoteAdded, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AddNoteSheetProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

    const handleSubmit = async () => {
        if (!note.trim()) return;
        setLoading(true);
        try {
            const { addNote } = await import('@/lib/api');
            await addNote(lead.id, note, user?.name || 'User');
            setOpen(false);
            setNote("");
            if (onNoteAdded) {
                onNoteAdded();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to add note", error);
            alert("Failed to add note");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {children && <SheetTrigger asChild>{children}</SheetTrigger>}
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add Note</SheetTitle>
                    <SheetDescription>
                        Add a note to {lead.name}'s timeline.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="note">Note Content</Label>
                        <Textarea
                            id="note"
                            placeholder="Enter your note here..."
                            className="min-h-[150px]"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSubmit} disabled={loading || !note.trim()}>
                        {loading ? 'Adding...' : 'Add Note'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
