// This file can be safely removed as we're now handling classes through relatedData
// Keeping this file as a placeholder in case you need a classes API endpoint in the future

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;

    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const teacherId = url.searchParams.get("teacherId");

    // For admin, return all classes
    if (role === "admin") {
      const classes = await prisma.class.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return NextResponse.json(classes);
    } 
    // For teacher, return only classes they supervise
    else if (role === "teacher") {
      const classes = await prisma.class.findMany({
        where: {
          supervisorId: userId || teacherId,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return NextResponse.json(classes);
    }
    // For other roles, return empty array
    else {
      return NextResponse.json([]);
    }
  } catch (error) {
    logger.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}