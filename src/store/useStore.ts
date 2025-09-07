import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API functions
const API_BASE = '/api';

async function apiRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'three_times_week' | 'twice_week' | 'weekly' | 'biweekly' | 'monthly' | 'once';
  taskType: 'recurring' | 'week_specific';
  completionCount: number; // For recurring tasks: how many times completed this week
  completionTarget: number; // For recurring tasks: target completions per week
  lastCompleted?: Date;
  weeklyPlanId?: string; // Optional for recurring tasks
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyPlan {
  id: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  completionPercentage: number;
  isSuccessful: boolean; // 80%+ threshold
  createdAt: Date;
  updatedAt: Date;
}

export interface TwelveWeekPlan {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  weeklyPlans: WeeklyPlan[];
  overallProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vision {
  id: string;
  threeYearVision?: string;
  twelveWeekGoals: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface StoreState {
  currentPlan: TwelveWeekPlan | null;
  weeklyPlans: WeeklyPlan[];
  tasks: Task[];
  vision: Vision | null;
  isLoading: boolean;
  error: string | null;
  loadingTasks: Set<string>; // Track which tasks are currently being updated

  // Actions
  setCurrentPlan: (plan: TwelveWeekPlan | null) => void;
  addWeeklyPlan: (plan: WeeklyPlan) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (id: string) => void;
  addTask: (task: Task) => void;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  loadWeeklyPlans: () => Promise<void>;
  loadVision: () => Promise<void>;
  updateVision: (vision: string, goals: string[]) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTaskLoading: (taskId: string, loading: boolean) => void;

  // Computed values
  getWeeklyCompletion: (weekId: string) => { percentage: number; isSuccessful: boolean };
  getOverallProgress: () => number;
  resetDailyTasks: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      weeklyPlans: [],
      tasks: [],
      vision: null,
      isLoading: false,
      error: null,
      loadingTasks: new Set<string>(),

      setCurrentPlan: (plan) => set({ currentPlan: plan }),

      addWeeklyPlan: (plan) =>
        set((state) => ({
          weeklyPlans: [...state.weeklyPlans, plan],
        })),

      updateWeeklyPlan: (id, updates) =>
        set((state) => ({
          weeklyPlans: state.weeklyPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates, updatedAt: new Date() } : plan
          ),
        })),

      deleteWeeklyPlan: (id) =>
        set((state) => ({
          weeklyPlans: state.weeklyPlans.filter((plan) => plan.id !== id),
        })),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      createTask: async (taskData) => {
        try {
          set({ isLoading: true, error: null });

          // Set completionTarget based on frequency for recurring tasks
          let completionTarget = 1;
          if (taskData.taskType === 'recurring') {
            switch (taskData.frequency) {
              case 'daily':
                completionTarget = 7; // 7 days per week
                break;
              case 'weekdays':
                completionTarget = 5; // Mon-Fri
                break;
              case 'weekends':
                completionTarget = 2; // Sat-Sun
                break;
              case 'three_times_week':
                completionTarget = 3;
                break;
              case 'twice_week':
                completionTarget = 2;
                break;
              case 'weekly':
                completionTarget = 1;
                break;
              case 'biweekly':
                completionTarget = 1; // Every 2 weeks = 0.5 per week, but we track as 1 completion
                break;
              case 'monthly':
                completionTarget = 1; // Once per month = ~0.25 per week, but we track as 1 completion
                break;
              case 'once':
                completionTarget = 1;
                break;
            }
          }

          // Convert frequency to uppercase for API
          const apiData = {
            ...taskData,
            priority: taskData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
            frequency: taskData.frequency.toUpperCase() as 'DAILY' | 'WEEKLY' | 'ONCE',
            taskType: taskData.taskType.toUpperCase() as 'RECURRING' | 'WEEK_SPECIFIC',
            completionTarget,
            completionCount: 0,
            // For recurring tasks, don't set weeklyPlanId
            weeklyPlanId: taskData.taskType === 'recurring' ? undefined : taskData.weeklyPlanId,
          };

          const newTask = await apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(apiData),
          });

