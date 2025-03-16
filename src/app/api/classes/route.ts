// This file can be safely removed as we're now handling classes through relatedData
// Keeping this file as a placeholder in case you need a classes API endpoint in the future

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
    const currentUserId = userId;

    // Define query conditions based on role
    let query = {};
    
    if (role === "teacher") {
      query = {
        OR: [
          { supervisorId: currentUserId },
          { subjects: { some: { teacherId: currentUserId } } },
        ]
      };
    } else if (role === "student") {
      query = {
        students: { some: { id: currentUserId } }
      };
    } else if (role === "parent") {
      query = {
        students: { some: { parentId: currentUserId } }
      };
    }

    const classes = await prisma.class.findMany({
      where: query,
      select: { 
        id: true, 
        name: true 
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`API: Found ${classes.length} classes for ${role} ${currentUserId}`);
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}