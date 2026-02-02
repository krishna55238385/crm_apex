import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RepPerformanceData {
  id: string;
  name: string;
  avatar_url: string;
  dealsWon: number;
  revenueGenerated: number;
  pipelineValue: number;
  tasksCompleted: number;
  conversionRate: number;
}

interface SalesRepPerformanceProps {
  data: RepPerformanceData[];
}

export default function SalesRepPerformance({ data = [] }: SalesRepPerformanceProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sales Rep</TableHead>
          <TableHead className="text-right">Deals Won</TableHead>
          <TableHead className="text-right">Pipeline</TableHead>
          <TableHead className="text-right">Tasks Done</TableHead>
          <TableHead className="text-right">Win Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((rep) => (
          <TableRow key={rep.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={rep.avatar_url} />
                  <AvatarFallback>{rep.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{rep.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">{rep.dealsWon}</TableCell>
            <TableCell className="text-right">${(Number(rep.pipelineValue) / 1000).toFixed(0)}k</TableCell>
            <TableCell className="text-right">{rep.tasksCompleted}</TableCell>
            <TableCell className="text-right">{Number(rep.conversionRate).toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
