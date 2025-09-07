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
  frequency: 'daily' | 'weekly' | 'once';
  lastCompleted?: Date;
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

interface StoreState {
  currentPlan: TwelveWeekPlan | null;
  weeklyPlans: WeeklyPlan[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentPlan: (plan: TwelveWeekPlan | null) => void;
  addWeeklyPlan: (plan: WeeklyPlan) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (id: string) => void;
  addTask: (task: Task) => void;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  loadWeeklyPlans: () => Promise<void>;
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

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        })),

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
          } else if (currentTask.frequency === 'weekly') {
            // For weekly tasks, toggle normally
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
              const completedTasks = weeklyTasks.filter(t => t.completed).length;
              const completionPercentage = weeklyTasks.length > 0
                ? (completedTasks / weeklyTasks.length) * 100
                : 0;
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
        if (!plan) return { percentage: 0, isSuccessful: false };

        const tasks = state.tasks.filter(t => plan.tasks.some(pt => pt.id === t.id));
        const completedTasks = tasks.filter(t => t.completed).length;
        const percentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
        const isSuccessful = percentage >= 80;

        return { percentage, isSuccessful };
      },

      getOverallProgress: () => {
        const state = get();
        if (state.weeklyPlans.length === 0) return 0;

        const totalPercentage = state.weeklyPlans.reduce(
          (sum, plan) => sum + plan.completionPercentage,
          0
        );
        return totalPercentage / state.weeklyPlans.length;
      },

      resetDailyTasks: async () => {
        try {
          const state = get();
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today

          // Find daily tasks that were completed before today
          const dailyTasksToReset = state.tasks.filter(task => {
            if (task.frequency !== 'daily') return false;
            if (!task.lastCompleted) return false;

            const lastCompletedDate = new Date(task.lastCompleted);
            lastCompletedDate.setHours(0, 0, 0, 0); // Start of completion day

            return lastCompletedDate < today;
          });

          // Reset each daily task
          for (const task of dailyTasksToReset) {
            await apiRequest(`/tasks/${task.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                completed: false,
                lastCompleted: null,
              }),
            });
          }

          console.log(`Reset ${dailyTasksToReset.length} daily tasks`);
        } catch (error) {
          console.error('Error resetting daily tasks:', error);
        }
      },
    }),
    {
      name: '12weekyear-storage',
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        weeklyPlans: state.weeklyPlans,
        tasks: state.tasks,
      }),
    }
  )
);

// Helper functions for task completion
export const useTaskCompletion = (tasks: Task[]) => {
  const completionPercentage = tasks.length > 0
    ? (tasks.filter(task => task.completed).length / tasks.length) * 100
    : 0;

  const isSuccessful = completionPercentage >= 80;

  return { completionPercentage, isSuccessful };
};

export const useWeeklyCompletion = (weeklyPlan: WeeklyPlan, allTasks: Task[]) => {
  const planTasks = allTasks.filter(task =>
    weeklyPlan.tasks.some(planTask => planTask.id === task.id)
  );

  return useTaskCompletion(planTasks);
};
