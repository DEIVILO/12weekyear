'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, CheckCircle2, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateWeightedCompletion } from '@/store/useStore';

interface OverviewCardsProps {
  overallProgress: number;
  currentWeek: number;
  tasks: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
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
      duration: 0.5
    }
  }
};

export function OverviewCards({ overallProgress, currentWeek, tasks }: OverviewCardsProps) {
  // Use weighted completion calculation for consistency
  const { completionPercentage, completedTasks, totalTasks, totalWeight, completedWeight } = calculateWeightedCompletion(tasks);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Weekly Progress Card */}
      <motion.div variants={cardVariants}>
        <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className={`p-2 rounded-lg ${
                  overallProgress >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                  overallProgress >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <TrendingUp className={`h-5 w-5 ${
                  overallProgress >= 80 ? 'text-green-600' :
                  overallProgress >= 60 ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
              </motion.div>
              Weekly Progress
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="p-2 bg-primary/10 rounded-lg"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"
            >
              {Math.round(completionPercentage)}%
            </motion.div>
            <p className="text-sm text-muted-foreground mb-3">
              {Math.round(completedWeight)} of {Math.round(totalWeight)} weight completed ({completedTasks} of {totalTasks} tasks)
            </p>
            <Progress
              value={completionPercentage}
              className={`h-3 ${
                completionPercentage >= 80 ? 'progress-success' :
                completionPercentage >= 60 ? 'progress-warning' :
                'progress-info'
              }`}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Status Card */}
      <motion.div variants={cardVariants}>
        <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in group" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className={`p-2 rounded-lg ${
                  completionPercentage >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-gray-100 dark:bg-gray-900/30'
                }`}
              >
                {completionPercentage >= 80 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-600" />
                )}
              </motion.div>
              Success Status
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"
            >
              <Target className="h-4 w-4 text-green-600" />
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-3xl font-bold mb-2"
            >
              {completionPercentage >= 80 ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    SUCCESS!
                  </span>
                </motion.div>
              ) : (
                <span className="text-muted-foreground">IN PROGRESS</span>
              )}
            </motion.div>
            <p className="text-sm text-muted-foreground">
              {completionPercentage >= 80
                ? 'Congratulations! Week successful!'
                : `${Math.max(0, 80 - Math.round(completionPercentage))}% more for success`
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Week Card */}
      <motion.div variants={cardVariants}>
        <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in group" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
              >
                <Calendar className="h-5 w-5 text-purple-500" />
              </motion.div>
              Current Week
            </CardTitle>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
            >
              <Star className="h-4 w-4 text-purple-600" />
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent"
            >
              {currentWeek}
            </motion.div>
            <p className="text-sm text-muted-foreground mb-3">
              of 12 total weeks
            </p>
            <Progress
              value={(currentWeek / 12) * 100}
              className="h-3 progress-info"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-between mt-2"
            >
              <span className="text-xs text-muted-foreground">
                {12 - currentWeek} weeks remaining
              </span>
              <span className="text-xs font-medium">
                {Math.round((currentWeek / 12) * 100)}% complete
              </span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
