/* eslint-disable no-undef */
import { GET } from '../classes/route';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    class: {
      findMany: jest.fn()
    }
  }
}));

describe('Classes API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest(
      new Request('http://localhost:3000/api/classes')
    );
  });

  it('should return all classes for admin', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: { role: 'admin' }
      }
    };
    const mockClasses = [
      { id: '1', name: '5A' },
      { id: '2', name: '5B' }
    ];

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
    (prisma.class.findMany as jest.Mock).mockResolvedValueOnce(mockClasses);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockClasses);
    expect(prisma.class.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  });

  it('should return supervised classes for teacher', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: { 
          role: 'teacher',
          userId: '123'
        }
      }
    };
    const mockClasses = [
      { id: '1', name: '5A' }
    ];

    mockRequest = new NextRequest(
      new Request('http://localhost:3000/api/classes?teacherId=123')
    );

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
    (prisma.class.findMany as jest.Mock).mockResolvedValueOnce(mockClasses);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockClasses);
    expect(prisma.class.findMany).toHaveBeenCalledWith({
      where: {
        supervisorId: '123',
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  });

  it('should return empty array for other roles', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: { role: 'student' }
      }
    };

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
    expect(prisma.class.findMany).not.toHaveBeenCalled();
  });

  it('should return 401 if no role is present', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: {}
      }
    };

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it('should handle database errors gracefully', async () => {
    const mockAuth = {
      sessionClaims: {
        metadata: { role: 'admin' }
      }
    };

    ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
    (prisma.class.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to fetch classes" });
  });
});