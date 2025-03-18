import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;

    if (studentId) {
      // Handle student-specific results (existing code)
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

      // Student-specific query remains unchanged
      const results = await prisma.result.findMany({
        where: { studentId },
        include: {
          exam: {
            include: {
              subject: {
                select: {
                  name: true,
                  teacherId: true,
                  class: { select: { name: true } }
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
                  class: { select: { name: true } }
                }
              }
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              surname: true,
              class: { select: { name: true } }
            }
          }
        }
      });

      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For general results (grade averages)
    if (!['admin', 'teacher'].includes(role || '')) {
      return new Response('Unauthorized', { status: 403 });
    }

    const query = role === 'teacher' 
      ? {
          OR: [
            { exam: { subject: { teacherId: userId } } },
            { assignment: { subject: { teacherId: userId } } }
          ]
        }
      : {};

    // Get all results with their class information
    const results = await prisma.result.findMany({
      where: query,
      include: {
        student: {
          select: {
            id: true,
            class: {
              select: { 
                name: true,
                grade: {
                  select: { level: true }
                }
              }
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