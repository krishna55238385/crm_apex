
"use client";

import type { Lead } from "@/lib/types";
import LeadCard from "./lead-card";
import { AnimatePresence, motion } from "framer-motion";

interface LeadsListProps {
  leads: Lead[];
  selectedLeads: string[];
  onSelectLead: (leadId: string, isSelected: boolean) => void;
  onRefresh?: () => void;
}

export default function LeadsList({ leads = [], selectedLeads, onSelectLead, onRefresh }: LeadsListProps) {
  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px] bg-muted/50 rounded-lg border border-dashed">
        <p className="text-lg font-medium">All clear!</p>
        <p className="text-muted-foreground">No leads in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {leads.map((lead, index) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
            transition={{ delay: index * 0.05 }}
          >
            <LeadCard
              lead={lead}
              isSelected={selectedLeads.includes(lead.id)}
              onSelect={(isSelected) => onSelectLead(lead.id, isSelected)}
              onRefresh={onRefresh}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
