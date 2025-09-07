'use client';

import { useState } from 'react';
import { Check, X, Trophy, Target, AlertCircle, Sparkles, TrendingUp, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { useTaskCompletion } from '@/store/useStore';

interface TaskCheckerProps {
  weekId?: string;
  title?: string;
  showProgress?: boolean;
  showSuccessBadge?: boolean;
  compact?: boolean;
}

export function TaskChecker({
  weekId,
  title = "Daily Tasks",
  showProgress = true,
  showSuccessBadge = true,
  compact = false
}: TaskCheckerProps) {
  const { tasks, weeklyPlans, toggleTask, getWeeklyCompletion } = useStore();

  // Get tasks for this week or all tasks if no weekId specified
  const weekTasks = weekId
    ? tasks.filter(task => {
        const weeklyPlan = weeklyPlans.find(plan =>
          plan.id === weekId && plan.tasks.some(pt => pt.id === task.id)
        );
        return weeklyPlan !== undefined;
      })
    : tasks;

  const { completionPercentage, isSuccessful } = useTaskCompletion(weekTasks);

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getSuccessIcon = () => {
    if (completionPercentage >= 80) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (completionPercentage >= 60) {
      return <Target className="w-5 h-5 text-blue-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return <Clock className="w-3 h-3 text-blue-500" />;
      case 'weekly':
        return <Calendar className="w-3 h-3 text-green-500" />;
      case 'once':
        return <CheckCircle2 className="w-3 h-3 text-purple-500" />;
      default:
        return null;
    }
  };

  const getSuccessMessage = () => {
    if (completionPercentage >= 80) {
      return "Excellent! Week successful!";
    } else if (completionPercentage >= 60) {
      return "Good progress! Keep going!";
    } else {
      return "Need more completion for success";
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'weekly':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'once':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800';
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{title}</span>
              {showSuccessBadge && (
                <Badge variant={isSuccessful ? "default" : "secondary"}>
                  {Math.round(completionPercentage)}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getSuccessIcon()}
              <span className="text-sm text-muted-foreground">
                {weekTasks.filter(t => t.completed).length}/{weekTasks.length}
              </span>
            </div>
          </div>
          {showProgress && (
            <Progress
              value={completionPercentage}
              className="mt-2 h-2"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full glass-card hover:shadow-xl transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isSuccessful ? 'bg-green-100 dark:bg-green-900/30' :
              completionPercentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {getSuccessIcon()}
            </div>
            <div>
              <span className="text-xl font-bold">{title}</span>
              {showSuccessBadge && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isSuccessful ? "default" : "secondary"} className="hover:scale-105 transition-transform">
                    {Math.round(completionPercentage)}%
                  </Badge>
                  {isSuccessful && (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      SUCCESS!
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {weekTasks.filter(t => t.completed).length} of {weekTasks.length} completed
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weekTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Add some tasks to get started!</p>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            {showProgress && (
              <div className="mb-8 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Completion Progress
                  </span>
                  <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <Progress
                  value={completionPercentage}
                  className={`h-4 rounded-full ${
                    isSuccessful ? 'progress-success' :
                    completionPercentage >= 60 ? 'progress-warning' :
                    'progress-info'
                  }`}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">
                    {getSuccessMessage()}
                  </span>
                  {isSuccessful && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 animate-pulse">
                        SUCCESS!
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-4">
              {weekTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-fade-in ${
                    task.completed
                      ? 'task-completed shadow-lg'
                      : `task-pending ${getFrequencyColor(task.frequency || 'weekly')}`
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={task.id}
                      className={`block font-medium cursor-pointer ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.title}
                    </label>
                    {task.description && (
                      <p className={`text-sm mt-1 ${
                        task.completed ? 'text-muted-foreground' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                      {task.frequency && (
                        <Badge variant="outline" className="text-xs">
                          <div className="flex items-center gap-1">
                            {getFrequencyIcon(task.frequency)}
                            <span className="capitalize">{task.frequency}</span>
                          </div>
                        </Badge>
                      )}
                      {task.category && (
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.completed && (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 p-6 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    isSuccessful ? 'bg-green-100 dark:bg-green-900/30' :
                    completionPercentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {isSuccessful ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Target className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Weekly Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {weekTasks.filter(t => t.completed).length} of {weekTasks.length} tasks completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1">
                    {Math.round(completionPercentage)}%
                  </div>
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isSuccessful
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {isSuccessful ? 'SUCCESS!' : 'IN PROGRESS'}
                  </div>
                </div>
              </div>
              {isSuccessful && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 text-green-800 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Congratulations!</span>
                  </div>
                  <p className="text-sm mt-1">
                    You've achieved 80%+ completion this week! Keep up the amazing work!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
