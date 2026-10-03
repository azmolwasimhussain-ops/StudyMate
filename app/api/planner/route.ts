import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";
import { generateStudyPlan } from "@/lib/ai";

export const maxDuration = 120;

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const plans = await prisma.studyPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: {
          orderBy: { day: "asc" },
        },
      },
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load study plans." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { goal, examDate, hoursPerDay = 2, topics = [] } = body;

    if (!goal || !goal.trim()) {
      return NextResponse.json(
        { error: "Study goal or exam name is required." },
        { status: 400 }
      );
    }

    const topicList =
      Array.isArray(topics) && topics.length > 0
        ? topics
        : ["Fundamentals", "Core Concepts", "Advanced Applications", "Comprehensive Review"];

    let aiPlan;
    try {
      aiPlan = await generateStudyPlan({
        goal: goal.trim(),
        examDate: examDate || undefined,
        hoursPerDay: Number(hoursPerDay) || 2,
        topics: topicList,
      });
    } catch (aiErr: any) {
      console.error("Study plan AI error:", aiErr);
      return NextResponse.json(
        {
          error:
            "AI failed to generate study plan. Verify Ollama is running. " +
            (aiErr.message || ""),
        },
        { status: 503 }
      );
    }

    // Persist to database
    const plan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        title: aiPlan.title || `${goal} Study Schedule`,
        goal: goal.trim(),
        examDate: examDate ? new Date(examDate) : null,
        hoursPerDay: Number(hoursPerDay) || 2,
        topics: topicList,
        tasks: {
          create: (aiPlan.tasks || []).map((t: any) => ({
            day: Number(t.day) || 1,
            title: t.title || "Study Session",
            description: t.description || null,
            duration: Number(t.duration) || Number(hoursPerDay) || 2,
            completed: false,
          })),
        },
      },
      include: {
        tasks: {
          orderBy: { day: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      planId: plan.id,
      plan,
    });
  } catch (error: any) {
    console.error("Planner POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create study plan." },
      { status: 500 }
    );
  }
}
