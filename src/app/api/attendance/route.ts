import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils";

// GET: Fetch attendance for a specific class and date
export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    if (!role || !["admin", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");
    const dateParam = url.searchParams.get("date");

    if (!classId || !dateParam) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Convert date string to Date object (without time)
    const date = new Date(dateParam);
    date.setUTCHours(0, 0, 0, 0);

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

    // Find attendance record
    const attendance = await prisma.attendance.findUnique({
      where: {
        classId_date: {
          classId: classId,
          date: date,
        },
      },
      select: {
        id: true,
        date: true,
        presentStudentIds: true,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    logger.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST: Create new attendance record
export async function POST(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    if (!role || !["admin", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId, date: dateString, presentStudentIds } = await request.json();

    if (!classId || !dateString) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Convert date string to Date object (without time)
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);

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

    // Check if attendance record already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        classId_date: {
          classId,
          date,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record already exists for this date" },
        { status: 409 }
      );
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        classId,
        date,
        presentStudentIds: presentStudentIds || [],
      },
    });

    return NextResponse.json({
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    logger.error("Error creating attendance:", error);
    return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 });
  }
}

// PUT: Update existing attendance record
export async function PUT(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    if (!role || !["admin", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId, date: dateString, presentStudentIds } = await request.json();

    if (!classId || !dateString) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Convert date string to Date object (without time)
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);

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

    // Update existing attendance record
    const attendance = await prisma.attendance.update({
      where: {
        classId_date: {
          classId,
          date,
        },
      },
      data: {
        presentStudentIds,
      },
    });

    return NextResponse.json({
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    logger.error("Error updating attendance:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
