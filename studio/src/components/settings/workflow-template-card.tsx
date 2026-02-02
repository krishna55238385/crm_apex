
'use client';

import type { WorkflowTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Zap, Eye, Shield, Sparkles, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface WorkflowTemplateCardProps {
    template: WorkflowTemplate;
    onUse?: () => void;
}

export const WorkflowTemplateCard = ({ template, onUse }: WorkflowTemplateCardProps) => {
    const riskColor = {
        Low: "text-green-600 bg-green-500/10 border-green-500/20",
        Medium: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20",
        High: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    };

    return (
        <Dialog>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="font-headline text-base">{template.name}</CardTitle>
                        {template.hasAi && <Badge variant="outline" className="border-yellow-400/50 text-yellow-500 flex items-center gap-1"><Sparkles className="h-3 w-3" />AI</Badge>}
                    </div>
                    <CardDescription className="text-xs !mt-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Play className="h-4 w-4" />
                        <span className="font-semibold">Trigger:</span>
                        <span>{template.triggerSummary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        <span className="font-semibold">Actions:</span>
                        <span>{template.actionSummary}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Badge variant="outline" className={riskColor[template.riskLevel]}>
                        <Shield className="h-3 w-3 mr-1.5" />
                        {template.riskLevel} Risk
                    </Badge>
                    <div className="flex gap-2">
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1.5" />Preview</Button>
                        </DialogTrigger>
                        <Button size="sm" onClick={onUse}><PlusCircle className="h-4 w-4 mr-1.5" />Use Template</Button>
                    </div>
                </CardFooter>
            </Card>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {template.name}
                        {template.hasAi && <Badge variant="outline" className="border-yellow-400/50 text-yellow-500 text-xs font-normal"><Sparkles className="h-3 w-3 mr-1" />AI Powered</Badge>}
                    </DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <h4 className="font-medium flex items-center gap-2"><Play className="h-4 w-4 text-primary" /> Trigger Condition</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{template.triggerSummary}</p>
                    </div>
                    <div className="grid gap-2">
                        <h4 className="font-medium flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Automated Actions</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{template.actionSummary}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Risk Level:</span>
                            <Badge variant="outline" className={riskColor[template.riskLevel]}>{template.riskLevel}</Badge>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onUse} className="w-full sm:w-auto"><PlusCircle className="h-4 w-4 mr-2" />Use This Template</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
