"use client"
import { Pie, PieChart, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const chartConfig = {
  count: {
    label: "Leads",
  },
  Organic: {
    label: "Organic",
    color: "hsl(var(--chart-1))",
  },
  Referral: {
    label: "Referral",
    color: "hsl(var(--chart-2))",
  },
  Paid: {
    label: "Paid",
    color: "hsl(var(--chart-3))",
  },
  Social: {
    label: "Social",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export default function LeadsBySourceChart() {
  const [data, setData] = useState<{ source: string, count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { fetchLeads, fetchAnalytics } = await import("@/lib/api");
        // Ideally we use analytics API, but fallback to manual aggregation if needed
        const analytics = await fetchAnalytics();

        if (analytics?.leadsBySource) {
          setData(analytics.leadsBySource);
        } else {
          // Fallback: Aggregate locally if API doesn't return pre-computed
          const leads = await fetchLeads();
          const aggregated = leads.reduce((acc: any[], lead: any) => {
            const source = lead.source || 'Unknown';
            const existing = acc.find(i => i.source === source);
            if (existing) existing.count++;
            else acc.push({ source, count: 1 });
            return acc;
          }, []);
          setData(aggregated);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="h-[250px] flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;
  if (data.length === 0) return <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data available</div>;

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="source"
            innerRadius={60}
            strokeWidth={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={(chartConfig as any)[entry.source]?.color || "hsl(var(--muted))"} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
