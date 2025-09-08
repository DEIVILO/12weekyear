'use client';

import { motion } from 'framer-motion';
import { Calendar, FileText, CheckCircle2, X, Target } from 'lucide-react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateWeightedCompletion } from '@/store/useStore';

interface WeeklyOverviewProps {
  weeklyPlans: any[];
  tasks: any[];
  currentWeek: number;
  selectedWeek: number | null;
  onWeekClick: (weekNumber: number) => void;
  onCloseDetails: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.9
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

export function WeeklyOverview({
  weeklyPlans,
  tasks,
  currentWeek,
  selectedWeek,
  onWeekClick,
  onCloseDetails
}: WeeklyOverviewProps) {
  const getSelectedWeekTasks = () => {
    if (!selectedWeek) return [];
    const selectedPlan = weeklyPlans.find(plan => plan.weekNumber === selectedWeek);
    if (!selectedPlan) return [];

    // Only include recurring tasks for the current week
    const isCurrentWeek = selectedWeek === currentWeek;

    return tasks.filter(task => {
      if (task.taskType === 'week_specific') {
        return selectedPlan.tasks.some((planTask: any) => planTask.id === task.id);
      } else {
        // Only include recurring tasks for the current week
        return task.taskType === 'recurring' && isCurrentWeek;
      }
    });
  };

  const selectedWeekTasks = getSelectedWeekTasks();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      <UICard className="glass-card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{animationDelay: '0.5s'}}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-2 bg-primary/10 rounded-lg"
            >
              <Calendar className="w-5 h-5 text-primary" />
            </motion.div>
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No weekly plans found. Creating sample data...</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {weeklyPlans.map((plan, index) => {
                // Only include recurring tasks for the current week
                const isCurrentWeek = plan.weekNumber === currentWeek;
                const weekTasks = tasks.filter(task => {
                  if (task.taskType === 'week_specific') {
                    return plan.tasks.some((planTask: any) => planTask.id === task.id);
                  } else {
                    // Only include recurring tasks for the current week
                    return task.taskType === 'recurring' && isCurrentWeek;
                  }
                });

                // Use weighted completion calculation
                const { completionPercentage: weekProgress } = calculateWeightedCompletion(weekTasks);

                return (
                  <motion.div
                    key={plan.id}
                    variants={cardVariants}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onWeekClick(plan.weekNumber)}
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
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, delay: 1.5 }}
                        >
                          <Badge className="bg-primary hover:bg-primary/80 animate-pulse">
                            Current
                          </Badge>
                        </motion.div>
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
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Detailed Week View */}
          {selectedWeek && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 animate-fade-in"
            >
              <UICard className="glass-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                      >
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </motion.div>
                      Week {selectedWeek} - Detailed View
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onCloseDetails}
                        className="hover:scale-105 transition-transform"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedWeekTasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks found for Week {selectedWeek}</p>
                      <p className="text-sm mt-2">This week hasn't been planned yet.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Progress Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <UICard className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-4 text-center">
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                {selectedWeekTasks.filter(t => t.completed).length}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-500">Completed</div>
                            </CardContent>
                          </UICard>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <UICard className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                            <CardContent className="p-4 text-center">
                              <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                {selectedWeekTasks.filter(t => !t.completed).length}
                              </div>
                              <div className="text-sm text-red-600 dark:text-red-500">Incomplete</div>
                            </CardContent>
                          </UICard>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <UICard className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4 text-center">
                              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {Math.round(calculateWeightedCompletion(selectedWeekTasks).completionPercentage)}%
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-500">Success Rate</div>
                            </CardContent>
                          </UICard>
                        </motion.div>
                      </div>

                      {/* Task Details */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Task Details
                        </h3>

                        {/* Completed Tasks */}
                        {selectedWeekTasks.filter(t => t.completed).length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-2"
                          >
                            <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Completed Tasks
                            </h4>
                            {selectedWeekTasks.filter(t => t.completed).map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
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
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {/* Incomplete Tasks */}
                        {selectedWeekTasks.filter(t => !t.completed).length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                            className="space-y-2"
                          >
                            <h4 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                              <X className="w-4 h-4" />
                              Incomplete Tasks
                            </h4>
                            {selectedWeekTasks.filter(t => !t.completed).map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + index * 0.1 }}
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
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Week Summary */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-dashed"
                      >
                        <div className="text-center">
                          <h4 className="font-semibold mb-2">Week {selectedWeek} Summary</h4>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const { completedTasks, totalTasks, completionPercentage } = calculateWeightedCompletion(selectedWeekTasks);
                              const successRate = Math.round(completionPercentage);
                              return `${completedTasks} of ${totalTasks} tasks completed (${successRate}% success rate)`;
                            })()}
                          </p>
                          {calculateWeightedCompletion(selectedWeekTasks).isSuccessful && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, delay: 1.4 }}
                              className="mt-3 flex justify-center"
                            >
                              <Badge className="bg-green-500 hover:bg-green-600">
                                80% Success Threshold Met!
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </CardContent>
              </UICard>
            </motion.div>
          )}

          {/* Analytics Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-dashed"
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Track your 12-week journey with detailed progress analytics
              </p>
              <p className="text-xs text-muted-foreground">
                Each week builds momentum toward your annual goals
              </p>
            </div>
          </motion.div>
        </CardContent>
      </UICard>
    </motion.div>
  );
}
