import { FollowUp } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FollowUpCardProps {
    followUp: FollowUp;
    onStatusChange?: (id: string, newStatus: FollowUp['status']) => void;
}

const getStatusColor = (status: FollowUp['status']) => {
    switch (status) {
        case 'Overdue': return 'destructive';
        case 'Due': return 'secondary';
        case 'Completed': return 'default';
        default: return 'outline';
    }
};

export default function FollowUpCard({ followUp, onStatusChange }: FollowUpCardProps) {
    return (
        <Card className="mb-4 last:mb-0">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-semibold">{followUp.title}</CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                            {followUp.lead?.name && <span className="mr-2">Lead: {followUp.lead.name}</span>}
                        </div>
                    </div>
                    <Badge variant={getStatusColor(followUp.status)}>{followUp.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(parseISO(followUp.dueDate), "MMM d, h:mm a")}</span>
                        </div>
                        {followUp.priorityScore > 75 && (
                            <div className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>High Priority</span>
                            </div>
                        )}
                    </div>

                    {followUp.status !== 'Completed' && onStatusChange && (
                        <Button size="sm" variant="ghost" onClick={() => onStatusChange(followUp.id, 'Completed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete
                        </Button>
                    )}
                </div>
                {followUp.aiSuggestedMessage && (
                    <div className="mt-3 bg-muted/50 p-2 rounded text-xs italic">
                        AI Suggestion: "{followUp.aiSuggestedMessage}"
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
