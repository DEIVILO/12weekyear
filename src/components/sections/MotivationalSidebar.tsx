'use client';

import { motion } from 'framer-motion';
import { Target, TrendingUp, Activity, Briefcase, BookOpen, Home, DollarSign, Heart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTaskForm } from '@/components/AddTaskForm';

interface MotivationalSidebarProps {
  overallProgress: number;
  tasks: any[];
}

const containerVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 1.8
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export function MotivationalSidebar({ overallProgress, tasks }: MotivationalSidebarProps) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  const getPriorityStats = (priority: string) => {
    const completed = tasks.filter(t => t.priority === priority && t.completed).length;
    const total = tasks.filter(t => t.priority === priority).length;
    return { completed, total };
  };

  const highStats = getPriorityStats('high');
  const mediumStats = getPriorityStats('medium');
  const lowStats = getPriorityStats('low');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Quick Stats */}
      <motion.div variants={cardVariants}>
        <Card className="glass-card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-2 bg-primary/10 rounded-lg"
              >
                <TrendingUp className="w-5 h-5 text-primary" />
              </motion.div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">High Priority</span>
              </div>
              <span className="font-bold text-red-600">
                {highStats.completed}/{highStats.total}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Medium Priority</span>
              </div>
              <span className="font-bold text-yellow-600">
                {mediumStats.completed}/{mediumStats.total}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Low Priority</span>
              </div>
              <span className="font-bold text-green-600">
                {lowStats.completed}/{lowStats.total}
              </span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivational Message */}
      <motion.div variants={cardVariants}>
        <Card className={`glass-card hover:shadow-xl transition-all duration-300 animate-fade-in ${
          overallProgress >= 80
            ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200 dark:border-green-800'
            : 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800'
        }`} style={{animationDelay: '0.4s'}}>
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`p-3 rounded-full mx-auto mb-4 ${
                  overallProgress >= 80
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <Target className={`w-8 h-8 ${
                  overallProgress >= 80 ? 'text-green-600' : 'text-blue-600'
                }`} />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4 }}
                className={`font-bold text-lg mb-3 ${
                  overallProgress >= 80 ? 'text-green-900 dark:text-green-300' : 'text-blue-900 dark:text-blue-300'
                }`}
              >
                {overallProgress >= 80 ? 'Amazing Progress!' : 'Keep Going!'}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6 }}
                className={`text-sm leading-relaxed ${
                  overallProgress >= 80 ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                {overallProgress >= 80
                  ? "You're crushing it! Stay consistent and you'll achieve your goals. Every step forward is a victory!"
                  : "Every completed task brings you closer to success. Focus on progress, not perfection. You've got this!"
                }
              </motion.p>

              {overallProgress >= 80 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 2.8 }}
                  className="mt-4 flex justify-center"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-200 dark:bg-green-800/50 rounded-full">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                      SUCCESS ACHIEVED!
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Task Form */}
      <motion.div variants={cardVariants}>
        <AddTaskForm />
      </motion.div>
    </motion.div>
  );
}
