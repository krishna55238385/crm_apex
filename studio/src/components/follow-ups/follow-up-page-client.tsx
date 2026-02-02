"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, X, CheckSquare, Square, CheckCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { FollowUp, FollowUpStatus } from "@/lib/types";
import FollowUpList from "@/components/follow-ups/follow-up-list";
import AddFollowUpSheet from "@/components/follow-ups/add-follow-up-sheet";
import ViewOptions from "@/components/follow-ups/view-options";
import FocusModeCard from "@/components/follow-ups/focus-mode-card";
import { cn } from "@/lib/utils";
import { updateFollowUp } from "@/lib/api";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";

interface FollowUpPageClientProps {
    initialItems: FollowUp[];
}

export default function FollowUpPageClient({ initialItems }: FollowUpPageClientProps) {
    const router = useRouter();
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const [activeFilters, setActiveFilters] = useState<{
        type: 'all' | 'Call' | 'Email' | 'Task';
        highPriority: boolean;
        highValue: boolean;
    }>({
        type: 'all',
        highPriority: false,
        highValue: false,
    });

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedIds(new Set());
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkComplete = async () => {
        if (selectedIds.size === 0) return;
        setIsBulkProcessing(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => updateFollowUp(id, { status: 'Completed' })));
            router.refresh();
            setSelectionMode(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkReschedule = async () => {
        if (selectedIds.size === 0) return;
        setIsBulkProcessing(true);
        try {
            const tomorrow = addDays(new Date(), 1).toISOString();
            await Promise.all(Array.from(selectedIds).map(id => updateFollowUp(id, { dueDate: tomorrow, status: 'Upcoming' })));
            router.refresh();
            setSelectionMode(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const filteredItems = useMemo(() => {
        // ... (existing logic)
        return initialItems.filter(item => {
            // Filter by Type
            if (activeFilters.type !== 'all' && item.actionType !== activeFilters.type) {
                return false;
            }

            // Filter by High Priority
            if (activeFilters.highPriority && item.priorityScore <= 70) {
                return false;
            }

            // Filter by High Value Deal (> $10k)
            if (activeFilters.highValue) {
                const dealValue = item.deal?.value || 0;
                if (dealValue <= 10000) return false;
            }

            return true;
        });
    }, [initialItems, activeFilters]);

    // Group items by status
    const groupedItems = useMemo(() => {
        const grouped = filteredItems.reduce((acc, item) => {
            const status = item.status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(item);
            return acc;
        }, {} as Record<FollowUpStatus, FollowUp[]>);

        return {
            'Overdue': grouped['Overdue'] || [],
            'Due': grouped['Due'] || [],
            'Upcoming': grouped['Upcoming'] || [],
            'Completed': grouped['Completed'] || [],
        };
    }, [filteredItems]);

    const toggleTypeFilter = (type: 'Call' | 'Email') => {
        setActiveFilters(prev => ({
            ...prev,
            type: prev.type === type ? 'all' : type
        }));
    };

    const toggleHighPriority = () => {
        setActiveFilters(prev => ({
            ...prev,
            highPriority: !prev.highPriority
        }));
    };

    const toggleHighValue = () => {
        setActiveFilters(prev => ({
            ...prev,
            highValue: !prev.highValue
        }));
    };

    const clearFilters = () => {
        setActiveFilters({
            type: 'all',
            highPriority: false,
            highValue: false,
        });
    };

    const hasActiveFilters = activeFilters.type !== 'all' || activeFilters.highPriority || activeFilters.highValue;

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Follow-ups</h1>
                    <p className="text-muted-foreground">Your intelligent sales execution engine.</p>
                </div>
                <div className="flex gap-2">
                    <ViewOptions />
                    <AddFollowUpSheet>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Follow-up
                        </Button>
                    </AddFollowUpSheet>
                </div>
            </div>

            {/* Smart Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2 flex items-center">
                    <Filter className="w-3 h-3 mr-1" /> Filters:
                </span>

                <Badge
                    variant={activeFilters.type === 'Call' ? "default" : "outline"}
                    className={cn("cursor-pointer select-none", activeFilters.type === 'Call' ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : "hover:bg-accent")}
                    onClick={() => toggleTypeFilter('Call')}
                >
                    📞 Calls Only
                </Badge>

                <Badge
                    variant={activeFilters.type === 'Email' ? "default" : "outline"}
                    className={cn("cursor-pointer select-none", activeFilters.type === 'Email' ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : "hover:bg-accent")}
                    onClick={() => toggleTypeFilter('Email')}
                >
                    ✉️ Emails Only
                </Badge>

                <Badge
                    variant={activeFilters.highPriority ? "default" : "outline"}
                    className={cn("cursor-pointer select-none", activeFilters.highPriority ? "bg-amber-600 hover:bg-amber-700 text-white border-transparent" : "hover:bg-accent")}
                    onClick={toggleHighPriority}
                >
                    🔥 High Priority
                </Badge>

                <Badge
                    variant={activeFilters.highValue ? "default" : "outline"}
                    className={cn("cursor-pointer select-none", activeFilters.highValue ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" : "hover:bg-accent")}
                    onClick={toggleHighValue}
                >
                    💰 High Value (+$10k)
                </Badge>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3 mr-1" /> Clear
                    </Button>
                )}
            </div>

            {isFocusMode ? (
                <FocusModeCard items={groupedItems['Due'].concat(groupedItems['Overdue'])} onExit={() => setIsFocusMode(false)} />
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <Button
                            variant={selectionMode ? "secondary" : "ghost"}
                            size="sm"
                            className={cn("gap-2", selectionMode && "bg-blue-100 text-blue-800 hover:bg-blue-200")}
                            onClick={toggleSelectionMode}
                        >
                            {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            {selectionMode ? "Cancel Selection" : "Select Multiple"}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => setIsFocusMode(true)}
                        >
                            🎯 Enter Focus Mode
                        </Button>
                    </div>

                    {selectionMode && selectedIds.size > 0 && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border shadow-xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
                            <span className="font-semibold text-sm">{selectedIds.size} Selected</span>
                            <div className="h-4 w-px bg-border" />
                            <Button size="sm" onClick={handleBulkComplete} disabled={isBulkProcessing} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Done
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleBulkReschedule} disabled={isBulkProcessing} className="rounded-full">
                                <Clock className="w-4 h-4 mr-2" /> Snooze 1 Day
                            </Button>
                        </div>
                    )}

                    <Tabs defaultValue="due" className="flex-grow flex flex-col">
                        <TabsList className="w-full sm:w-auto self-start">
                            <TabsTrigger value="due">Due Now ({groupedItems['Due'].length})</TabsTrigger>
                            <TabsTrigger value="overdue">Overdue ({groupedItems['Overdue'].length})</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming ({groupedItems['Upcoming'].length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="due" className="flex-grow">
                            <FollowUpList items={groupedItems['Due']} selectionMode={selectionMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
                        </TabsContent>
                        <TabsContent value="overdue" className="flex-grow">
                            <FollowUpList items={groupedItems['Overdue']} selectionMode={selectionMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
                        </TabsContent>
                        <TabsContent value="upcoming" className="flex-grow">
                            <FollowUpList items={groupedItems['Upcoming']} selectionMode={selectionMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
                        </TabsContent>
                    </Tabs>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="completed">
                            <AccordionTrigger className="text-base font-medium">
                                Completed ({groupedItems['Completed'].length})
                            </AccordionTrigger>
                            <AccordionContent>
                                <FollowUpList items={groupedItems['Completed']} selectionMode={selectionMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </>
            )}
        </div>
    );
}
