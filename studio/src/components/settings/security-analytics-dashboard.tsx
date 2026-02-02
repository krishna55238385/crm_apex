
'use client';

import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/stat-card";
import { Download, AlertTriangle, CheckCircle, Bot, Sliders, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, Pie, PieChart, Tooltip, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const actionTypeChartConfig = {
  value: {
    label: "% of Actions",
  },
  Autonomous: {
    label: "Autonomous",
    color: "hsl(var(--chart-1))",
  },
  Approved: {
    label: "Approved",
    color: "hsl(var(--chart-3))",
  },
  Manual: {
    label: "Manual",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const highRiskChartConfig = {
  count: {
    label: "High-Risk Actions",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

const getRiskBadgeVariant = (risk: 'Medium' | 'High') => {
  switch (risk) {
    case 'Medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
  }
};


export default function SecurityAnalyticsDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalAiActions: 0,
    autonomousPercentage: 0,
    approvedPercentage: 0,
    highRiskCount: 0,
    rejectionRate: 0,
    rollbacksTriggered: 0,
  });
  const [anomalies, setAnomalies] = useState<any[]>([]);
  // Mock chart data for now as API might not return timeseries yet
  const [highRiskData] = useState([
    { date: '2024-07-01', count: 5 },
    { date: '2024-07-02', count: 8 },
    { date: '2024-07-03', count: 6 },
    { date: '2024-07-04', count: 12 },
    { date: '2024-07-05', count: 9 },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { fetchAiAnomalies } = await import("@/lib/api");
        const anomaliesData = await fetchAiAnomalies();
        setAnomalies(anomaliesData);

        // Simulate KPI data fetch or calculate from logs if available
        setKpiData({
          totalAiActions: 1245, // Placeholder
          autonomousPercentage: 35,
          approvedPercentage: 55,
          highRiskCount: anomaliesData.filter((a: any) => a.riskLevel === 'High').length,
          rejectionRate: 12,
          rollbacksTriggered: 3,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const actionTypeData = [
    { type: 'Autonomous', value: kpiData.autonomousPercentage },
    { type: 'Approved', value: kpiData.approvedPercentage },
    { type: 'Manual', value: 100 - kpiData.autonomousPercentage - kpiData.approvedPercentage },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-headline tracking-tight">AI Governance Dashboard</h2>
          <p className="text-muted-foreground">Monitor AI risk, performance, and autonomy trends.</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-full sm:w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : format(date.from, "LLL dd, y")) : (<span>Pick a date</span>)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total AI Actions" value={kpiData.totalAiActions.toLocaleString()} icon={<Bot className="h-5 w-5 text-muted-foreground" />} description="+15% this week" />
        <StatCard title="Autonomous %" value={`${kpiData.autonomousPercentage}%`} icon={<Sparkles className="h-5 w-5 text-muted-foreground" />} description="-2% this week" />
        <StatCard title="Approval Required %" value={`${kpiData.approvedPercentage}%`} icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />} description="+3% this week" />
        <StatCard title="High-Risk Actions" value={kpiData.highRiskCount.toString()} icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />} description="vs. 65 last week" />
        <StatCard title="Rejection Rate" value={`${kpiData.rejectionRate}%`} icon={<Sliders className="h-5 w-5 text-muted-foreground" />} description="Stable" />
        <StatCard title="Rollbacks" value={kpiData.rollbacksTriggered.toString()} icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />} description="1 this week" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">AI Actions by Type</CardTitle>
            <CardDescription>Breakdown of AI action autonomy.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={actionTypeChartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent hideLabel nameKey="type" />} />
                  <Pie data={actionTypeData} dataKey="value" nameKey="type" innerRadius={60} strokeWidth={5}>
                    {actionTypeData.map((entry) => (<Cell key={entry.type} fill={`var(--color-${entry.type})`} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">High-Risk Actions Over Time</CardTitle>
            <CardDescription>Daily count of AI actions classified as high-risk.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[250px] w-full">
            <ChartContainer config={highRiskChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={highRiskData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => format(new Date(value), 'd MMM')} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-count)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent AI Anomalies</CardTitle>
          <CardDescription>A summary of automatically detected abnormal AI behaviors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Anomaly</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell className="font-medium">{item.anomaly}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRiskBadgeVariant(item.riskLevel)}>{item.riskLevel}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
