
"use client";

import type { Task } from "@/lib/types";
import TaskItem from "./task-item";
import { AnimatePresence, motion } from "framer-motion";

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px] bg-muted/50 rounded-lg border border-dashed">
        <p className="text-lg font-medium">All clear!</p>
        <p className="text-muted-foreground">No tasks in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
            transition={{ delay: index * 0.05 }}
          >
            <TaskItem task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

    