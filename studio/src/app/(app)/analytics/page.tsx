'use client';
import { useState, useEffect } from 'react';

import { fetchAnalytics, fetchLeads, fetchDashboardStats } from '@/lib/api';
import AnalyticsView from '@/components/analytics/analytics-view';
import type { Analytics, Lead, PaginatedResponse } from '@/lib/types';
import type { DashboardStats } from '@/lib/api'; // It's exported from api.ts

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    analytics: Analytics | null;
    leads: Lead[] | null;
    dashboardStats: DashboardStats | null;
  }>({
    analytics: null,
    leads: null,
    dashboardStats: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analytics, leadsResponse, dashboardStats] = await Promise.all([
          fetchAnalytics(),
          fetchLeads(),
          fetchDashboardStats()
        ]);
        setData({ analytics, leads: leadsResponse.data || [], dashboardStats });
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data.analytics || !data.leads || !data.dashboardStats) {
    return <div>Failed to load data</div>;
  }

  return (
    <AnalyticsView
      analytics={data.analytics}
      leads={data.leads}
      pipelineData={data.dashboardStats.pipelineByStage}
    />
  );
}
