import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/weekly-plans - Get all weekly plans
export async function GET() {
  try {
    const weeklyPlans = await prisma.weeklyPlan.findMany({
      include: {
        tasks: true,
        twelveWeekPlan: {
          include: {
            vision: true,
          },
        },
      },
      orderBy: {
        weekNumber: 'asc',
      },
    });

    return NextResponse.json(weeklyPlans);
  } catch (error) {
    console.error('Error fetching weekly plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly plans' },
      { status: 500 }
    );
  }
}

// POST /api/weekly-plans - Create a new weekly plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekNumber, startDate, endDate, twelveWeekPlanId } = body;

    const weeklyPlan = await prisma.weeklyPlan.create({
      data: {
        weekNumber,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        twelveWeekPlanId,
      },
      include: {
        tasks: true,
        twelveWeekPlan: true,
      },
    });

    return NextResponse.json(weeklyPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly plan:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly plan' },
      { status: 500 }
    );
  }
}
