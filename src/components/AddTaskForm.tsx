'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Calendar, CheckCircle2, Activity, Briefcase, BookOpen, Home, DollarSign, Heart, FileText, AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useStore } from '@/store/useStore';
import { toast } from 'react-hot-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().optional(),
  taskType: z.enum(['recurring', 'week_specific']),
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'three_times_week', 'twice_week', 'weekly', 'biweekly', 'monthly', 'once']),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Animation variants
const formContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const formFieldVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
 // easeOut
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95
  }
};

export function AddTaskForm({ onSuccess, onCancel }: AddTaskFormProps) {
  const { createTask, isLoading, weeklyPlans } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      taskType: 'week_specific',
      frequency: 'three_times_week',
    },
  });

  const priority = watch('priority');

  const onSubmit = async (data: TaskFormData) => {
    try {
      // Get the first available weekly plan or use a default
      const weeklyPlanId = weeklyPlans.length > 0
        ? weeklyPlans[0].id
        : 'default-week-1';

      await createTask({
        title: data.title,
        description: data.description || undefined,
        completed: false,
        priority: data.priority,
        category: data.category || undefined,
        taskType: data.taskType,
        frequency: data.frequency,
        completionCount: 0,
        completionTarget: 1, // Will be updated by the store based on frequency
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        weeklyPlanId: data.taskType === 'recurring' ? undefined : weeklyPlanId,
      });

      toast.success('Task created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            className="w-full hover:scale-105 transition-transform shadow-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Task
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <motion.div
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <DialogHeader>
            <motion.div variants={formFieldVariants}>
              <DialogTitle className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Plus className="w-5 h-5 text-primary" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  Add New Task
                </motion.span>
              </DialogTitle>
            </motion.div>
          </DialogHeader>
          <motion.form
            variants={formContainerVariants}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Title */}
            <motion.div variants={formFieldVariants} className="space-y-2">
              <label className="text-sm font-medium">
                Task Title <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder="e.g., 'Complete morning workout routine' or 'Review quarterly financial goals'"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </motion.div>

            {/* Task Type */}
            <motion.div variants={formFieldVariants} className="space-y-2">
              <label className="text-sm font-medium">Task Type</label>
              <Select
                value={watch('taskType')}
                onValueChange={(value: 'recurring' | 'week_specific') => setValue('taskType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week_specific">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Week-Specific Task</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recurring">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>Recurring Throughout Year</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {watch('taskType') === 'recurring'
                  ? 'This task will persist across all weeks and track completion over time.'
                  : 'This task is specific to the current week and will be completed once.'
                }
              </p>
            </motion.div>

            {/* Description */}
            <motion.div variants={formFieldVariants} className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Describe why this task matters to your 12-week year goals. What impact will it have on your overall progress?"
                rows={3}
              />
            </motion.div>

            {/* Priority, Frequency and Category */}
            <motion.div variants={formFieldVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={watch('frequency')}
                onValueChange={(value: 'daily' | 'weekdays' | 'weekends' | 'three_times_week' | 'twice_week' | 'weekly' | 'biweekly' | 'monthly' | 'once') => setValue('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Daily</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekdays">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Weekdays (Mon-Fri)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekends">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <span>Weekends (Sat-Sun)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="three_times_week">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>3x per week</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="twice_week">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>2x per week</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Weekly</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="biweekly">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Bi-weekly (every 2 weeks)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Monthly</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="once">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>One-time</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>Health & Fitness</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="work">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Work & Career</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="learning">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Learning & Growth</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <span>Personal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="finance">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Finance</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="relationships">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>Relationships</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Other</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            </motion.div>

            {/* Due Date */}
            <motion.div variants={formFieldVariants} className="space-y-2">
            <label className="text-sm font-medium">Due Date (Optional)</label>
            <Input
              {...register('dueDate')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
            />
            </motion.div>

            {/* Priority Preview */}
            <motion.div variants={formFieldVariants} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Priority:</span>
            <Badge
              variant="outline"
              className={
                priority === 'high'
                  ? 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30'
                  : priority === 'medium'
                  ? 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30'
                  : 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30'
              }
            >
              {priority === 'high' ? (
                <AlertTriangle className="w-3 h-3" />
              ) : priority === 'medium' ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              <span>{priority} priority</span>
            </Badge>
            </motion.div>

          </motion.form>
          <DialogFooter>
            <motion.div variants={buttonVariants} className="flex justify-end gap-3 mt-6">
              <motion.div variants={buttonVariants}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div variants={buttonVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  onClick={handleSubmit(onSubmit)}
                  className="hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      Creating...
                    </motion.div>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </motion.div>
            </motion.div>
        </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
