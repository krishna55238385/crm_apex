"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL, createLead, ValidationError } from "@/lib/api";
import { toast } from "sonner";

export default function AddLeadSheet({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        // Clear error when user starts typing
        if (fieldErrors[`body.${e.target.id}`]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`body.${e.target.id}`];
                return newErrors;
            });
        }
    };

    const handleStatusChange = (value: string) => {
        setFormData({ ...formData, status: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        try {
            await createLead(formData);

            setOpen(false);
            setFormData({ name: '', company: '', email: '', phone: '', status: 'New' });
            toast.success("Lead created successfully");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            if (error instanceof ValidationError) {
                setFieldErrors(error.errors);
                toast.error("Please check the form for errors");
            } else {
                toast.error("Failed to create lead");
            }
        } finally {
            setLoading(false);
        }
    };

    const getError = (field: string) => fieldErrors[`body.${field}`];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add New Lead</SheetTitle>
                    <SheetDescription>
                        Enter the details for the new lead. Click save to add them to your pipeline.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input id="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" className={getError('name') ? 'border-red-500' : ''} />
                            {getError('name') && <span className="text-xs text-red-500">{getError('name')}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" value={formData.company} onChange={handleChange} placeholder="Acme Inc" className={getError('company') ? 'border-red-500' : ''} />
                            {getError('company') && <span className="text-xs text-red-500">{getError('company')}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className={getError('email') ? 'border-red-500' : ''} />
                            {getError('email') && <span className="text-xs text-red-500">{getError('email')}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={getError('phone') ? 'border-red-500' : ''} />
                            {getError('phone') && <span className="text-xs text-red-500">{getError('phone')}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                    <SelectItem value="Lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Lead'}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
