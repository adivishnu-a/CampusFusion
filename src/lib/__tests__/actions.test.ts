/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
import { 
  createDepartment, 
  updateDepartment,
  deleteDepartment,
  createClass, 
  updateClass, 
  deleteClass,
  createTeacher, 
  updateTeacher,
  deleteTeacher,
  createStudent,
  updateStudent, 
  deleteStudent,
  createParent,
  updateParent,
  deleteParent,
  createSubject,
  updateSubject,
  deleteSubject,
  createExam,
  updateExam,
  deleteExam, 
  createEvent, 
  updateEvent,
  deleteEvent,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createResult,
  updateResult,
  deleteResult,
  getEntityName
} from '../actions';
import { auth, clerkClient } from "@clerk/nextjs/server";
import { uploadToS3, deleteObjectFromS3 } from '../s3';
import { Clerk } from "@clerk/clerk-sdk-node";

// Mock dependencies
jest.mock('../s3', () => ({
  uploadToS3: jest.fn(),
  deleteObjectFromS3: jest.fn()
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn()
}));

jest.mock('@clerk/clerk-sdk-node', () => ({
  Clerk: jest.fn()
}));

// Mock prisma
jest.mock('../prisma', () => {
  const mockPrisma = {
    department: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    parent: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    subject: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    exam: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    event: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    announcement: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    result: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    __esModule: true,
    default: mockPrisma
  };
});

// Import mocked prisma
import prisma from '../prisma';

