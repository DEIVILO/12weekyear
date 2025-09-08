import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/weekly-plans/[id] - Get a specific weekly plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const weeklyPlan = await prisma.weeklyPlan.findUnique({
      where: { id },
      include: {
        tasks: true,
        twelveWeekPlan: {
          include: {
            vision: true,
          },
        },
      },
    });

    if (!weeklyPlan) {
      return NextResponse.json(
        { error: 'Weekly plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(weeklyPlan);
  } catch (error) {
    console.error('Error fetching weekly plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly plan' },
      { status: 500 }
    );
  }
}

// PUT /api/weekly-plans/[id] - Update a weekly plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completionPercentage, isSuccessful } = body;

    const weeklyPlan = await prisma.weeklyPlan.update({
      where: { id },
      data: {
        ...(completionPercentage !== undefined && { completionPercentage }),
        ...(isSuccessful !== undefined && { isSuccessful }),
      },
      include: {
        tasks: true,
        twelveWeekPlan: true,
      },
    });

    return NextResponse.json(weeklyPlan);
  } catch (error) {
    console.error('Error updating weekly plan:', error);
    return NextResponse.json(
      { error: 'Failed to update weekly plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/weekly-plans/[id] - Delete a weekly plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.weeklyPlan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Weekly plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting weekly plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly plan' },
      { status: 500 }
    );
  }
}
