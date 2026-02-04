'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';

interface Deal {
    id: string;
    name: string;
    value: number;
    probability: number;
    leads: {
        name: string;
        company: string;
        temperature: string;
    };
}

interface PipelineColumnProps {
    stage: {
        id: string;
        label: string;
        color: string;
    };
    deals: Deal[];
}

export function PipelineColumn({ stage, deals }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    });

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 transition-colors ${isOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''
                }`}
        >
            {/* Column Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                        <span className="text-sm text-gray-500">({deals.length})</span>
                    </div>
                </div>
                <div className="text-sm text-gray-600">
                    ${totalValue.toLocaleString()}
                </div>
            </div>

            {/* Deals List */}
            <SortableContext
                items={deals.map(d => d.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3 min-h-[200px]">
                    {deals.map(deal => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                    {deals.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            Drop deals here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
