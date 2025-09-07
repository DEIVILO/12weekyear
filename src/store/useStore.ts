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
  lastCompleted?: Date;
  weeklyPlanId: string;
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

          // Convert frequency to uppercase for API
          const apiData = {
            ...taskData,
            priority: taskData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
            frequency: taskData.frequency.toUpperCase() as 'DAILY' | 'WEEKLY' | 'ONCE',
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
          set({ isLoading: true, error: null });

          // Get current task
          const currentTask = get().tasks.find(t => t.id === id);
          if (!currentTask) return;

          const now = new Date();
          let newCompleted: boolean;
          let lastCompleted: Date | undefined;

          // Handle frequency-based completion logic
          if (currentTask.frequency === 'daily') {
            // For daily tasks, toggle normally and update lastCompleted
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'weekdays') {
            // For weekday tasks (Mon-Fri), toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'weekends') {
            // For weekend tasks (Sat-Sun), toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'three_times_week' || currentTask.frequency === 'twice_week') {
            // For flexible weekly tasks, toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'weekly') {
            // For weekly tasks, toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'biweekly') {
            // For bi-weekly tasks, toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'monthly') {
            // For monthly tasks, toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          } else if (currentTask.frequency === 'once') {
            // For one-time tasks, can only be completed once
            if (currentTask.completed) {
              // If already completed, don't allow unchecking
              return;
            }
            newCompleted = true;
            lastCompleted = now;
          } else {
            // Default case: toggle normally
            newCompleted = !currentTask.completed;
            lastCompleted = newCompleted ? now : undefined;
          }

          // API call to update task
          const updatedTask = await apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              completed: newCompleted,
              lastCompleted: lastCompleted?.toISOString(),
            }),
          });

          // Update local state
          set((state) => {
            const updatedTasks = state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            );

            // Update weekly plan completion when task is toggled
            const weeklyPlan = state.weeklyPlans.find(plan =>
              plan.tasks.some(t => t.id === id)
            );

            if (weeklyPlan) {
              const weeklyTasks = updatedTasks.filter(t =>
                weeklyPlan.tasks.some(wt => wt.id === t.id)
              );

              // Calculate weighted completion for the weekly plan
              let totalWeight = 0;
              let completedWeight = 0;

              for (const task of weeklyTasks) {
                const weight = calculateTaskWeight(task.frequency || 'weekly');
                totalWeight += weight;

                if (task.completed) {
                  completedWeight += weight;
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
          set({ isLoading: false });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

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
            if (!task.lastCompleted || !task.completed) return false;

            const lastCompletedDate = new Date(task.lastCompleted);
            lastCompletedDate.setHours(0, 0, 0, 0);

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

          // Reset each task
          for (const task of tasksToReset) {
            await apiRequest(`/tasks/${task.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                completed: false,
                lastCompleted: null,
              }),
            });
          }

          console.log(`Reset ${tasksToReset.length} tasks based on their frequency`);
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
