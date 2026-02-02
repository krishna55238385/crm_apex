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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Lead } from "@/lib/types";

interface EditLeadSheetProps {
  children: React.ReactNode;
  lead: Lead;
  onLeadUpdated?: () => void;
}

export default function EditLeadSheet({ children, lead, onLeadUpdated }: EditLeadSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Simple state for fields 
  const [name, setName] = useState(lead.name);
  const [company, setCompany] = useState(lead.company);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { updateLead } = await import('@/lib/api');
      await updateLead(lead.id, { name, company, email, phone });
      setOpen(false);
      if (onLeadUpdated) {
        onLeadUpdated();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update lead", error);
      alert("Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Lead</SheetTitle>
          <SheetDescription>
            Make changes to the lead's details here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
