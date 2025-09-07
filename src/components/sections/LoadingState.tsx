'use client';

import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
        ></motion.div>
        <p className="text-muted-foreground">Loading your 12 Week Year dashboard...</p>
      </div>
    </motion.div>
  );
}
