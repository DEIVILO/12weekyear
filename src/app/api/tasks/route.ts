import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        weeklyPlan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority,
      category,
      frequency,
      taskType,
      completionTarget,
      completionCount,
      weeklyPlanId
    } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        category,
        frequency: frequency || 'WEEKLY',
        taskType: taskType || 'WEEK_SPECIFIC',
        completionTarget: completionTarget || 1,
        completionCount: completionCount || 0,
        weeklyPlanId: taskType === 'RECURRING' ? null : weeklyPlanId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
