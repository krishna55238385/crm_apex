"use client";

import type { FollowUp } from "@/lib/types";
import FollowUpItem from "./follow-up-item";
import { AnimatePresence, motion } from "framer-motion";

interface FollowUpListProps {
  items: FollowUp[];
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export default function FollowUpList({ items, selectionMode, selectedIds, onToggleSelect }: FollowUpListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px] bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No follow-ups in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
            transition={{ delay: index * 0.05 }}
          >
            <FollowUpItem
              item={item}
              selectionMode={selectionMode}
              isSelected={selectedIds?.has(item.id)}
              onToggleSelect={() => onToggleSelect && onToggleSelect(item.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
