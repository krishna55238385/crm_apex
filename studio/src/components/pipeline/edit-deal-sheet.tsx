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
import { updateDeal } from "@/lib/api";
import { Deal, DealStage } from "@/lib/types";

interface EditDealSheetProps {
    deal: Deal;
    children: React.ReactNode;
    onSuccess?: () => void;
}

export default function EditDealSheet({ deal, children, onSuccess }: EditDealSheetProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dealStages, setDealStages] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            const loadStages = async () => {
                const { getPipelineStages } = await import("@/lib/api");
                const stages = await getPipelineStages();
                if (stages && stages.length > 0) {
                    setDealStages(stages.map(s => s.label));
                } else {
                    setDealStages(['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost']);
                }
            }
            loadStages();
        }
    }, [open]);

    const [formData, setFormData] = useState({
        name: deal.name,
        value: deal.value.toString(),
        stage: deal.stage,
        closeDate: deal.closeDate,
        probability: deal.probability.toString()
    });

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
            await updateDeal(deal.id, {
                name: formData.name,
                value: parseFloat(formData.value) || 0,
                stage: formData.stage as DealStage,
                closeDate: formData.closeDate,
                probability: parseInt(formData.probability) || 0,
            });

            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to update deal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Deal</SheetTitle>
                    <SheetDescription>
                        Update deal details.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Deal Name</Label>
                            <Input id="name" required value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Related Lead</Label>
                            <Input disabled value={deal.lead?.name || 'Unknown'} className="bg-muted" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Value ($)</Label>
                                <Input id="value" type="number" min="0" value={formData.value} onChange={handleChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="probability">Probability (%)</Label>
                                <Input id="probability" type="number" min="0" max="100" value={formData.probability} onChange={handleChange} />
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
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
