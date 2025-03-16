// This file can be safely removed as we're now handling classes through relatedData
// Keeping this file as a placeholder in case you need a classes API endpoint in the future

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      select: { 
        id: true, 
        name: true 
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`API: Found ${classes.length} classes`);
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}