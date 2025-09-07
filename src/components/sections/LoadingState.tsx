'use client';

import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20"
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            12 Week Year
          </h2>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-primary/20 to-primary rounded-full max-w-xs mx-auto"
        ></motion.div>
      </div>
    </motion.div>
  );
}

// Skeleton loader for cards
export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 rounded-2xl animate-pulse"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-muted rounded w-32"></div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>
      <div className="h-8 bg-muted rounded w-16 mb-2"></div>
      <div className="h-3 bg-muted rounded w-full mb-3"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-muted rounded w-20"></div>
        <div className="h-3 bg-muted rounded w-16"></div>
      </div>
    </motion.div>
  );
}

// Skeleton loader for task list
export function SkeletonTaskList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-card p-4 rounded-xl animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 bg-muted rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton loader for weekly overview
export function SkeletonWeeklyOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card p-6 rounded-2xl animate-pulse"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-6 bg-muted rounded"></div>
        <div className="h-6 bg-muted rounded w-40"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            className="p-4 rounded-xl bg-muted/30"
          >
            <div className="h-5 bg-muted rounded w-16 mb-2"></div>
            <div className="h-8 bg-muted rounded w-12 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full mb-3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
