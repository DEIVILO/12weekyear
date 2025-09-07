import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create a default vision if none exists
    const existingVision = await prisma.vision.findFirst();
    let vision;

    if (!existingVision) {
      vision = await prisma.vision.create({
        data: {
          title: 'My 12 Week Year Journey',
          description: 'Achieving extraordinary results through focused execution and consistent daily actions.',
        },
      });
      console.log('Created default vision:', vision.id);
    } else {
      vision = existingVision;
    }

    // Create a default 12-week plan if none exists
    const existingPlan = await prisma.twelveWeekPlan.findFirst();
    let twelveWeekPlan;

    if (!existingPlan) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 84); // 12 weeks

      twelveWeekPlan = await prisma.twelveWeekPlan.create({
        data: {
          title: 'Q1 2025 Goals',
          description: 'First quarter focus on health, learning, and productivity',
          startDate,
          endDate,
          goals: '["Improve physical fitness", "Read 12 books", "Launch personal project"]',
          visionId: vision.id,
        },
      });
      console.log('Created default 12-week plan:', twelveWeekPlan.id);
    } else {
      twelveWeekPlan = existingPlan;
    }

    // Create weekly plans for the first 4 weeks if they don't exist
    const existingWeeklyPlans = await prisma.weeklyPlan.findMany({
      where: { twelveWeekPlanId: twelveWeekPlan.id },
    });

    if (existingWeeklyPlans.length === 0) {
      const weeklyPlans = [];

      for (let i = 1; i <= 4; i++) {
        const weekStart = new Date(twelveWeekPlan.startDate);
        weekStart.setDate(weekStart.getDate() + (i - 1) * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weeklyPlan = await prisma.weeklyPlan.create({
          data: {
            weekNumber: i,
            startDate: weekStart,
            endDate: weekEnd,
            twelveWeekPlanId: twelveWeekPlan.id,
          },
        });

        weeklyPlans.push(weeklyPlan);
        console.log(`Created week ${i} plan:`, weeklyPlan.id);
      }

      // Create sample tasks for the first week
      const firstWeekPlan = weeklyPlans[0];

      const sampleTasks = [
        {
          title: 'Complete daily workout',
          description: '30-minute cardio session or strength training',
          priority: 'HIGH' as const,
          category: 'Health',
          frequency: 'DAILY' as const,
          weeklyPlanId: firstWeekPlan.id,
        },
        {
          title: 'Read for 30 minutes',
          description: 'Personal development or professional book',
          priority: 'MEDIUM' as const,
          category: 'Learning',
          frequency: 'DAILY' as const,
          weeklyPlanId: firstWeekPlan.id,
        },
        {
          title: 'Plan tomorrow\'s schedule',
          description: 'Review tasks and set priorities for the next day',
          priority: 'MEDIUM' as const,
          category: 'Productivity',
          frequency: 'DAILY' as const,
          weeklyPlanId: firstWeekPlan.id,
        },
        {
          title: 'Meditate for 10 minutes',
          description: 'Morning mindfulness practice',
          priority: 'LOW' as const,
          category: 'Health',
          frequency: 'DAILY' as const,
          weeklyPlanId: firstWeekPlan.id,
        },
        {
          title: 'Review weekly goals',
          description: 'Check progress against 12-week objectives',
          priority: 'HIGH' as const,
          category: 'Productivity',
          frequency: 'WEEKLY' as const,
          weeklyPlanId: firstWeekPlan.id,
        },
      ];

      for (const taskData of sampleTasks) {
        await prisma.task.create({
          data: taskData,
        });
      }

      console.log('Created sample tasks for week 1');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// API route to initialize database
export async function GET() {
  try {
    await initializeDatabase();
    return Response.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return Response.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