describe('Server Actions', () => {
  const mockCurrentState = { success: false, error: false };
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
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

    it('should handle errors when creating department', async () => {
      const mockData = {
        name: 'Mathematics',
        teachers: ['1', '2']
      };

      (prisma.department.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const result = await createDepartment(mockCurrentState, mockData);
      expect(result).toEqual({ success: false, error: true });
      expect(console.log).toHaveBeenCalled();
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
      expect(prisma.department.update).toHaveBeenCalledWith({
        where: { id: mockData.id },
        data: {
          name: mockData.name,
          teachers: {
            set: mockData.teachers.map(id => ({ id }))
          }
        }
      });
    });

    it('should handle errors when updating department', async () => {
      const mockData = {
        id: '1',
        name: 'Updated Math',
        teachers: ['3', '4']
      };

      (prisma.department.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const result = await updateDepartment(mockCurrentState, mockData);
      expect(result).toEqual({ success: false, error: true });
      expect(console.log).toHaveBeenCalled();
    });

    it('should delete department successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.department.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteDepartment(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.department.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('should handle errors when deleting department', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.department.delete as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      
      const result = await deleteDepartment(mockCurrentState, formData);
      expect(result).toEqual({ success: false, error: true });
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Class Actions', () => {
    it('should create class successfully', async () => {
      const mockData = {
        name: '5A',
        capacity: 30,
        gradeId: '1',
        supervisorId: '10'
      };

      (prisma.class.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...mockData
      });

      const result = await createClass(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.class.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockData)
      });
    });

    it('should create class without supervisor', async () => {
      const mockData = {
        name: '5B',
        capacity: 30,
        gradeId: '1',
        supervisorId: null
      };

      (prisma.class.create as jest.Mock).mockResolvedValueOnce({
        ...mockData,
        id: '1'
      });

      const result = await createClass(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.class.create).toHaveBeenCalledWith({
        data: {
          name: mockData.name,
          capacity: mockData.capacity,
          gradeId: mockData.gradeId
        }
      });
    });

    it('should update class successfully', async () => {
      const mockData = {
        id: '1',
        name: '5A-Updated',
        capacity: 35,
        gradeId: '2',
        supervisorId: '11'
      };

      (prisma.class.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateClass(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.class.update).toHaveBeenCalledWith({
        where: { id: mockData.id },
        data: {
          name: mockData.name,
          capacity: mockData.capacity,
          gradeId: mockData.gradeId,
          supervisorId: mockData.supervisorId
        }
      });
    });

    it('should delete class with no students or subjects', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.class.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        _count: {
          students: 0,
          subjects: 0
        }
      });
      
      (prisma.class.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteClass(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.class.findUnique).toHaveBeenCalled();
      expect(prisma.class.delete).toHaveBeenCalled();
    });

    it('should not delete class with students', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.class.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        _count: {
          students: 5,
          subjects: 0
        }
      });
      
      const result = await deleteClass(mockCurrentState, formData);
      expect(result).toEqual({ success: false, error: true });
      expect(prisma.class.delete).not.toHaveBeenCalled();
    });
  });

  describe('Teacher Actions', () => {
    it('should create teacher with image upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify({
        username: 'teacher1',
        password: 'password123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        departments: ['1', '2']
      }));

      (uploadToS3 as jest.Mock).mockResolvedValue('https://example.com/image.jpg');
      (prisma.teacher.create as jest.Mock).mockResolvedValue({ id: '1' });
      (clerkClient as jest.Mock).mockResolvedValue({
        users: {
          createUser: jest.fn().mockResolvedValue({})
        }
      });

      const result = await createTeacher(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.teacher.create).toHaveBeenCalled();
    });

    it('should update teacher successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify({
        id: '1',
        username: 'teacher1_updated',
        password: 'newpassword',
        name: 'John Updated',
        surname: 'Doe Updated',
        email: 'john_updated@example.com',
        departments: ['3']
      }));

      (uploadToS3 as jest.Mock).mockResolvedValueOnce('https://example.com/image_updated.jpg');
      
      const mockClerk = {
        users: { 
          getUserList: jest.fn().mockResolvedValueOnce([
            { id: 'clerk_123', publicMetadata: { userId: '1' } }
          ])
        }
      };
      (Clerk as jest.Mock).mockReturnValueOnce(mockClerk);
      
      const mockClerkClient = {
        users: { 
          updateUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);

      const result = await updateTeacher(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.teacher.update).toHaveBeenCalled();
      expect(mockClerkClient.users.updateUser).toHaveBeenCalled();
    });

    it('should delete teacher successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      const mockClerk = {
        users: { 
          getUserList: jest.fn().mockResolvedValueOnce([
            { id: 'clerk_123', publicMetadata: { userId: '1' } }
          ])
        }
      };
      (Clerk as jest.Mock).mockReturnValueOnce(mockClerk);
      
      const mockClerkClient = {
        users: { 
          deleteUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);
      
      (prisma.teacher.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        img: 'https://example.com/teachers/profile.jpg'
      });
      
      (deleteObjectFromS3 as jest.Mock).mockResolvedValueOnce({});
      (prisma.teacher.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteTeacher(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(deleteObjectFromS3).toHaveBeenCalled();
      expect(prisma.teacher.delete).toHaveBeenCalled();
      expect(mockClerkClient.users.deleteUser).toHaveBeenCalled();
    });
  });

  describe('Student Actions', () => {
    it('should create student with parent association', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify({
        username: 'student1',
        password: 'password123',
        name: 'Jane',
        surname: 'Doe',
        email: 'jane@example.com',
        classId: '1',
        gradeId: '5',
        parentId: '1',
        gender: 'FEMALE',
        birthday: new Date('2005-01-01').toISOString()
      }));

      (prisma.class.findUnique as jest.Mock).mockResolvedValueOnce({
        capacity: 30,
        _count: { students: 25 }
      });
      (uploadToS3 as jest.Mock).mockResolvedValueOnce('https://example.com/image.jpg');
      (prisma.student.create as jest.Mock).mockResolvedValueOnce({ id: '1' });
      
      const mockClerkClient = {
        users: { 
          createUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);

      const result = await createStudent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.class.findUnique).toHaveBeenCalled();
      expect(prisma.student.create).toHaveBeenCalled();
      expect(mockClerkClient.users.createUser).toHaveBeenCalled();
    });

    it('should not create student when class is at capacity', async () => {
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
        _count: { students: 30 } // Class is full
      });
      
      const result = await createStudent(mockCurrentState, formData);
      expect(result).toEqual({ success: false, error: true });
      expect(prisma.student.create).not.toHaveBeenCalled();
    });

    it('should update student successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify({
        id: '1',
        username: 'student1_updated',
        password: 'newpassword',
        name: 'Jane Updated',
        surname: 'Doe Updated',
        email: 'jane_updated@example.com',
        classId: '2',
        gradeId: '6',
        parentId: '2'
      }));

      (uploadToS3 as jest.Mock).mockResolvedValueOnce('https://example.com/image_updated.jpg');
      
      const mockClerk = {
        users: { 
          getUserList: jest.fn().mockResolvedValueOnce([
            { id: 'clerk_123', publicMetadata: { userId: '1' } }
          ])
        }
      };
      (Clerk as jest.Mock).mockReturnValueOnce(mockClerk);
      
      const mockClerkClient = {
        users: { 
          updateUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);

      const result = await updateStudent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.student.update).toHaveBeenCalled();
      expect(mockClerkClient.users.updateUser).toHaveBeenCalled();
    });

    it('should delete student successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      const mockClerk = {
        users: { 
          getUserList: jest.fn().mockResolvedValueOnce([
            { id: 'clerk_123', publicMetadata: { userId: '1' } }
          ])
        }
      };
      (Clerk as jest.Mock).mockReturnValueOnce(mockClerk);
      
      const mockClerkClient = {
        users: { 
          deleteUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);
      
      (prisma.student.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        img: 'https://example.com/students/profile.jpg'
      });
      
      (deleteObjectFromS3 as jest.Mock).mockResolvedValueOnce({});
      (prisma.student.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteStudent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(deleteObjectFromS3).toHaveBeenCalled();
      expect(prisma.student.delete).toHaveBeenCalled();
      expect(mockClerkClient.users.deleteUser).toHaveBeenCalled();
    });
  });

  describe('Parent Actions', () => {
    it('should create parent successfully', async () => {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        username: 'parent1',
        password: 'password123',
        name: 'Parent',
        surname: 'Smith',
        email: 'parent@example.com',
        phone: '1234567890',
        address: '123 Main St'
      }));
      
      (prisma.parent.create as jest.Mock).mockResolvedValueOnce({ id: '1' });
      
      const mockClerkClient = {
        users: { 
          createUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);

      const result = await createParent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.parent.create).toHaveBeenCalled();
      expect(mockClerkClient.users.createUser).toHaveBeenCalled();
    });

    it('should update parent successfully', async () => {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        id: '1',
        username: 'parent1_updated',
        password: 'newpassword',
        name: 'Parent Updated',
        surname: 'Smith Updated',
        email: 'parent_updated@example.com',
        phone: '9876543210',
        address: '456 Updated St'
      }));
      
      const mockClerk = {
        users: { 
          getUserList: jest.fn().mockResolvedValueOnce([
            { id: 'clerk_123', publicMetadata: { userId: '1' } }
          ])
        }
      };
      (Clerk as jest.Mock).mockReturnValueOnce(mockClerk);
      
      const mockClerkClient = {
        users: { 
          updateUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);

      const result = await updateParent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.parent.update).toHaveBeenCalled();
      expect(mockClerkClient.users.updateUser).toHaveBeenCalled();
    });

    it('should delete parent with no students', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.parent.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        _count: { students: 0 }
      });
      
      const mockClerk = {
        users: { 
          getUserList: jest.fn().mockResolvedValueOnce([
            { id: 'clerk_123', publicMetadata: { userId: '1' } }
          ])
        }
      };
      (Clerk as jest.Mock).mockReturnValueOnce(mockClerk);
      
      const mockClerkClient = {
        users: { 
          deleteUser: jest.fn().mockResolvedValueOnce({})
        }
      };
      (clerkClient as jest.Mock).mockResolvedValueOnce(mockClerkClient);
      
      (prisma.parent.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteParent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.parent.delete).toHaveBeenCalled();
      expect(mockClerkClient.users.deleteUser).toHaveBeenCalled();
    });

    it('should not delete parent with students', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.parent.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        _count: { students: 2 }
      });
      
      const result = await deleteParent(mockCurrentState, formData);
      expect(result).toEqual({ success: false, error: true });
      expect(prisma.parent.delete).not.toHaveBeenCalled();
    });
  });

  describe('Subject Actions', () => {
    it('should create subject successfully', async () => {
      const mockData = {
        name: 'Advanced Math',
        day: 'MONDAY' as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY',
        startTime: new Date('2023-01-01T09:00:00'),
        endTime: new Date('2023-01-01T10:30:00'),
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
      expect(prisma.subject.create).toHaveBeenCalledWith({
        data: mockData
      });
    });

    it('should update subject successfully', async () => {
      const mockData = {
        id: '1',
        name: 'Updated Math',
        day: 'TUESDAY' as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY',
        startTime: new Date('2023-01-01T10:00:00'),
        endTime: new Date('2023-01-01T11:30:00'),
        departmentId: '2',
        classId: '2',
        teacherId: '2'
      };

      (prisma.subject.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateSubject(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.subject.update).toHaveBeenCalledWith({
        where: { id: mockData.id },
        data: {
          name: mockData.name,
          day: mockData.day,
          startTime: mockData.startTime,
          endTime: mockData.endTime,
          departmentId: mockData.departmentId,
          classId: mockData.classId,
          teacherId: mockData.teacherId
        }
      });
    });

    it('should delete subject successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.subject.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteSubject(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.subject.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });

  describe('Exam Actions', () => {
    it('should create exam with admin authorization', async () => {
      const mockData = {
        title: 'Math Test',
        startTime: new Date('2023-06-01T09:00:00'),
        endTime: new Date('2023-06-01T11:00:00'),
        subjectId: '1'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });

      (prisma.exam.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createExam(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.exam.create).toHaveBeenCalled();
    });

    it('should create exam with teacher authorization', async () => {
      const mockData = {
        title: 'Math Test',
        startTime: new Date('2023-06-01T09:00:00'),
        endTime: new Date('2023-06-01T11:00:00'),
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

    it('should not create exam when teacher does not own subject', async () => {
      const mockData = {
        title: 'Math Test',
        startTime: new Date('2023-06-01T09:00:00'),
        endTime: new Date('2023-06-01T11:00:00'),
        subjectId: '1'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'teacher', userId: '1' }
        }
      });

      (prisma.subject.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const result = await createExam(mockCurrentState, mockData);
      expect(result).toEqual({ success: false, error: true });
      expect(prisma.exam.create).not.toHaveBeenCalled();
    });

    it('should update exam successfully', async () => {
      const mockData = {
        id: '1',
        title: 'Updated Math Test',
        startTime: new Date('2023-06-02T09:00:00'),
        endTime: new Date('2023-06-02T11:00:00'),
        subjectId: '1'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });

      (prisma.exam.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateExam(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.exam.update).toHaveBeenCalled();
    });

    it('should delete exam successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });
      
      (prisma.exam.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteExam(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.exam.delete).toHaveBeenCalled();
    });
  });

  describe('Assignment Actions', () => {
    it('should create assignment with admin authorization', async () => {
      const mockData = {
        title: 'Math Assignment',
        startDate: new Date('2023-06-01'),
        dueDate: new Date('2023-06-08'),
        subjectId: '1'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });

      (prisma.assignment.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createAssignment(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.assignment.create).toHaveBeenCalled();
    });

    it('should create assignment with teacher authorization', async () => {
      const mockData = {
        title: 'Math Assignment',
        startDate: new Date('2023-06-01'),
        dueDate: new Date('2023-06-08'),
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

      (prisma.assignment.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createAssignment(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.subject.findFirst).toHaveBeenCalled();
      expect(prisma.assignment.create).toHaveBeenCalled();
    });

    it('should update assignment successfully', async () => {
      const mockData = {
        id: '1',
        title: 'Updated Math Assignment',
        startDate: new Date('2023-06-02'),
        dueDate: new Date('2023-06-09'),
        subjectId: '1'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });

      (prisma.assignment.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateAssignment(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.assignment.update).toHaveBeenCalled();
    });

    it('should delete assignment successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });
      
      (prisma.assignment.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteAssignment(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.assignment.delete).toHaveBeenCalled();
    });
  });

  describe('Result Actions', () => {
    it('should create exam result with admin authorization', async () => {
      const mockData = {
        score: 85,
        studentId: '1',
        examId: '1',
        assessmentType: 'exam' as 'exam' | 'assignment'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });

      (prisma.result.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createResult(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.result.create).toHaveBeenCalled();
    });

    it('should create assignment result with teacher authorization', async () => {
      const mockData = {
        score: 90,
        studentId: '1',
        assignmentId: '1',
        assessmentType: 'assignment' as 'exam' | 'assignment'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'teacher', userId: '1' }
        }
      });

      (prisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        subject: { teacherId: '1' }
      });

      (prisma.result.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createResult(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.result.create).toHaveBeenCalled();
    });

    it('should update result successfully', async () => {
      const mockData = {
        id: '1',
        score: 95,
        studentId: '1',
        examId: '1',
        assessmentType: 'exam' as 'exam' | 'assignment'
      };

      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });

      (prisma.result.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateResult(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.result.update).toHaveBeenCalled();
    });

    it('should delete result successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (auth as unknown as jest.Mock).mockResolvedValueOnce({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      });
      
      (prisma.result.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteResult(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.result.delete).toHaveBeenCalled();
    });
  });

  describe('Event Actions', () => {
    it('should create school-wide event', async () => {
      const mockData = {
        title: 'School Day',
        description: 'Annual celebration',
        startTime: new Date('2023-06-01T09:00:00'),
        endTime: new Date('2023-06-01T15:00:00')
      };

      (prisma.event.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createEvent(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: mockData.title,
          description: mockData.description,
          startTime: mockData.startTime,
          endTime: mockData.endTime
        }
      });
    });

    it('should create class-specific event', async () => {
      const mockData = {
        title: 'Class Party',
        description: 'End of year party',
        startTime: new Date('2023-06-15T13:00:00'),
        endTime: new Date('2023-06-15T15:00:00'),
        classId: '1'
      };

      (prisma.event.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createEvent(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: mockData.title,
          description: mockData.description,
          startTime: mockData.startTime,
          endTime: mockData.endTime,
          class: { connect: { id: mockData.classId } }
        }
      });
    });

    it('should update event successfully', async () => {
      const mockData = {
        id: '1',
        title: 'Updated Event',
        description: 'Updated description',
        startTime: new Date('2023-06-02T10:00:00'),
        endTime: new Date('2023-06-02T12:00:00'),
        classId: '2'
      };

      (prisma.event.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateEvent(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.event.update).toHaveBeenCalled();
    });

    it('should delete event successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.event.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteEvent(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });

  describe('Announcement Actions', () => {
    it('should create class-specific announcement', async () => {
      const mockData = {
        title: 'Class Notice',
        description: 'Important information',
        date: new Date('2023-06-01'),
        classId: '1'
      };

      (prisma.announcement.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createAnnouncement(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.announcement.create).toHaveBeenCalledWith({
        data: {
          title: mockData.title,
          description: mockData.description,
          date: mockData.date,
          class: { connect: { id: mockData.classId } }
        }
      });
    });

    it('should create school-wide announcement', async () => {
      const mockData = {
        title: 'School Announcement',
        description: 'Important school information',
        date: new Date('2023-06-01')
      };

      (prisma.announcement.create as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockData
      });

      const result = await createAnnouncement(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.announcement.create).toHaveBeenCalledWith({
        data: {
          title: mockData.title,
          description: mockData.description,
          date: mockData.date
        }
      });
    });

    it('should update announcement successfully', async () => {
      const mockData = {
        id: '1',
        title: 'Updated Announcement',
        description: 'Updated information',
        date: new Date('2023-06-02'),
        classId: '2'
      };

      (prisma.announcement.update as jest.Mock).mockResolvedValueOnce({
        ...mockData
      });

      const result = await updateAnnouncement(mockCurrentState, mockData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.announcement.update).toHaveBeenCalled();
    });

    it('should delete announcement successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      
      (prisma.announcement.delete as jest.Mock).mockResolvedValueOnce({});
      
      const result = await deleteAnnouncement(mockCurrentState, formData);
      expect(result).toEqual({ success: true, error: false });
      expect(prisma.announcement.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });

  describe('Utility Functions', () => {
    it('should get student name', async () => {
      const mockStudent = {
        name: 'John',
        surname: 'Doe'
      };

      (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
      
      const result = await getEntityName('students', '1');
      expect(result).toEqual(mockStudent);
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { name: true, surname: true }
      });
    });
    
    it('should get teacher name', async () => {
      (prisma.teacher.findUnique as jest.Mock).mockResolvedValueOnce({
        name: 'Jane',
        surname: 'Smith'
      });
      
      const result = await getEntityName('teachers', '1');
      expect(result).toEqual({ name: 'Jane', surname: 'Smith' });
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { name: true, surname: true }
      });
    });
    
    it('should return null for unknown entity type', async () => {
      const result = await getEntityName('unknown', '1');
      expect(result).toBeNull();
    });
    
    it('should handle errors when getting entity name', async () => {
      (prisma.student.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      
      const result = await getEntityName('students', '1');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
