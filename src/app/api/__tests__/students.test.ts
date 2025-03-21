/* eslint-disable no-undef */
import { GET } from '../students/route';
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
    student: {
      findMany: jest.fn()
    },
    class: {
      findFirst: jest.fn()
    }
  }
}));

describe('Students API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/students', () => {
    beforeEach(() => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/students?classId=1')
      );
    });

    it('should return students for admin', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };
      const mockStudents = [
        {
          id: '1',
          name: 'John',
          surname: 'Doe',
          img: 'profile1.jpg'
        },
        {
          id: '2',
          name: 'Jane',
          surname: 'Smith',
          img: 'profile2.jpg'
        }
      ];

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.student.findMany as jest.Mock).mockResolvedValueOnce(mockStudents);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockStudents);
    });

    it('should verify teacher access to class', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { 
            role: 'teacher',
            userId: '123'
          }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.class.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: "Unauthorized to access this class" });
    });

    it('should return 401 for unauthorized roles', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'student' }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it('should require classId parameter', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/students')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Class ID is required" });
    });

    it('should handle database errors gracefully', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.student.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to fetch students" });
    });
  });
});