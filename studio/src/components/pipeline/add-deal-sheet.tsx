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
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDeal, fetchLeads } from "@/lib/api";
import { DealStage, Lead } from "@/lib/types";

export default function AddDealSheet({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        leadId: '',
        value: '',
        stage: 'Prospecting',
        closeDate: '',
        probability: 50
    });

    const [dealStages, setDealStages] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            const loadData = async () => {
                const [leadsData, stagesData] = await Promise.all([
                    fetchLeads(),
                    import("@/lib/api").then(mod => mod.getPipelineStages())
                ]);
                setLeads(leadsData);
                setDealStages(stagesData.map(s => s.label) || ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost']);
            };
            loadData();
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Find selected lead to get company/name context if needed, but backend usually handles linking
            const selectedLead = leads.find(l => l.id === formData.leadId);

            await createDeal({
                name: formData.name,
                leadId: formData.leadId, // Backend should handle linking
                value: parseFloat(formData.value) || 0,
                stage: formData.stage as DealStage,
                closeDate: formData.closeDate,
                probability: parseInt(formData.probability as any) || 50,
                // Mock owner for now, usually backend assigns current user
                ownerId: '1'
            });

            setOpen(false);
            setFormData({ name: '', leadId: '', value: '', stage: 'Prospecting', closeDate: '', probability: 50 });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to create deal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Deal</SheetTitle>
                    <SheetDescription>
                        Create a new deal in your pipeline. Link it to an existing lead.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Deal Name <span className="text-red-500">*</span></Label>
                            <Input id="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Enterprise License - Acme Corp" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="leadId">Related Lead <span className="text-red-500">*</span></Label>
                            <Select value={formData.leadId} onValueChange={(val) => handleSelectChange('leadId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a lead" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leads.map(lead => (
                                        <SelectItem key={lead.id} value={lead.id}>
                                            {lead.name} ({lead.company})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Value ($)</Label>
                                <Input id="value" type="number" min="0" value={formData.value} onChange={handleChange} placeholder="5000" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="probability">Probability (%)</Label>
                                <Input id="probability" type="number" min="0" max="100" value={formData.probability} onChange={handleChange} placeholder="50" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stage">Stage</Label>
                            <Select value={formData.stage} onValueChange={(val) => handleSelectChange('stage', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dealStages.map(stage => (
                                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="closeDate">Expected Close Date</Label>
                            <Input id="closeDate" type="date" value={formData.closeDate} onChange={handleChange} />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Deal'}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
