import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/vision - Get the current vision
export async function GET() {
  try {
    // Get the first vision (assuming single user app for now)
    const vision = await prisma.vision.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!vision) {
      // Create a default vision if none exists
      const newVision = await prisma.vision.create({
        data: {},
      });
      return NextResponse.json(newVision);
    }

    // Parse the goals if they exist
    const visionData = {
      ...vision,
      twelveWeekGoals: vision.twelveWeekGoals ? JSON.parse(vision.twelveWeekGoals) : [],
    };

    return NextResponse.json(visionData);
  } catch (error) {
    console.error('Error fetching vision:', error);
    return NextResponse.json({ error: 'Failed to fetch vision' }, { status: 500 });
  }
}

// POST /api/vision - Update the vision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threeYearVision, twelveWeekGoals } = body;

    // Get the first vision (assuming single user app for now)
    let vision = await prisma.vision.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!vision) {
      // Create a new vision if none exists
      vision = await prisma.vision.create({
        data: {
          threeYearVision: threeYearVision || '',
          twelveWeekGoals: JSON.stringify(twelveWeekGoals || []),
        },
      });
    } else {
      // Update the existing vision
      vision = await prisma.vision.update({
        where: { id: vision.id },
        data: {
          threeYearVision: threeYearVision || '',
          twelveWeekGoals: JSON.stringify(twelveWeekGoals || []),
        },
      });
    }

    // Return the updated vision with parsed goals
    const visionData = {
      ...vision,
      twelveWeekGoals: vision.twelveWeekGoals ? JSON.parse(vision.twelveWeekGoals) : [],
    };

    return NextResponse.json(visionData);
  } catch (error) {
    console.error('Error updating vision:', error);
    return NextResponse.json({ error: 'Failed to update vision' }, { status: 500 });
  }
}
