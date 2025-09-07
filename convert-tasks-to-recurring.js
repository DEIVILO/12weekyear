const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function convertTasksToRecurring() {
  console.log('Starting task conversion to recurring...');

  try {
    // Get all current tasks
    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        title: true,
        frequency: true,
        taskType: true,
        weeklyPlanId: true
      }
    });

    console.log(`Found ${tasks.length} tasks to convert`);

    // Frequency to completion target mapping
    const getCompletionTarget = (frequency) => {
      switch (frequency) {
        case 'DAILY':
          return 7; // 7 days per week
        case 'WEEKDAYS':
          return 5; // Monday-Friday
        case 'WEEKENDS':
          return 2; // Saturday-Sunday
        case 'THREE_TIMES_WEEK':
          return 3;
        case 'TWICE_WEEK':
          return 2;
        case 'WEEKLY':
          return 1;
        case 'BIWEEKLY':
          return 1; // Every 2 weeks = 0.5 per week, but we track as 1 completion
        case 'MONTHLY':
          return 1; // Once per month = ~0.25 per week, but we track as 1 completion
        case 'ONCE':
          return 1;
        default:
          return 1; // Default to weekly
      }
    };

    let convertedCount = 0;

    for (const task of tasks) {
      const completionTarget = getCompletionTarget(task.frequency);

      await prisma.task.update({
        where: { id: task.id },
        data: {
          taskType: 'RECURRING',
          weeklyPlanId: null,
          completionTarget: completionTarget,
          completionCount: 0, // Reset completion count for recurring tasks
        }
      });

      console.log(`✅ Converted "${task.title}" (${task.frequency}) - Target: ${completionTarget}`);
      convertedCount++;
    }

    console.log(`\n🎉 Successfully converted ${convertedCount} tasks to recurring!`);
    console.log('\n📋 Summary:');
    console.log('- All tasks are now RECURRING and will persist across weeks');
    console.log('- Tasks no longer tied to specific weekly plans');
    console.log('- Progress accumulates based on frequency (daily = 7, weekly = 1, etc.)');
    console.log('- Reset completion counts to start fresh with new system');

  } catch (error) {
    console.error('❌ Error converting tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the conversion
convertTasksToRecurring();
