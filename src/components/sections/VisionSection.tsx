'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';

interface VisionSectionProps {
  // No longer needed - using store directly
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
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
    scale: 1
  }
};

export function VisionSection({}: VisionSectionProps) {
  const { vision, loadVision, updateVision, isLoading } = useStore();

  const [isEditingVision, setIsEditingVision] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [visionText, setVisionText] = useState(vision?.threeYearVision || '');
  const [goals, setGoals] = useState(vision?.twelveWeekGoals || []);
  const [newGoal, setNewGoal] = useState('');

  // Load vision data on mount
  useEffect(() => {
    if (!vision) {
      loadVision();
    }
  }, [vision, loadVision]);

  // Update local state when vision data changes
  useEffect(() => {
    if (vision) {
      setVisionText(vision.threeYearVision || '');
      setGoals(vision.twelveWeekGoals || []);
    }
  }, [vision]);

  const handleSaveVision = async () => {
    await updateVision(visionText, goals);
    setIsEditingVision(false);
  };

  const handleSaveGoals = async () => {
    await updateVision(visionText, goals);
    setIsEditingGoals(false);
  };

  const addGoal = () => {
    if (newGoal.trim() && goals.length < 3) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, value: string) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = value;
    setGoals(updatedGoals);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* 3-Year Vision */}
      <motion.div 
        variants={cardVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="glass-card hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
                >
                  <Eye className="w-5 h-5 text-purple-600" />
                </motion.div>
                3-Year Vision
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingVision(!isEditingVision)}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingVision ? (
              <div className="space-y-4">
                <Textarea
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                  placeholder="Imagine yourself 3 years from now... What does your ideal life look like? What have you accomplished? What impact have you made? What are you known for? How do you feel about your progress? Be specific about your achievements, relationships, health, career, and personal growth."
                  className="min-h-[120px] resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveVision} size="sm" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Vision'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVisionText(vision?.threeYearVision || '');
                      setIsEditingVision(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {visionText ? (
                  <p className="text-muted-foreground leading-relaxed">{visionText}</p>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No 3-year vision set yet</p>
                    <p className="text-sm mt-2">Click edit to define your long-term vision</p>
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-left">
                      <p className="text-sm font-medium mb-2">💡 Vision Writing Tips:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Write in present tense as if it's already happened</li>
                        <li>• Be specific about achievements and outcomes</li>
                        <li>• Include how you'll feel and what you'll be known for</li>
                        <li>• Cover all areas: career, health, relationships, personal growth</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 12-Week Goals */}
      <motion.div 
        variants={cardVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="glass-card hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                >
                  <Target className="w-5 h-5 text-blue-600" />
                </motion.div>
                12-Week Goals
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingGoals(!isEditingGoals)}
                className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingGoals ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <Input
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        placeholder={`Goal ${index + 1}: Be specific and measurable (e.g., "Complete 50 client projects" or "Lose 20 pounds")`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {goals.length < 3 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {goals.length + 1}
                      </Badge>
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder={`Goal ${goals.length + 1}: Be specific and measurable (e.g., "Complete 50 client projects" or "Lose 20 pounds")`}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addGoal}
                        disabled={!newGoal.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveGoals} size="sm" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Goals'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGoals(vision?.twelveWeekGoals || []);
                      setNewGoal('');
                      setIsEditingGoals(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Badge variant="outline" className="text-xs mt-1">
                          {index + 1}
                        </Badge>
                        <p className="text-muted-foreground leading-relaxed flex-1">{goal}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No 12-week goals set yet</p>
                    <p className="text-sm mt-2">Click edit to define your quarterly goals</p>
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-left">
                      <p className="text-sm font-medium mb-2">🎯 Goal Setting Tips:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Choose 2-3 goals maximum (focus is key)</li>
                        <li>• Make them specific and measurable</li>
                        <li>• Ensure they connect to your 3-year vision</li>
                        <li>• Set goals you can achieve in 12 weeks</li>
                        <li>• Use action verbs: "Complete", "Achieve", "Build"</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
