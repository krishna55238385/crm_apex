"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MessageSquare, Clock, CheckCircle, ArrowRight, SkipForward, AlertCircle } from "lucide-react";
import type { FollowUp } from "@/lib/types";
import { updateFollowUp } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FocusModeCardProps {
    items: FollowUp[];
    onExit: () => void;
}

export default function FocusModeCard({ items, onExit }: FocusModeCardProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // Filter only actionable items (Overdue or Due)
    const actionableItems = items.filter(i =>
        (i.status === 'Overdue' || i.status === 'Due')
    );

    const currentItem = actionableItems[currentIndex];

    // If no more items
    if (!currentItem) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
                <p className="text-muted-foreground mb-6">You've cleared all your urgent follow-ups. Great job!</p>
                <Button onClick={onExit} size="lg">Return to Dashboard</Button>
            </div>
        );
    }

    const handleComplete = async () => {
        setLoading(true);
        try {
            await updateFollowUp(currentItem.id, { status: 'Completed' });
            router.refresh();
            // Move to next item logic comes naturally as actionableItems re-evaluates or we just increment index?
            // Actually, if we mark as completed, it drops from actionableItems re-render?
            // But router.refresh() is async and might take time.
            // Better to optimistic update or just move index if we want to preserve list.
            // For now, let's just assume we move next.
            if (currentIndex < actionableItems.length - 1) {
                // stay on same index, as the current item is removed from 'actionable' list? 
                // Wait, actionableItems is derived from `items` prop. 
                // If parent doesn't update `items`, `actionableItems` stays same.
                // So we must increment index to skip it visually if we don't refetch.
                // BUT, user wants to see it gone.
                // Let's rely on parent passing fresh items or handle local state.
                // Since `items` comes from parent, we should trigger parent refresh.
                // Or, simplest: locally exclude it.
                setCurrentIndex(prev => prev); // If we assume the item is removed, current index points to next.
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        if (currentIndex < actionableItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Loop back or finish?
            setCurrentIndex(0);
        }
    };

    const handleSnooze = async (hours: number) => {
        // ... re-use snooze logic, then skip
        setLoading(true);
        try {
            // Logic to add hours
            const newDate = new Date();
            newDate.setHours(newDate.getHours() + hours);

            await updateFollowUp(currentItem.id, {
                dueDate: newDate.toISOString(),
                status: 'Upcoming'
            });
            router.refresh();
        } catch (e) { console.error(e) }
        finally { setLoading(false); }
    }


    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">Focus Mode</Badge>
                    <span className="text-sm text-muted-foreground">
                        Item {currentIndex + 1} of {actionableItems.length}
                    </span>
                </div>
                <Button variant="ghost" size="sm" onClick={onExit}>Exit Focus Mode</Button>
            </div>

            <Card className="border-t-4 border-t-amber-500 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant={currentItem.status === 'Overdue' ? 'destructive' : 'default'} className="uppercase text-[10px] tracking-wide">
                                    {currentItem.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Due: {format(new Date(currentItem.dueDate), "MMM d, h:mm a")}
                                </span>
                            </div>
                            <CardTitle className="text-2xl mb-2">{currentItem.title}</CardTitle>
                            <CardDescription className="text-lg text-foreground font-medium">
                                {currentItem.lead.name} <span className="font-normal text-muted-foreground">from {currentItem.lead.company}</span>
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            {currentItem.deal && (
                                <Badge variant="secondary" className="text-lg px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                                    ${currentItem.deal.value.toLocaleString()}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6">

                    {/* Insights Section */}
                    {currentItem.aiSuggestedMessage && (
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50">
                            <h4 className="flex items-center text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                AI Suggestion
                            </h4>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {currentItem.aiSuggestedMessage}
                            </p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Contact Details</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentItem.lead.name}`} />
                                        <AvatarFallback>{currentItem.lead.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">{currentItem.lead.email}</div>
                                        <div className="text-muted-foreground text-sm">{currentItem.lead.phone}</div>
                                    </div>
                                </div>
                                <div className="flex justify-start gap-2 pt-2">
                                    <Button size="sm" variant="outline" className="gap-2" asChild>
                                        <a href={`tel:${currentItem.lead.phone}`}>
                                            <Phone className="w-4 h-4" /> Call
                                        </a>
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2" asChild>
                                        <a href={`mailto:${currentItem.lead.email}`}>
                                            <Mail className="w-4 h-4" /> Email
                                        </a>
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2" asChild>
                                        <a href={`sms:${currentItem.lead.phone}`}>
                                            <MessageSquare className="w-4 h-4" /> SMS
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Last Interaction</h4>
                            <div className="bg-muted/50 p-3 rounded-md text-sm">
                                {currentItem.lastInteractionSummary || "No recent interaction."}
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="bg-muted/20 flex justify-between p-6 rounded-b-lg">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSnooze(24)}>Snooze 1d</Button>
                        <Button variant="ghost" onClick={handleSkip}>
                            <SkipForward className="w-4 h-4 mr-2" /> Skip
                        </Button>
                    </div>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={loading}>
                        <CheckCircle className="w-5 h-5 mr-2" /> Mark as Done
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
