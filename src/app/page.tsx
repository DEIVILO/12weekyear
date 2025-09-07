'use client';

import { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Plus, Settings, Sparkles, CheckCircle2, Clock, Star, RefreshCw, AlertCircle, X, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TaskChecker } from '@/components/TaskChecker';
import { AddTaskForm } from '@/components/AddTaskForm';
import { ThemeToggle } from '@/components/theme-toggle';
import { useStore } from '@/store/useStore';

export default function Dashboard() {
  const { weeklyPlans, tasks, getOverallProgress, isLoading, error, loadTasks, loadWeeklyPlans, resetDailyTasks } = useStore();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const overallProgress = getOverallProgress();

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadTasks(), loadWeeklyPlans()]);
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your 12 Week Year dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between glass-card p-6 rounded-2xl">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  12 Week Year Dashboard
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span>Week {currentWeek} • {dateRange.start} - {dateRange.end}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="hover:scale-105 transition-transform"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Weekly Progress
              </CardTitle>
              <div className={`p-2 rounded-lg ${
                overallProgress >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                overallProgress >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <TrendingUp className={`h-4 w-4 ${
                  overallProgress >= 80 ? 'text-green-600' :
                  overallProgress >= 60 ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {Math.round(overallProgress)}%
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
              <Progress
                value={overallProgress}
                className={`h-3 ${
                  overallProgress >= 80 ? 'progress-success' :
                  overallProgress >= 60 ? 'progress-warning' :
                  'progress-info'
                }`}
              />
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Success Status
              </CardTitle>
              <div className={`p-2 rounded-lg ${
                overallProgress >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                'bg-gray-100 dark:bg-gray-900/30'
              }`}>
                {overallProgress >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {overallProgress >= 80 ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                      SUCCESS!
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">IN PROGRESS</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {overallProgress >= 80
                  ? 'Congratulations! Week successful!'
                  : `${Math.max(0, 80 - Math.round(overallProgress))}% more for success`
                }
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Current Week
              </CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                {currentWeek}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                of 12 total weeks
              </p>
              <Progress
                value={(currentWeek / 12) * 100}
                className="h-3 progress-info"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {12 - currentWeek} weeks remaining
                </span>
                <span className="text-xs font-medium">
                  {Math.round((currentWeek / 12) * 100)}% complete
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Task Checker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskChecker
              title={`Week ${currentWeek} Tasks`}
              showProgress={true}
              showSuccessBadge={true}
            />
            <AddTaskForm />
          </div>

          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="glass-card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">High Priority</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {tasks.filter(t => t.priority === 'high' && t.completed).length}/
                    {tasks.filter(t => t.priority === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Medium Priority</span>
                  </div>
                  <span className="font-bold text-yellow-600">
                    {tasks.filter(t => t.priority === 'medium' && t.completed).length}/
                    {tasks.filter(t => t.priority === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Low Priority</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {tasks.filter(t => t.priority === 'low' && t.completed).length}/
                    {tasks.filter(t => t.priority === 'low').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Message */}
            <Card className={`glass-card hover:shadow-xl transition-all duration-300 animate-fade-in ${
              overallProgress >= 80
                ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200 dark:border-green-800'
                : 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800'
            }`} style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`p-3 rounded-full mx-auto mb-4 ${
                    overallProgress >= 80
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Target className={`w-8 h-8 ${
                      overallProgress >= 80 ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <h3 className={`font-bold text-lg mb-3 ${
                    overallProgress >= 80 ? 'text-green-900 dark:text-green-300' : 'text-blue-900 dark:text-blue-300'
                  }`}>
                    {overallProgress >= 80 ? 'Amazing Progress!' : 'Keep Going!'}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    overallProgress >= 80 ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {overallProgress >= 80
                      ? "You're crushing it! Stay consistent and you'll achieve your goals. Every step forward is a victory!"
                      : "Every completed task brings you closer to success. Focus on progress, not perfection. You've got this!"
                    }
                  </p>
                  {overallProgress >= 80 && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-200 dark:bg-green-800/50 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-300" />
                        <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                          SUCCESS ACHIEVED!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Overview */}
        <Card className="glass-card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No weekly plans found. Creating sample data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {weeklyPlans.map((plan, index) => {
                  const weekTasks = tasks.filter(task =>
                    plan.tasks.some(planTask => planTask.id === task.id)
                  );
                  const weekProgress = weekTasks.length > 0
                    ? (weekTasks.filter(t => t.completed).length / weekTasks.length) * 100
                    : 0;
                  const isCurrentWeek = plan.weekNumber === currentWeek;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleWeekClick(plan.weekNumber)}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 animate-fade-in cursor-pointer ${
                        isCurrentWeek
                          ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                          : selectedWeek === plan.weekNumber
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg ring-2 ring-blue-500/20'
                          : 'border-muted bg-card hover:bg-accent/30'
                      }`}
                      style={{animationDelay: `${(index + 6) * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-lg">Week {plan.weekNumber}</span>
                        {isCurrentWeek && (
                          <Badge className="bg-primary hover:bg-primary/80 animate-pulse">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {Math.round(weekProgress)}%
                      </div>
                      <Progress
                        value={weekProgress}
                        className={`h-3 mb-3 ${
                          weekProgress >= 80 ? 'progress-success' :
                          weekProgress >= 60 ? 'progress-warning' :
                          weekProgress > 0 ? 'progress-info' :
                          'bg-muted'
                        }`}
                      />
                      {isCurrentWeek && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{weekTasks.filter(t => t.completed).length} of {weekTasks.length} tasks</span>
                          <span className="font-medium">
                            {Math.round(weekProgress)}% complete
                          </span>
                        </div>
                      )}
                      {!isCurrentWeek && weekTasks.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center mt-2">
                          No tasks yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Week View */}
            {selectedWeek && (
              <div className="mt-8 animate-fade-in">
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        Week {selectedWeek} - Detailed View
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWeek(null)}
                        className="hover:scale-105 transition-transform"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedWeekTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks found for Week {selectedWeek}</p>
                        <p className="text-sm mt-2">This week hasn't been planned yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Progress Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-4 text-center">
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                {selectedWeekTasks.filter(t => t.completed).length}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-500">Completed</div>
                            </CardContent>
                          </Card>

                          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                            <CardContent className="p-4 text-center">
                              <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                {selectedWeekTasks.filter(t => !t.completed).length}
                              </div>
                              <div className="text-sm text-red-600 dark:text-red-500">Incomplete</div>
                            </CardContent>
                          </Card>

                          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4 text-center">
                              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {Math.round((selectedWeekTasks.filter(t => t.completed).length / selectedWeekTasks.length) * 100)}%
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-500">Success Rate</div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Task Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Task Details
                          </h3>

                          {/* Completed Tasks */}
                          {selectedWeekTasks.filter(t => t.completed).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed Tasks
                              </h4>
                              {selectedWeekTasks.filter(t => t.completed).map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{task.title}</div>
                                    {task.description && (
                                      <div className="text-sm text-muted-foreground truncate">{task.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {task.frequency}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs ${
                                      task.priority === 'high' ? 'border-red-500 text-red-700' :
                                      task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                      'border-green-500 text-green-700'
                                    }`}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Incomplete Tasks */}
                          {selectedWeekTasks.filter(t => !t.completed).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                                <X className="w-4 h-4" />
                                Incomplete Tasks
                              </h4>
                              {selectedWeekTasks.filter(t => !t.completed).map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                                >
                                  <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{task.title}</div>
                                    {task.description && (
                                      <div className="text-sm text-muted-foreground truncate">{task.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {task.frequency}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs ${
                                      task.priority === 'high' ? 'border-red-500 text-red-700' :
                                      task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                      'border-green-500 text-green-700'
                                    }`}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Week Summary */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-dashed">
                          <div className="text-center">
                            <h4 className="font-semibold mb-2">Week {selectedWeek} Summary</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedWeekTasks.filter(t => t.completed).length} of {selectedWeekTasks.length} tasks completed
                              ({Math.round((selectedWeekTasks.filter(t => t.completed).length / selectedWeekTasks.length) * 100)}% success rate)
                            </p>
                            {selectedWeekTasks.filter(t => t.completed).length / selectedWeekTasks.length >= 0.8 && (
                              <div className="mt-3 flex justify-center">
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  80% Success Threshold Met!
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Footer */}
            <div className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Track your 12-week journey with detailed progress analytics
                </p>
                <p className="text-xs text-muted-foreground">
                  Each week builds momentum toward your annual goals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
