"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/stat-card";
import DealPipelineOverview from "@/components/dashboard/deal-pipeline-overview";
import SalesRepPerformance from "@/components/analytics/sales-rep-performance";
import LeadsBySourceChart from "@/components/analytics/leads-by-source-chart";
import AnalyticsLiveUpdater from "@/components/analytics/analytics-live-updater";
import { Download, DollarSign, Users, Target, Activity, Sparkles, Calendar as CalendarIcon, CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Analytics } from "@/lib/types";

interface AnalyticsViewProps {
    analytics: Analytics;
    leads: any[];
    pipelineData: { stage: string; count: number; value: number }[];
}

export default function AnalyticsView({ analytics, leads, pipelineData }: AnalyticsViewProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const totalRevenue = analytics.totalRevenue || 0;
    const conversionRate = analytics.conversionRate || 0;
    const avgDealSize = analytics.avgDealSize || 0;
    const newLeadsCount = analytics.newLeads || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Analytics & Insights</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-muted-foreground">Your command center for business performance.</p>
                        <AnalyticsLiveUpdater />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* AI Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" /> AI Summary for this Period
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 text-sm text-primary/90">
                    <p><strong>Pipeline health is strong.</strong> Deal progression has increased by 8% compared to the previous period.</p>
                    <p><strong>Follow-up delays are a concern.</strong> Overdue tasks have increased by {analytics.tasks.overdue}, potentially risking deals in the qualification stage.</p>
                    <p><strong>Priya Patel is a top converter.</strong> She has the highest lead-to-deal conversion rate on the team at 28% this month.</p>
                </CardContent>
            </Card>

            {/* Executive Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${(totalRevenue / 1000).toFixed(0)}k`}
                    icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    description="+15% from last month"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${conversionRate.toFixed(1)}%`}
                    icon={<Target className="h-5 w-5 text-muted-foreground" />}
                    description="-1.2% from last month"
                />
                <StatCard
                    title="Avg. Deal Size"
                    value={`$${(avgDealSize / 1000).toFixed(1)}k`}
                    icon={<Activity className="h-5 w-5 text-muted-foreground" />}
                    description="+3.4% from last month"
                />
                <StatCard
                    title="New Leads"
                    value={`${newLeadsCount}`}
                    icon={<Users className="h-5 w-5 text-muted-foreground" />}
                    description={`Total: ${analytics.totalLeads}`}
                />
            </div>

            {/* Operational Pulse */}
            <h2 className="text-xl font-bold font-headline tracking-tight mt-6">Operational Pulse</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tasks Completed"
                    value={`${analytics.tasks.completed}`}
                    icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                    description={`${((analytics.tasks.completed / (analytics.tasks.total || 1)) * 100).toFixed(0)}% completion rate`}
                    className="border-green-100 bg-green-50/30"
                />
                <StatCard
                    title="Overdue Tasks"
                    value={`${analytics.tasks.overdue}`}
                    icon={<AlertCircle className="h-5 w-5 text-red-600" />}
                    description={`${analytics.tasks.highPriority} High Priority`}
                    className="border-red-100 bg-red-50/30"
                />
                <StatCard
                    title="Follow-ups Done"
                    value={`${analytics.followUps.completed}`}
                    icon={<Clock className="h-5 w-5 text-blue-600" />}
                    description="Client Interactions"
                    className="border-blue-100 bg-blue-50/30"
                />
                <StatCard
                    title="Pending Action"
                    value={`${analytics.followUps.overdue}`}
                    icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
                    description="Overdue Follow-ups"
                    className="border-amber-100 bg-amber-50/30"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Deal Pipeline Overview</CardTitle>
                        <CardDescription>Value of deals in each stage of the sales pipeline.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <DealPipelineOverview data={pipelineData.map(d => ({ name: d.stage, value: d.value }))} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Leads by Source</CardTitle>
                        <CardDescription>Where your new leads are coming from.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LeadsBySourceChart />
                    </CardContent>
                </Card>
            </div>

            {/* Sales Rep Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Sales Rep Performance</CardTitle>
                    <CardDescription>A summary of key performance indicators for each sales representative.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SalesRepPerformance data={analytics.salesRepPerformance} />
                </CardContent>
            </Card>
        </div>
    );
}
