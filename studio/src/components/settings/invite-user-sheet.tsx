
"use client";


import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/types";

interface InviteUserSheetProps {
  children: React.ReactNode;
}

export default function InviteUserSheet({ children }: InviteUserSheetProps) {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (open) {
      import('@/lib/api').then(({ getRoles }) => {
        getRoles().then(data => {
          if (data && data.length > 0) setRoles(data);
        });
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const { createInvite } = await import('@/lib/api');
      await createInvite({
        email: formData.get('email'),
        role: formData.get('role') || 'user',
        invitedBy: 'Admin' // Should be current user name/email ideally
      });
      // alert("Invite sent successfully!");
      setOpen(false);
      // Force refresh or invalidate query
      if (typeof window !== 'undefined') window.location.reload();
    } catch (error: any) {
      console.error("Invite failed", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Invite a new user</SheetTitle>
            <SheetDescription>
              They will receive an email with instructions to set up their account.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="user">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length > 0 ? roles.map((role) => (
                    <SelectItem key={role.name} value={role.name} className="capitalize">
                      {role.name.replace('_', ' ')}
                    </SelectItem>
                  )) : (
                    <SelectItem value="user">Loading roles...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="mfa-enforce" />
                <Label htmlFor="mfa-enforce">Require Multi-Factor Authentication on first login</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="welcome-email" defaultChecked />
                <Label htmlFor="welcome-email">Send welcome email with setup instructions</Label>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Invite'}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
