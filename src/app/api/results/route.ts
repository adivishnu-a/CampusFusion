import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return new Response('Student ID is required', { status: 400 });
    }

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;

    // Access control
    if (role === 'student' && userId !== studentId) {
      return new Response('Unauthorized', { status: 403 });
    }
    if (role === 'parent') {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { parentId: true }
      });
      if (student?.parentId !== userId) {
        return new Response('Unauthorized', { status: 403 });
      }
    }

    // Fetch ALL results with their assessment details
    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        exam: {
          include: {
            subject: {
              select: {
                name: true,
                teacherId: true,
                class: {
                  select: { name: true }
                }
              }
            }
          }
        },
        assignment: {
          include: {
            subject: {
              select: {
                name: true,
                teacherId: true,
                class: {
                  select: { name: true }
                }
              }
            }
          }
        },
        student: {
          select: {
            name: true,
            surname: true,
            class: {
              select: { name: true }
            }
          }
        }
      }
    });

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}