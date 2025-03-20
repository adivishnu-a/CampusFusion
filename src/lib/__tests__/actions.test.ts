/* eslint-disable no-undef */
import { createDepartment, updateDepartment, createTeacher, createStudent, createSubject, createExam, createEvent, createAnnouncement } from '../actions';
import { auth, clerkClient } from "@clerk/nextjs/server";
import { uploadToS3 } from '../s3';

// Mock dependencies first
jest.mock('../s3');
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn()
}));

// Mock prisma with a factory approach to avoid hoisting issues
jest.mock('../prisma', () => {
  return {
    __esModule: true,
    default: {
      department: {
        create: jest.fn(),
        update: jest.fn(),
      },
      teacher: {
        create: jest.fn(),
      },
      class: {
        findUnique: jest.fn(),
      },
      student: {
        create: jest.fn(),
      },
      subject: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      exam: {
        create: jest.fn(),
      },
      event: {
        create: jest.fn(),
      },
      announcement: {
        create: jest.fn(),
      },
    }
  };
});

// Import mocked prisma
import prisma from '../prisma';

describe('Server Actions', () => {
  const mockCurrentState = { success: false, error: false };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Department Actions', () => {
    it('should create department successfully', async () => {
      const mockData = {
        name: 'Mathematics',
        teachers: ['1', '2']
      };

      (prisma.department.create as jest.Mock).mockResolvedValueOnce({
        ...mockData,
        id: '1'
      });

      const result = await createDepartment(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.department.create).toHaveBeenCalledWith({
        data: {
          name: mockData.name,
          teachers: {
            connect: mockData.teachers.map(id => ({ id }))
          }
        }
      });
    });

    it('should update department successfully', async () => {
      const mockData = {
        id: '1',
        name: 'Updated Math',
        teachers: ['3', '4']
      };

      (prisma.department.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateDepartment(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.department.update).toHaveBeenCalled();
    });
  });

  describe('Teacher Actions', () => {
    it('should create teacher with image upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify({
        username: 'teacher1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com'
      }));

      (uploadToS3 as jest.Mock).mockResolvedValueOnce('https://example.com/image.jpg');
      (prisma.teacher.create as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (clerkClient as jest.Mock).mockImplementation(() => ({
        users: { createUser: jest.fn().mockResolvedValueOnce({}) }
      }));

      const result = await createTeacher(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.teacher.create).toHaveBeenCalled();
    });
  });

  describe('Student Actions', () => {
    it('should create student with parent association', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify({
        username: 'student1',
        name: 'Jane',
        surname: 'Doe',
        classId: '1',
        parentId: '1'
      }));

      (prisma.class.findUnique as jest.Mock).mockResolvedValueOnce({
        capacity: 30,
        _count: { students: 25 }
      });
      (uploadToS3 as jest.Mock).mockResolvedValueOnce('https://example.com/image.jpg');
      (prisma.student.create as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (clerkClient as jest.Mock).mockImplementation(() => ({
        users: { createUser: jest.fn().mockResolvedValueOnce({}) }
      }));

      const result = await createStudent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.class.findUnique).toHaveBeenCalled();
      expect(prisma.student.create).toHaveBeenCalled();
    });
  });

  describe('Subject Actions', () => {
    it('should create subject successfully', async () => {
      const mockData = {
        name: 'Advanced Math',
        day: 'MONDAY' as const,
        startTime: new Date(),
        endTime: new Date(),
        departmentId: '1',
        classId: '1',
        teacherId: '1'
      };

      (prisma.subject.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createSubject(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.subject.create).toHaveBeenCalled();
    });
  });

  describe('Exam Actions', () => {
    it('should create exam with teacher authorization', async () => {
      const mockData = {
        title: 'Math Test',
        startTime: new Date(),
        endTime: new Date(),
        subjectId: '1'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'teacher', userId: '1' }
        }
      });

      (prisma.subject.findFirst as jest.Mock).mockResolvedValueOnce({
        id: '1',
        teacherId: '1'
      });

      (prisma.exam.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createExam(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.subject.findFirst).toHaveBeenCalled();
      expect(prisma.exam.create).toHaveBeenCalled();
    });
  });

  describe('Event Actions', () => {
    it('should create school-wide event', async () => {
      const mockData = {
        title: 'School Day',
        description: 'Annual celebration',
        startTime: new Date(),
        endTime: new Date()
      };

      (prisma.event.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createEvent(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.event.create).toHaveBeenCalled();
    });
  });

  describe('Announcement Actions', () => {
    it('should create class-specific announcement', async () => {
      const mockData = {
        title: 'Class Notice',
        description: 'Important information',
        date: new Date(),
        classId: '1'
      };

      (prisma.announcement.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createAnnouncement(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.announcement.create).toHaveBeenCalled();
    });
  });
});
