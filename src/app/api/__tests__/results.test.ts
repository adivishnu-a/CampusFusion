/* eslint-disable no-undef */
import { GET } from '../results/route';
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
    result: {
      findMany: jest.fn()
    },
    student: {
      findUnique: jest.fn()
    }
  }
}));

describe('Results API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/results', () => {
    it('should return student-specific results for self', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/results?studentId=123')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { 
            role: 'student',
            userId: '123'
          }
        }
      };
      const mockResults = [
        {
          id: '1',
          score: 85,
          exam: {
            subject: { name: 'Math', teacherId: '1', class: { name: '5A' } }
          },
          student: {
            name: 'John',
            surname: 'Doe',
            class: { name: '5A' }
          }
        }
      ];

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.result.findMany as jest.Mock).mockResolvedValueOnce(mockResults);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResults);
    });

    it('should return student results for parent', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/results?studentId=123')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { 
            role: 'parent',
            userId: '456'
          }
        }
      };
      
      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.student.findUnique as jest.Mock).mockResolvedValueOnce({
        parentId: '456'
      });
      (prisma.result.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return 403 if student tries to access other student results', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/results?studentId=123')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { 
            role: 'student',
            userId: '456'
          }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);

      const response = await GET(mockRequest);

      expect(response.status).toBe(403);
    });

    it('should return 403 if parent tries to access unrelated student results', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/results?studentId=123')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { 
            role: 'parent',
            userId: '456'
          }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.student.findUnique as jest.Mock).mockResolvedValueOnce({
        parentId: '789' // Different parent
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(403);
    });

    it('should return all results for admin', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/results')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };
      
      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.result.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/results')
      );
      
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.result.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await GET(mockRequest);

      expect(response.status).toBe(500);
      expect(await response.text()).toBe('Internal Server Error');
    });
  });
});