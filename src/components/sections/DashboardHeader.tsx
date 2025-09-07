'use client';

import { motion } from 'framer-motion';
import { Target, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardHeaderProps {
  currentWeek: number;
  dateRange: { start: string; end: string };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({
  currentWeek,
  dateRange,
  onRefresh,
  isRefreshing
}: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-between glass-card p-6 rounded-2xl"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="animate-fade-in"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2 bg-primary/10 rounded-lg"
          >
            <Target className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              12 Week Year Dashboard
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">Week {currentWeek} • {dateRange.start} - {dateRange.end}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="hover:scale-105 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <ThemeToggle />
      </motion.div>
    </motion.div>
  );
}
