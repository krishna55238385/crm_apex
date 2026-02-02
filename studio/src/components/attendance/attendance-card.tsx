"use client";

import type { EmployeePerformance } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
  employee: EmployeePerformance;
}

const StatItem = ({ label, value, trend }: { label: string, value: string | number, trend?: 'up' | 'down' | null }) => (
    <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500"/>}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-amber-500"/>}
            <p className="text-sm font-semibold">{value}</p>
        </div>
    </div>
)

export default function AttendanceCard({ employee }: AttendanceCardProps) {
    const { user, attendance, performance, aiInsight, burnoutRisk } = employee;

    const getRiskColor = (risk: typeof burnoutRisk) => {
        if (risk === 'High') return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
        if (risk === 'Medium') return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
        return 'bg-green-500/20 text-green-600 border-green-500/30';
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="font-headline text-xl">{user.name}</CardTitle>
          <CardDescription className="flex items-center gap-4">
            <span>{user.email}</span>
            <Badge variant="outline" className={cn("capitalize", getRiskColor(burnoutRisk))}>
                {burnoutRisk} Burnout Risk
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-3 rounded-md border bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
                <Bot className="h-4 w-4"/> AI Insight
            </h4>
            <p className="text-sm text-primary/80 italic">"{aiInsight}"</p>
        </div>

        <div>
            <h4 className="font-semibold text-sm mb-2">This Month's Attendance</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <StatItem label="Days Present" value={attendance.daysPresent} />
                <StatItem label="Absences" value={attendance.absences} />
                <StatItem label="Late Arrivals" value={attendance.lateArrivals} trend={attendance.lateArrivals > 2 ? 'up' : null} />
                <StatItem label="Avg. Hours" value={`${attendance.averageHours.toFixed(1)}h`} />
            </div>
        </div>
        
        <div>
            <h4 className="font-semibold text-sm mb-2">This Month's Performance</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <StatItem label="Tasks Done" value={performance.tasksCompleted} trend="up" />
                <StatItem label="Follow-ups" value={performance.followUpsCompleted} />
                <StatItem label="Deals Progressed" value={performance.dealsProgressed} />
                <StatItem label="Missed Follow-ups" value={performance.missedFollowUps} trend={performance.missedFollowUps > 5 ? 'down' : null} />
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