          set((state) => ({
            tasks: [...state.tasks, newTask],
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create task' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadTasks: async () => {
        try {
          set({ isLoading: true, error: null });

          const tasks = await apiRequest('/tasks');

          // Transform dates from API response
          const transformedTasks = tasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : undefined,
            frequency: task.frequency.toLowerCase(), // Convert to lowercase for frontend
            priority: task.priority.toLowerCase(), // Convert to lowercase for frontend
            taskType: task.taskType.toLowerCase(), // Convert to lowercase for frontend
            completionCount: task.completionCount || 0,
            completionTarget: task.completionTarget || 1,
          }));

          set({ tasks: transformedTasks });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load tasks' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadWeeklyPlans: async () => {
        try {
          set({ isLoading: true, error: null });

          const weeklyPlans = await apiRequest('/weekly-plans');

          // Transform dates from API response
          const transformedPlans = weeklyPlans.map((plan: any) => ({
            ...plan,
            startDate: new Date(plan.startDate),
            endDate: new Date(plan.endDate),
            createdAt: new Date(plan.createdAt),
            updatedAt: new Date(plan.updatedAt),
            tasks: plan.tasks || [], // Ensure tasks array exists
          }));

          set({ weeklyPlans: transformedPlans });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load weekly plans' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateTask: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const updatedTask = await apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
          }));
        } catch (error) {
          console.error('Error updating task:', error);
          set({ error: 'Failed to update task' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTask: async (id) => {
        try {
          get().setTaskLoading(id, true);
          set({ error: null });

          // Get current task
          const currentTask = get().tasks.find(t => t.id === id);
          if (!currentTask) return;

          const now = new Date();
          let updates: any = {};

          if (currentTask.taskType === 'recurring') {
            // For recurring tasks: increment/decrement completion count
            if (currentTask.completed) {
              // Unchecking: decrement count
              updates.completionCount = Math.max(0, currentTask.completionCount - 1);
              updates.completed = updates.completionCount >= currentTask.completionTarget;
              updates.lastCompleted = null;
            } else {
              // Checking: increment count
              updates.completionCount = currentTask.completionCount + 1;
              updates.completed = updates.completionCount >= currentTask.completionTarget;
              updates.lastCompleted = now.toISOString();
            }
          } else {
            // For week-specific tasks: use old logic
            if (currentTask.frequency === 'once' && currentTask.completed) {
              // One-time tasks can't be unchecked
              return;
            }

            updates.completed = !currentTask.completed;
            updates.lastCompleted = updates.completed ? now.toISOString() : null;
          }

          // API call to update task
          const updatedTask = await apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });

          // Update local state
          set((state) => {
            const updatedTasks = state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            );

            // Update weekly plan completion when task is toggled
            const weeklyPlan = state.weeklyPlans.find(plan =>
              plan.tasks.some(t => t.id === id) || // Week-specific tasks
              (updatedTask.taskType === 'recurring' && plan.weekNumber === getCurrentWeekNumber()) // Recurring tasks for current week
            );

            if (weeklyPlan) {
              // Get all tasks for this week (both recurring and week-specific)
              const weeklyTasks = updatedTasks.filter(task => {
                if (task.taskType === 'week_specific') {
                  // Include week-specific tasks that belong to this plan
                  return weeklyPlan.tasks.some(wt => wt.id === task.id);
                } else {
                  // Include recurring tasks for the current week
                  return task.taskType === 'recurring';
                }
              });

              // Calculate weighted completion for the weekly plan
              let totalWeight = 0;
              let completedWeight = 0;

              for (const task of weeklyTasks) {
                if (task.taskType === 'recurring') {
                  // For recurring tasks, use completion progress
                  const progressRatio = task.completionCount / task.completionTarget;
                  const weight = calculateTaskWeight(task.frequency || 'weekly');
                  totalWeight += weight;
                  completedWeight += weight * Math.min(progressRatio, 1); // Cap at 100%
                } else {
                  // For week-specific tasks, use binary completion
                  const weight = calculateTaskWeight(task.frequency || 'weekly');
                  totalWeight += weight;

                  if (task.completed) {
                    completedWeight += weight;
                  }
                }
              }

              const completionPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
              const isSuccessful = completionPercentage >= 80;

              const updatedWeeklyPlans = state.weeklyPlans.map(plan =>
                plan.id === weeklyPlan.id
                  ? { ...plan, completionPercentage, isSuccessful, updatedAt: new Date() }
                  : plan
              );

              return {
                tasks: updatedTasks,
                weeklyPlans: updatedWeeklyPlans,
              };
            }

            return { tasks: updatedTasks };
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to toggle task' });
        } finally {
          get().setTaskLoading(id, false);
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setTaskLoading: (taskId, loading) =>
        set((state) => {
          const newLoadingTasks = new Set(state.loadingTasks);
          if (loading) {
            newLoadingTasks.add(taskId);
          } else {
            newLoadingTasks.delete(taskId);
          }
          return { loadingTasks: newLoadingTasks };
        }),

      getWeeklyCompletion: (weekId) => {
        const state = get();
        const plan = state.weeklyPlans.find(p => p.id === weekId);
        if (!plan) return { percentage: 0, isSuccessful: false, weightedCompletion: 0 };

        const tasks = state.tasks.filter(t => plan.tasks.some(pt => pt.id === t.id));

        // Use frequency-based weighted completion
        let totalWeight = 0;
        let completedWeight = 0;

        for (const task of tasks) {
          const weight = calculateTaskWeight(task.frequency || 'weekly');
          totalWeight += weight;

          if (task.completed) {
            completedWeight += weight;
          }
        }

        const percentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
        const isSuccessful = percentage >= 80;

        return {
          percentage,
          isSuccessful,
          weightedCompletion: percentage,
          totalWeight,
          completedWeight
        };
      },

      getOverallProgress: () => {
        const state = get();
        if (state.weeklyPlans.length === 0) return 0;

        // Use the weekly plans' completionPercentage which is now weighted
        const totalPercentage = state.weeklyPlans.reduce(
          (sum, plan) => sum + plan.completionPercentage,
          0
        );
        return totalPercentage / state.weeklyPlans.length;
      },

      resetDailyTasks: async () => {
        try {
          const state = get();
          const now = new Date();
          const today = new Date(now);
          today.setHours(0, 0, 0, 0); // Start of today

          const tasksToReset = state.tasks.filter(task => {
            // Only process recurring tasks that have been completed
            if (task.taskType !== 'recurring' || !task.lastCompleted) return false;

            const lastCompletedDate = new Date(task.lastCompleted);
            lastCompletedDate.setHours(0, 0, 0, 0);

            // Check if task should be reset based on frequency
            switch (task.frequency) {
              case 'daily':
                // Reset daily tasks that were completed before today
                return lastCompletedDate < today;

              case 'weekdays':
                // Reset weekday tasks if it's a weekday and was completed yesterday or earlier
                const isWeekday = now.getDay() >= 1 && now.getDay() <= 5; // Mon-Fri
                return isWeekday && lastCompletedDate < today;

              case 'weekends':
                // Reset weekend tasks if it's a weekend and was completed yesterday or earlier
                const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sat-Sun
                return isWeekend && lastCompletedDate < today;

              case 'three_times_week':
              case 'twice_week':
                // Reset flexible weekly tasks based on when they were last completed
                // Allow them to be completed again after a day has passed
                const daysSinceCompleted = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceCompleted >= 1;

              case 'weekly':
                // Reset weekly tasks if it's been 7+ days since completion
                const daysSinceWeekly = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceWeekly >= 7;

              case 'biweekly':
                // Reset bi-weekly tasks if it's been 14+ days since completion
                const daysSinceBiweekly = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceBiweekly >= 14;

              case 'monthly':
                // Reset monthly tasks if it's been a month since completion
                const monthsSinceCompleted = (today.getFullYear() - lastCompletedDate.getFullYear()) * 12 +
                  (today.getMonth() - lastCompletedDate.getMonth());
                return monthsSinceCompleted >= 1;

              case 'once':
                // One-time tasks don't get reset
                return false;

              default:
                return false;
            }
          });

          // Reset each recurring task
          for (const task of tasksToReset) {
            // For recurring tasks, we decrement the completion count instead of resetting to 0
            // This preserves progress while allowing daily resets
            const newCompletionCount = Math.max(0, task.completionCount - 1);
            const newCompleted = newCompletionCount >= task.completionTarget;

            await apiRequest(`/tasks/${task.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                completed: newCompleted,
                completionCount: newCompletionCount,
                lastCompleted: null, // Reset last completed to allow re-completion today
              }),
            });
          }

          console.log(`Reset ${tasksToReset.length} recurring tasks based on their frequency`);
        } catch (error) {
          console.error('Error resetting tasks:', error);
        }
      },

      // Vision actions
      loadVision: async () => {
        try {
          set({ isLoading: true, error: null });
          const visionData = await apiRequest('/vision');
          set({ vision: visionData });
        } catch (error) {
          console.error('Error loading vision:', error);
          set({ error: 'Failed to load vision data' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateVision: async (visionText: string, goals: string[]) => {
        try {
          set({ isLoading: true, error: null });
          const visionData = await apiRequest('/vision', {
            method: 'POST',
            body: JSON.stringify({
              threeYearVision: visionText,
              twelveWeekGoals: goals,
            }),
          });
          set({ vision: visionData });
        } catch (error) {
          console.error('Error updating vision:', error);
          set({ error: 'Failed to update vision data' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: '12weekyear-storage',
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        weeklyPlans: state.weeklyPlans,
        tasks: state.tasks,
        vision: state.vision,
      }),
    }
  )
);

// Helper function to get current week number
const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStartOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil((daysSinceStartOfYear + startOfYear.getDay() + 1) / 7);
};

// Helper functions for task completion with frequency-based weighting
export const calculateTaskWeight = (frequency: string): number => {
  switch (frequency) {
    case 'daily':
      return 7; // Daily tasks have 7x weight (7 days per week)
    case 'weekdays':
      return 5; // Monday-Friday (5 days)
    case 'weekends':
      return 2; // Saturday-Sunday (2 days)
    case 'three_times_week':
      return 3; // 3 times per week
    case 'twice_week':
      return 2; // 2 times per week
    case 'weekly':
      return 1; // Once per week
    case 'biweekly':
      return 0.5; // Every two weeks (0.5 per week average)
    case 'monthly':
      return 0.25; // Once per month (0.25 per week average)
    case 'once':
      return 1; // One-time tasks (full weight)
    default:
      return 1; // Default to weekly weight
  }
};

// Calculate weighted completion for a set of tasks
export const calculateWeightedCompletion = (tasks: Task[]) => {
  let totalWeight = 0;
  let completedWeight = 0;
  let completedTasks = 0;

  for (const task of tasks) {
    const weight = calculateTaskWeight(task.frequency || 'weekly');
    totalWeight += weight;

    if (task.completed) {
      completedWeight += weight;
      completedTasks += 1;
    }
  }

  const completionPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  const isSuccessful = completionPercentage >= 80;

  return {
    completionPercentage,
    isSuccessful,
    totalWeight,
    completedWeight,
    completedTasks,
    totalTasks: tasks.length
  };
};

export const useTaskCompletion = (tasks: Task[]) => {
  if (tasks.length === 0) {
    return { completionPercentage: 0, isSuccessful: false, weightedCompletion: 0 };
  }

  // Calculate total possible weight and completed weight
  let totalWeight = 0;
  let completedWeight = 0;

  for (const task of tasks) {
    const weight = calculateTaskWeight(task.frequency || 'weekly');
    totalWeight += weight;

    if (task.completed) {
      completedWeight += weight;
    }
  }

  const completionPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  const isSuccessful = completionPercentage >= 80;

  return {
    completionPercentage,
    isSuccessful,
    weightedCompletion: completionPercentage,
    totalWeight,
    completedWeight
  };
};

export const useWeeklyCompletion = (weeklyPlan: WeeklyPlan, allTasks: Task[]) => {
  const planTasks = allTasks.filter(task =>
    weeklyPlan.tasks.some(planTask => planTask.id === task.id)
  );

  return useTaskCompletion(planTasks);
};

// Legacy function for backwards compatibility
export const useSimpleTaskCompletion = (tasks: Task[]) => {
  const completionPercentage = tasks.length > 0
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100
    : 0;

  const isSuccessful = completionPercentage >= 80;

  return { completionPercentage, isSuccessful };
};
