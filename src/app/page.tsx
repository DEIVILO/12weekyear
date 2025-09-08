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
  VisionSection,
  SkeletonCard,
  SkeletonTaskList,
  SkeletonWeeklyOverview
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
      console.log('🔄 Page refresh detected, loading fresh data...');

      try {
        // First check if we have any data from localStorage
        const currentTasks = tasks.length;
        const currentPlans = weeklyPlans.length;
        console.log(`📊 Current localStorage data: ${currentTasks} tasks, ${currentPlans} plans`);

        // Load fresh data from API
        console.log('🌐 Loading fresh data from API...');
        await Promise.all([
          loadTasks(),
          loadWeeklyPlans(),
          loadVision(),
        ]);

        // Reset daily tasks if needed
        console.log('🔄 Resetting daily tasks...');
        await resetDailyTasks();

        // Check if we need to initialize database after loading
        const updatedTasks = useStore.getState().tasks;
        const updatedPlans = useStore.getState().weeklyPlans;
        console.log(`📊 After API load: ${updatedTasks.length} tasks, ${updatedPlans.length} plans`);

        // Only initialize if we still have no data after API calls
        if (updatedTasks.length === 0 && updatedPlans.length === 0) {
          console.log('🗄️ No data found after API load, initializing database...');
          try {
            await fetch('/api/init');
            // Reload data after initialization
            await Promise.all([
              loadTasks(),
              loadWeeklyPlans(),
              loadVision(),
            ]);
            console.log('✅ Database initialization complete');
          } catch (error) {
            console.error('❌ Failed to initialize database:', error);
          }
        } else {
          console.log('✅ Fresh data loaded successfully, no initialization needed');
        }
      } catch (error) {
        console.error('❌ Failed to load data:', error);
      }
    };

    loadData();
  }, [loadTasks, loadWeeklyPlans, loadVision, resetDailyTasks, tasks.length, weeklyPlans.length]);

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

  // Show full loading state only on initial load
  if (isLoading && tasks.length === 0 && weeklyPlans.length === 0) {
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <OverviewCards
            overallProgress={overallProgress}
            currentWeek={currentWeek}
            tasks={tasks}
          />
        )}

        {/* Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading && tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
                </div>
                <SkeletonTaskList />
              </motion.div>
            ) : (
              <TaskManagement
                currentWeek={currentWeek}
                overallProgress={overallProgress}
                tasks={tasks}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Motivational Sidebar */}
          <MotivationalSidebar
            overallProgress={overallProgress}
            tasks={tasks}
          />
        </div>

        {/* Weekly Overview */}
        {isLoading && weeklyPlans.length === 0 ? (
          <SkeletonWeeklyOverview />
        ) : (
          <WeeklyOverview
            weeklyPlans={weeklyPlans}
            tasks={tasks}
            currentWeek={currentWeek}
            selectedWeek={selectedWeek}
            onWeekClick={handleWeekClick}
            onCloseDetails={() => setSelectedWeek(null)}
          />
        )}
      </div>
    </motion.div>
  );
}
