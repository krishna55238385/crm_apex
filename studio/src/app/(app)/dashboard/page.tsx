"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, Activity, Target } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import DealPipelineOverview from "@/components/dashboard/deal-pipeline-overview";
import TasksList from "@/components/dashboard/tasks-list";
import { fetchDashboardStats } from "@/lib/api";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setError(null);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      }
    };
    loadStats();
  }, []);

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-2 font-medium">Error loading dashboard</div>
        <div className="text-muted-foreground mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard stats...</div>;
  }

  // Transform API data for the chart
  const pipelineData = stats.pipelineByStage.map((item: any) => ({
    name: item.stage,
    value: Number(item.value)
  }));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold font-headline tracking-tight">
          Welcome Back, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground hidden md:block">Here's your sales overview for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.pipelineValue).replace(/\s/g, '')}
          icon={<DollarSign className="h-5 w-5" />}
          description="+5.2% from last month"
        />
        <StatCard
          title="New Leads"
          value={`+${stats.newLeads}`}
          icon={<Users className="h-5 w-5" />}
          description="From all sources"
        />
        <StatCard
          title="Deals Won"
          value={`${stats.dealsWon}`}
          icon={<Activity className="h-5 w-5" />}
          description="+12% from last month"
        />
        <StatCard
          title="Close Ratio"
          value={`${stats.closeRatio}%`}
          icon={<Target className="h-5 w-5" />}
          description="vs. 21.8% last month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Deal Pipeline Overview</CardTitle>
            <CardDescription>A summary of deals in each stage of your pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DealPipelineOverview data={pipelineData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Focus for Today</CardTitle>
            <CardDescription>Your AI-prioritized tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <TasksList tasks={stats.recentTasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
