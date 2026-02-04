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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchLeads, createFollowUp } from "@/lib/api";
import type { Lead } from "@/lib/types";

interface AddFollowUpSheetProps {
  children: React.ReactNode;
  leadId?: string;
  defaultName?: string;
}

export default function AddFollowUpSheet({ children, leadId: initialLeadId, defaultName }: AddFollowUpSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Form State
  const [title, setTitle] = useState(defaultName ? `Follow up with ${defaultName}` : "");
  const [leadId, setLeadId] = useState(initialLeadId || "");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadLeads() {
      const data = await fetchLeads();
      setLeads(data.data || []);
    }
    if (open) {
      loadLeads();
      // Reset to initials if provided (useful if reused)
      if (initialLeadId) setLeadId(initialLeadId);
      if (defaultName) setTitle(`Follow up with ${defaultName}`);
    }
  }, [open, initialLeadId, defaultName]);

  const handleSubmit = async () => {
    if (!title || !leadId || !dueDate) {
      alert("Please fill in all required fields (Title, Lead, Due Date)");
      return;
    }

    setLoading(true);
    try {
      await createFollowUp({
        title,
        leadId,
        dueDate,
        status: "Due", // Default status
        priorityScore: 50,
        actionType: "Call", // Default, could be selectable
        summary: notes,
      });
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create follow-up");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setLeadId("");
    setDueDate("");
    setNotes("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a Manual Follow-up</SheetTitle>
          <SheetDescription>
            Add a reminder or task to your follow-up list.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. Call John about the new proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lead">Lead / Contact <span className="text-red-500">*</span></Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lead..." />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} ({lead.company})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Follow-up"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
