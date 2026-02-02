'use client';

import { useState, useEffect } from 'react';
import KanbanBoard from "@/components/pipeline/kanban-board";
import { fetchDeals, getPipelineStages } from "@/lib/api";
import AddDealSheet from "@/components/pipeline/add-deal-sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Deal } from "@/lib/types";

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dealsData, stagesData] = await Promise.all([
          fetchDeals(),
          getPipelineStages().then(s => Array.isArray(s) ? s.map(stage => stage.label as string) : [])
        ]);
        setDeals(dealsData);
        setStages(stagesData);
      } catch (error) {
        console.error("Failed to load pipeline data", error);
        // We could show a toast error here if we imported toast
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Default fallback if no stages configured or loading
  const dealStages = stages.length > 0 ? stages : ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost'];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 mb-6 flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">Visualize and manage your sales deals.</p>
        </div>
        <AddDealSheet>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Deal
          </Button>
        </AddDealSheet>
      </div>
      <div className="flex-1 min-h-0 min-w-0">
        <KanbanBoard deals={deals} stages={dealStages} />
      </div>
    </div>
  );
}
