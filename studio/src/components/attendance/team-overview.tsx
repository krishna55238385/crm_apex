"use client"

import type { EmployeePerformance } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart2, TrendingUp, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";

interface TeamOverviewProps {
  performanceData: EmployeePerformance[];
}

export default function TeamOverview({ performanceData }: TeamOverviewProps) {
  const totalUsers = performanceData.length;
  const presentToday = performanceData.filter(p => p.attendance.daysPresent > 20).length; // Mock logic
  const attendanceRate = (performanceData.reduce((acc, p) => acc + p.attendance.daysPresent, 0) / (totalUsers * 22)) * 100;
  const highRiskEmployees = performanceData.filter(p => p.burnoutRisk === 'High').length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Team Members"
        value={`${totalUsers}`}
        icon={<Users className="h-5 w-5 text-muted-foreground" />}
        description={`${presentToday} present today`}
      />
      <StatCard
        title="Attendance Rate"
        value={`${attendanceRate.toFixed(1)}%`}
        icon={<BarChart2 className="h-5 w-5 text-muted-foreground" />}
        description="This month"
      />
      <StatCard
        title="Productivity Trend"
        value="Up 3.2%"
        icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        description="vs. last month"
      />
      <StatCard
        title="Burnout Risk"
        value={`${highRiskEmployees} Employee${highRiskEmployees === 1 ? '' : 's'}`}
        icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        description="In 'High' risk category"
      />
    </div>
  );
}
