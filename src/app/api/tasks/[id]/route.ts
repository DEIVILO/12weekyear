import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        weeklyPlan: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, completed, priority, category, frequency, lastCompleted, completionCount } = body;

    console.log(`🔄 Task ${id} update:`, body);

    // Prepare update data
    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
      ...(frequency !== undefined && { frequency }),
      ...(lastCompleted !== undefined && {
        lastCompleted: lastCompleted === null ? null : lastCompleted
      }),
    };

    // Handle completionCount and completed fields for recurring tasks
    if (completionCount !== undefined) {
      updateData.completionCount = completionCount;

      // For recurring tasks, automatically update completed based on completionCount
      const currentTask = await prisma.task.findUnique({ where: { id } });
      if (currentTask && currentTask.taskType === 'RECURRING') {
        updateData.completed = completionCount >= currentTask.completionTarget;
      }
    }

    // Allow explicit completed override if provided
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    console.log(`✅ Task ${id} updated successfully`);

    // Calculate weekly plan completion if this is a recurring task
    if (task.taskType === 'RECURRING') {
      console.log(`🔄 Recurring task detected, calculating weekly completion...`);

      // Get current week's plan
      const now = new Date();
      const currentWeekPlan = await prisma.weeklyPlan.findFirst({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          tasks: true,
        },
      });

      if (currentWeekPlan) {
        console.log(`📊 Found current week plan: ${currentWeekPlan.id} (Week ${currentWeekPlan.weekNumber})`);

        // Get all tasks for this weekly plan
        const weeklyTasks = await prisma.task.findMany({
          where: {
            OR: [
              { weeklyPlanId: currentWeekPlan.id }, // Week-specific tasks
              { taskType: 'RECURRING' }, // All recurring tasks
            ],
          },
        });

        console.log(`📋 Found ${weeklyTasks.length} tasks for weekly calculation`);

        // Calculate weighted completion
        let totalWeight = 0;
        let completedWeight = 0;

        for (const task of weeklyTasks) {
          const frequency = task.frequency?.toLowerCase() || 'weekly';
          let weight = 1;

          switch (frequency) {
            case 'daily': weight = 7; break;
            case 'weekdays': weight = 5; break;
            case 'weekends': weight = 2; break;
            case 'three_times_week': weight = 3; break;
            case 'twice_week': weight = 2; break;
            case 'weekly': weight = 1; break;
            case 'biweekly': weight = 0.5; break;
            case 'monthly': weight = 0.25; break;
            case 'once': weight = 1; break;
            default: weight = 1;
          }

          totalWeight += weight;

          if (task.taskType === 'RECURRING') {
            const progressRatio = Math.min(task.completionCount / task.completionTarget, 1);
            completedWeight += weight * progressRatio;
            console.log(`🔄 Recurring: "${task.title}" = ${task.completionCount}/${task.completionTarget} * ${weight} = ${(weight * progressRatio).toFixed(2)}`);
          } else {
            if (task.completed) {
              completedWeight += weight;
              console.log(`✅ Week-specific: "${task.title}" completed = ${weight}`);
            } else {
              console.log(`❌ Week-specific: "${task.title}" not completed = 0`);
            }
          }
        }

        const completionPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
        const isSuccessful = completionPercentage >= 80;

        console.log(`📊 Weekly completion: ${completionPercentage.toFixed(1)}% (${completedWeight.toFixed(1)}/${totalWeight.toFixed(1)})`);

        // Update the weekly plan
        await prisma.weeklyPlan.update({
          where: { id: currentWeekPlan.id },
          data: {
            completionPercentage,
            isSuccessful,
          },
        });

        console.log(`💾 Weekly plan ${currentWeekPlan.id} updated in database`);
      } else {
        console.log(`❌ No current week plan found`);
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
