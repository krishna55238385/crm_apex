"use client"

import type { Deal, DealStage } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { deleteDeal } from "@/lib/api";
import EditDealSheet from "./edit-deal-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/hooks/use-currency";

interface KanbanBoardProps {
  deals: Deal[];
  stages: DealStage[];
}

function DealCard({ deal, formatCurrency }: { deal: Deal; formatCurrency: (value: number) => string }) {
  const router = useRouter();
  const isHighValue = deal.value > 50000;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening edit sheet
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDeal(deal.id);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete deal", error);
        alert("Failed to delete deal");
      }
    }
  };

  return (
    <EditDealSheet deal={deal} onSuccess={() => router.refresh()}>
      <div className="cursor-pointer">
        <Card className="bg-card hover:bg-card/80 hover:shadow-md transition-all duration-300 border-border/60 group relative overflow-hidden">
          {isHighValue && <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden"><div className="absolute top-[6px] right-[-24px] w-[80px] text-[9px] font-bold text-center text-amber-700 bg-amber-200/60 rotate-45 border-y border-amber-300/50 uppercase tracking-wider">High Value</div></div>}

          <CardHeader className="p-3 pb-2 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">{deal.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Open Edit handled by wrapper */ }}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(deal.value)}</p>
              <p className="text-xs text-muted-foreground/80 line-clamp-1 truncate">{deal.lead?.company || 'Unknown Company'}</p>
            </div>
          </CardHeader>
          <CardFooter className="p-3 pt-2 flex justify-between items-center border-t border-border/30 bg-muted/20 mt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={deal.stage === 'Closed - Lost' ? 'text-red-500' : 'text-muted-foreground'}>{deal.closeDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">{deal.probability}%</span>
              <Avatar className="h-5 w-5 border border-background ring-1 ring-border/20">
                <AvatarImage src={deal.owner.avatarUrl} />
                <AvatarFallback className="text-[9px]">{deal.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </CardFooter>
        </Card>
      </div>
    </EditDealSheet>
  );
}

export default function KanbanBoard({ deals, stages }: KanbanBoardProps) {
  const { formatCurrency } = useCurrency();

  return (
    <ScrollArea className="h-full w-full rounded-[inherit]">
      <div className="flex gap-6 pb-4 min-w-min">
        {stages.map((stage) => {
          const dealsInStage = deals.filter((deal) => deal.stage === stage);
          const stageValue = dealsInStage.reduce((sum, deal) => sum + deal.value, 0);

          return (
            <div key={stage} className="w-80 flex-shrink-0">
              <div className="bg-muted/30 rounded-xl border border-border/50 h-full flex flex-col max-h-[calc(100vh-220px)]">
                {/* Column Header */}
                <div className="p-4 border-b border-border/40 bg-muted/40 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-foreground tracking-tight">{stage}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border border-border/60 text-muted-foreground">
                      {dealsInStage.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
                    {formatCurrency(stageValue)}
                  </p>
                </div>

                {/* Deals List */}
                <ScrollArea className="flex-grow">
                  <div className="p-3 flex flex-col gap-3">
                    {dealsInStage.map((deal) => (
                      <DealCard key={deal.id} deal={deal} formatCurrency={formatCurrency} />
                    ))}
                    {dealsInStage.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg m-1">
                        <p className="text-xs text-muted-foreground/50">No deals</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-3 bg-muted/50" />
    </ScrollArea>
  );
}
