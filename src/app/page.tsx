'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DashboardHeader,
  OverviewCards,
  TaskManagement,
  WeeklyOverview,
  MotivationalSidebar,
  LoadingState,
  ErrorState,
  VisionSection
} from '@/components/sections';
import { useStore } from '@/store/useStore';

export default function Dashboard() {
  const { weeklyPlans, tasks, vision, getOverallProgress, isLoading, error, loadTasks, loadWeeklyPlans, loadVision, resetDailyTasks } = useStore();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const overallProgress = getOverallProgress();

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadTasks(), loadWeeklyPlans(), loadVision()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks and weekly plans from API
        await Promise.all([
          useStore.getState().loadTasks(),
          useStore.getState().loadWeeklyPlans(),
          useStore.getState().loadVision(),
        ]);

        // Reset daily tasks if needed
        await useStore.getState().resetDailyTasks();

        // Initialize database if no tasks exist
        const tasks = useStore.getState().tasks;
        const weeklyPlans = useStore.getState().weeklyPlans;

        if (tasks.length === 0 || weeklyPlans.length === 0) {
          console.log('No data found, initializing database...');
          try {
            await fetch('/api/init');
            // Reload data after initialization
            await Promise.all([
              useStore.getState().loadTasks(),
              useStore.getState().loadWeeklyPlans(),
              useStore.getState().loadVision(),
            ]);
          } catch (error) {
            console.error('Failed to initialize database:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const getCurrentDateRange = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

    return {
      start: weekStart.toLocaleDateString(),
      end: weekEnd.toLocaleDateString(),
    };
  };

  const dateRange = getCurrentDateRange();

  // Handle week selection
  const handleWeekClick = (weekNumber: number) => {
    setSelectedWeek(selectedWeek === weekNumber ? null : weekNumber);
  };

  // Get tasks for selected week
  const getSelectedWeekTasks = () => {
    if (!selectedWeek) return [];
    const selectedPlan = weeklyPlans.find(plan => plan.weekNumber === selectedWeek);
    if (!selectedPlan) return [];

    return tasks.filter(task =>
      selectedPlan.tasks.some(planTask => planTask.id === task.id)
    );
  };

  const selectedWeekTasks = getSelectedWeekTasks();

  // Show loading state
  if (isLoading && tasks.length === 0) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <DashboardHeader
          currentWeek={currentWeek}
          dateRange={dateRange}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />

        {/* Vision Section */}
        <VisionSection />

        {/* Overview Cards */}
        <OverviewCards
          overallProgress={overallProgress}
          currentWeek={currentWeek}
          tasks={tasks}
        />

        {/* Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskManagement
              currentWeek={currentWeek}
              overallProgress={overallProgress}
              tasks={tasks}
              isLoading={isLoading}
            />
          </div>

          {/* Motivational Sidebar */}
          <MotivationalSidebar
            overallProgress={overallProgress}
            tasks={tasks}
          />
        </div>

        {/* Weekly Overview */}
        <WeeklyOverview
          weeklyPlans={weeklyPlans}
          tasks={tasks}
          currentWeek={currentWeek}
          selectedWeek={selectedWeek}
          onWeekClick={handleWeekClick}
          onCloseDetails={() => setSelectedWeek(null)}
        />
      </div>
    </motion.div>
  );
}
