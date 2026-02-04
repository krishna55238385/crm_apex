'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    users?: {
        name: string;
    };
}

interface DealCardProps {
    deal: Deal;
    isDragging?: boolean;
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const temperatureColors: Record<string, string> = {
        Hot: 'bg-red-100 text-red-800',
        Warm: 'bg-orange-100 text-orange-800',
        Cold: 'bg-blue-100 text-blue-800',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
                }`}
        >
            {/* Deal Name */}
            <h4 className="font-semibold text-gray-900 mb-2">{deal.name}</h4>

            {/* Lead Info */}
            <div className="text-sm text-gray-600 mb-3">
                <div className="font-medium">{deal.leads.name}</div>
                <div className="text-xs">{deal.leads.company}</div>
            </div>

            {/* Value & Probability */}
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-gray-900">
                    ${deal.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                    {deal.probability}% likely
                </div>
            </div>

            {/* Temperature Badge */}
            <div className="flex items-center justify-between">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${temperatureColors[deal.leads.temperature] || 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {deal.leads.temperature}
                </span>

                {deal.users && (
                    <div className="text-xs text-gray-500">
                        {deal.users.name}
                    </div>
                )}
            </div>
        </div>
    );
}
