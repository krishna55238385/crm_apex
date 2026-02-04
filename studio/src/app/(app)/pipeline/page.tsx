'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from '@/components/Pipeline/DealCard';
import { PipelineColumn } from '@/components/Pipeline/PipelineColumn';

interface Deal {
  id: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  leads: {
    name: string;
    email: string;
    company: string;
    temperature: string;
  };
  users?: {
    name: string;
    email: string;
  };
}

interface PipelineData {
  pipeline: Record<string, Deal[]>;
  stats: {
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    wonValue: number;
    activeDeals: number;
  };
}

const STAGES = [
  { id: 'Prospecting', label: 'Prospecting', color: '#6366f1' },
  { id: 'Qualification', label: 'Qualification', color: '#8b5cf6' },
  { id: 'Proposal', label: 'Proposal', color: '#ec4899' },
  { id: 'Negotiation', label: 'Negotiation', color: '#f59e0b' },
  { id: 'Closed - Won', label: 'Closed Won', color: '#10b981' },
  { id: 'Closed - Lost', label: 'Closed Lost', color: '#ef4444' },
];

export default function PipelinePage() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch pipeline data on mount
  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const response = await fetch('/api/v1/pipeline');
      const data = await response.json();
      setPipelineData(data);
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = findDeal(active.id as string);
    setActiveDeal(deal);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !pipelineData) return;

    const dealId = active.id as string;
    const newStage = over.id as string;

    // Optimistic update
    const updatedPipeline = { ...pipelineData.pipeline };
    const deal = findDeal(dealId);

    if (deal && deal.stage !== newStage) {
      // Remove from old stage
      updatedPipeline[deal.stage] = updatedPipeline[deal.stage].filter(d => d.id !== dealId);

      // Add to new stage
      deal.stage = newStage;
      updatedPipeline[newStage] = [...(updatedPipeline[newStage] || []), deal];

      setPipelineData({ ...pipelineData, pipeline: updatedPipeline });

      // Update backend
      try {
        await fetch(`/api/v1/deals/${dealId}/stage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: mapStageToEnum(newStage) }),
        });
      } catch (error) {
        console.error('Failed to update deal stage:', error);
        // Revert on error
        fetchPipeline();
      }
    }

    setActiveDeal(null);
  };

  const findDeal = (dealId: string): Deal | null => {
    if (!pipelineData) return null;

    for (const deals of Object.values(pipelineData.pipeline)) {
      const deal = deals.find(d => d.id === dealId);
      if (deal) return deal;
    }
    return null;
  };

  const mapStageToEnum = (stage: string): string => {
    const mapping: Record<string, string> = {
      'Prospecting': 'Prospecting',
      'Qualification': 'Qualification',
      'Proposal': 'Proposal',
      'Negotiation': 'Negotiation',
      'Closed - Won': 'Closed___Won',
      'Closed - Lost': 'Closed___Lost',
    };
    return mapping[stage] || stage;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!pipelineData) {
    return <div>Failed to load pipeline</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Deals</div>
          <div className="text-2xl font-bold">{pipelineData.stats.totalDeals}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold">${pipelineData.stats.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Won Deals</div>
          <div className="text-2xl font-bold text-green-600">{pipelineData.stats.wonDeals}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Won Value</div>
          <div className="text-2xl font-bold text-green-600">${pipelineData.stats.wonValue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Active Deals</div>
          <div className="text-2xl font-bold text-blue-600">{pipelineData.stats.activeDeals}</div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={pipelineData.pipeline[stage.id] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
