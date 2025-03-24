import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!role || !["admin", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    // If teacher, verify they have access to this class
    if (role === "teacher") {
      const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
      const teacherClass = await prisma.class.findFirst({
        where: {
          id: classId,
          supervisorId: userId,
        },
      });

      if (!teacherClass) {
        return NextResponse.json({ error: "Unauthorized to access this class" }, { status: 403 });
      }
    }

    // Get students in the class
    const students = await prisma.student.findMany({
      where: {
        classId: classId,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        img: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    logger.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
