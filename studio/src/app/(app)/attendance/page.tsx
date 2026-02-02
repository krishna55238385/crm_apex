'use client';

import { useState, useEffect } from "react";
import TeamOverview from "@/components/attendance/team-overview";
import AttendanceCard from "@/components/attendance/attendance-card";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle, LogOut, Clock } from "lucide-react";
import { fetchAttendance, checkIn, checkOut } from "@/lib/api";
import { AttendanceRecord, EmployeePerformance } from "@/lib/types";
import { toast } from "sonner";

export default function AttendancePage() {
  const { user, hasRole } = useAuth();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  async function loadData() {
    try {
      const data = await fetchAttendance();
      setAttendance(data);

      // Transform to EmployeePerformance (Basic Aggregation)
      // Group by User
      const userMap = new Map<string, { user: any; present: number; absent: number; late: number; totalHours: number }>();

      data.forEach(record => {
        if (!userMap.has(record.user.id)) {
          userMap.set(record.user.id, { user: record.user, present: 0, absent: 0, late: 0, totalHours: 0 });
        }
        const stats = userMap.get(record.user.id)!;
        if (record.status === 'Present') stats.present++;
        if (record.status === 'Absent') stats.absent++;
        if (record.status === 'Late') stats.late++;

        if (record.checkInTime && record.checkOutTime) {
          const start = new Date(record.checkInTime).getTime();
          const end = new Date(record.checkOutTime).getTime();
          const hours = (end - start) / (1000 * 60 * 60);
          if (hours > 0) stats.totalHours += hours;
        }
      });

      // Ensure current user is in the list
      if (user) {
        if (!userMap.has(user.id)) {
          userMap.set(user.id, {
            user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role, email: user.email },
            present: 0, absent: 0, late: 0, totalHours: 0
          });
        }

        // Find today's record for current user
        const isSameDay = (d1: Date | string, d2: Date) => {
          const date1 = new Date(d1);
          return date1.getDate() === d2.getDate() &&
            date1.getMonth() === d2.getMonth() &&
            date1.getFullYear() === d2.getFullYear();
        };

        const record = data.find(r => r.user.id === user.id && isSameDay(r.date, new Date()));
        setTodayRecord(record || null);
      }

      const perfData: EmployeePerformance[] = Array.from(userMap.values()).map(stat => ({
        user: stat.user,
        attendance: {
          daysPresent: stat.present,
          absences: stat.absent,
          lateArrivals: stat.late,
          averageHours: stat.present > 0 ? stat.totalHours / stat.present : 0
        },
        performance: {
          tasksCompleted: 0,
          followUpsCompleted: 0,
          dealsProgressed: 0,
          dealsClosed: 0,
          missedFollowUps: 0
        },
        burnoutRisk: 'Low'
      }));

      setPerformanceData(perfData);

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setIsLoadingAction(true);
    try {
      await checkIn(user.id);
      toast.success("Checked in successfully");
      await loadData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setIsLoadingAction(true);
    try {
      await checkOut(user.id);
      toast.success("Checked out successfully");
      await loadData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Attendance & Performance</h1>
          <p className="text-muted-foreground">Track team availability and productivity insights.</p>
        </div>
        <div className="flex items-center gap-2">
          {todayRecord ? (
            todayRecord.checkOutTime ? (
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Shift Completed ({formatTime(todayRecord.checkOutTime)})
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Checked In ({formatTime(todayRecord.checkInTime)})
                </p>
                <Button variant="outline" size="sm" onClick={handleCheckOut} disabled={isLoadingAction}>
                  <LogOut className="mr-2 h-4 w-4" /> Check Out
                </Button>
              </>
            )
          ) : (
            <Button size="sm" onClick={handleCheckIn} disabled={isLoadingAction}>
              <Clock className="mr-2 h-4 w-4" /> Check In
            </Button>
          )}
        </div>
      </div>

      {hasRole(['admin', 'super_admin']) ? (
        <Tabs defaultValue="team-view">
          <TabsList>
            <TabsTrigger value="team-view">Team View</TabsTrigger>
            <TabsTrigger value="my-view">My View</TabsTrigger>
          </TabsList>
          <TabsContent value="team-view" className="space-y-6">
            <TeamOverview performanceData={performanceData} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {performanceData.map(employee => (
                <AttendanceCard key={employee.user.id} employee={employee} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="my-view">
            <div className="max-w-2xl">
              {performanceData.length > 0 && user ? (
                <AttendanceCard employee={performanceData.find(p => p.user.id === user.id) || performanceData[0]} />
              ) : (
                <p className="text-muted-foreground">No attendance data available.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="max-w-2xl">
          {performanceData.length > 0 && user ? (
            <AttendanceCard employee={performanceData.find(p => p.user.id === user.id) || performanceData[0]} />
          ) : (
            <p className="text-muted-foreground">Loading attendance data...</p>
          )}
        </div>
      )}
    </div>
  );
}
