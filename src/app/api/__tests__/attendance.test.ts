/* eslint-disable no-undef */
import { GET, POST, PUT } from '../attendance/route';
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
    attendance: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    class: {
      findFirst: jest.fn(),
    }
  }
}));

describe('Attendance API', () => {
  let mockRequest: NextRequest;
  const mockDateString = '2024-01-15T00:00:00.000Z';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/attendance', () => {
    beforeEach(() => {
      mockRequest = new NextRequest(
        new Request('http://localhost:3000/api/attendance?classId=1&date=2024-01-15')
      );
    });

    it('should return attendance for admin', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };
      const mockAttendance = {
        id: '1',
        date: mockDateString,
        presentStudentIds: ['1', '2', '3']
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValueOnce(mockAttendance);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendance);
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
  });

  describe('POST /api/attendance', () => {
    beforeEach(() => {
      mockRequest = new NextRequest(
        new Request(
          'http://localhost:3000/api/attendance',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              classId: '1',
              date: '2024-01-15',
              presentStudentIds: ['1', '2', '3']
            })
          }
        )
      );
    });

    it('should create attendance record as admin', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };
      const mockAttendance = {
        id: '1',
        classId: '1',
        date: mockDateString,
        presentStudentIds: ['1', '2', '3']
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.attendance.create as jest.Mock).mockResolvedValueOnce(mockAttendance);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Attendance created successfully",
        data: mockAttendance
      });
    });

    it('should prevent duplicate attendance records', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        date: mockDateString
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({ 
        error: "Attendance record already exists for this date" 
      });
    });
  });

  describe('PUT /api/attendance', () => {
    beforeEach(() => {
      mockRequest = new NextRequest(
        new Request(
          'http://localhost:3000/api/attendance',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              classId: '1',
              date: '2024-01-15',
              presentStudentIds: ['1', '2', '4']
            })
          }
        )
      );
    });

    it('should update attendance record as admin', async () => {
      const mockAuth = {
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      };
      const mockAttendance = {
        id: '1',
        classId: '1',
        date: mockDateString,
        presentStudentIds: ['1', '2', '4']
      };

      ((auth as unknown) as jest.Mock).mockResolvedValueOnce(mockAuth);
      (prisma.attendance.update as jest.Mock).mockResolvedValueOnce(mockAttendance);

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Attendance updated successfully",
        data: mockAttendance
      });
    });

    it('should verify teacher access for updates', async () => {
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

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: "Unauthorized to access this class" });
    });
  });
});