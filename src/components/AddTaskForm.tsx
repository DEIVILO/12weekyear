'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'three_times_week', 'twice_week', 'weekly', 'biweekly', 'monthly', 'once']),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

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
        frequency: data.frequency,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        weeklyPlanId: weeklyPlanId,
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
        <Button
          className="w-full hover:scale-105 transition-transform shadow-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...register('description')}
              placeholder="Describe why this task matters to your 12-week year goals. What impact will it have on your overall progress?"
              rows={3}
            />
          </div>

          {/* Priority, Frequency and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date (Optional)</label>
            <Input
              {...register('dueDate')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Priority Preview */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
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
          </div>

        </form>
        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
            className="hover:scale-105 transition-transform"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
