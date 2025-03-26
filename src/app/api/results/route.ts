import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;

    // HANDLE TEACHER PERFORMANCE AGGREGATION
    if (teacherId) {
      // Check authorization
      if (!['admin', 'teacher'].includes(role || '')) {
        return new Response('Unauthorized', { status: 403 });
      }
      
      // For teachers, only allow them to see their own performance data
      if (role === 'teacher' && userId !== teacherId) {
        return new Response('Unauthorized', { status: 403 });
      }
      
      // Get all results for students in classes supervised by this teacher
      // Using a single, optimized query
      const teacherResults = await prisma.result.findMany({
        where: {
          OR: [
            {
              exam: {
                subject: { teacherId }
              }
            },
            {
              assignment: {
                subject: { teacherId }
              }
            }
          ]
        },
        select: {
          score: true,
        }
      });
      
      // Calculate average score
      if (teacherResults.length === 0) {
        return new Response(JSON.stringify({ 
          averageScore: 0, 
          totalResults: 0 
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const totalScore = teacherResults.reduce((sum, result) => sum + result.score, 0);
      const averageScore = totalScore / teacherResults.length;
      
      return new Response(JSON.stringify({
        averageScore,
        totalResults: teacherResults.length
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // HANDLE STUDENT-SPECIFIC RESULTS
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
    logger.error('Error fetching results:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}