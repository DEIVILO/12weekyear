'use client';

import { motion } from 'framer-motion';
import { TaskChecker } from '@/components/TaskChecker';

interface TaskManagementProps {
  currentWeek: number;
  overallProgress: number;
  tasks: any[];
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.6
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

export function TaskManagement({
  currentWeek,
  overallProgress,
  tasks,
  isLoading
}: TaskManagementProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <TaskChecker
          title={`Week ${currentWeek} Tasks`}
          showProgress={true}
          showSuccessBadge={true}
        />
      </motion.div>
    </motion.div>
  );
}
