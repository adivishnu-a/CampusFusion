import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils";

// eslint-disable-next-line no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;

    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ 
      role,
      userId
    });
  } catch (error) {
    logger.error("Error fetching user role:", error);
    return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 });
  }
}
