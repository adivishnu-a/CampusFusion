/* eslint-disable no-undef */
import {
  departmentSchema,
  classSchema,
  teacherSchema,
  parentSchema,
  studentSchema,
  examSchema,
  subjectSchema,
  assignmentSchema,
  resultSchema,
  eventSchema,
  announcementSchema
} from '../formValidationSchemas';

describe('Department Schema Validation', () => {
  it('should validate a valid department', () => {
    const validDepartment = {
      name: 'Mathematics',
      teachers: ['1', '2']
    };
    
    const result = departmentSchema.safeParse(validDepartment);
    expect(result.success).toBe(true);
  });

  it('should reject a department without name', () => {
    const invalidDepartment = {
      name: '',
      teachers: ['1']
    };
    
    const result = departmentSchema.safeParse(invalidDepartment);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name');
    }
  });
});

describe('Class Schema Validation', () => {
  it('should validate a valid class', () => {
    const validClass = {
      name: '5A',
      capacity: 30,
      gradeId: '1',
      supervisorId: '10'
    };
    
    const result = classSchema.safeParse(validClass);
    expect(result.success).toBe(true);
  });

  it('should accept a class without supervisor', () => {
    const classWithoutSupervisor = {
      name: '5B',
      capacity: 25,
      gradeId: '2',
      supervisorId: null
    };
    
    const result = classSchema.safeParse(classWithoutSupervisor);
    expect(result.success).toBe(true);
  });

  it('should reject a class with excessive capacity', () => {
    const invalidClass = {
      name: '5C',
      capacity: 150,
      gradeId: '3'
    };
    
    const result = classSchema.safeParse(invalidClass);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('capacity');
    }
  });
});

describe('Teacher Schema Validation', () => {
  it('should validate a valid teacher', () => {
    const validTeacher = {
      username: 'teacher123',
      password: 'password123',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      bloodType: 'O+',
      birthday: new Date('1980-01-01'),
      gender: 'MALE',
      departments: ['1', '2']
    };
    
    const result = teacherSchema.safeParse(validTeacher);
    expect(result.success).toBe(true);
  });

  it('should allow empty password for updates', () => {
    const teacherUpdate = {
      id: '1',
      username: 'teacher123',
      password: '',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      bloodType: 'O+',
      birthday: new Date('1980-01-01'),
      gender: 'MALE',
      departments: ['1', '2']
    };
    
    const result = teacherSchema.safeParse(teacherUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalidTeacher = {
      username: 'teacher123',
      password: 'password123',
      name: 'John',
      surname: 'Doe',
      email: 'invalid-email',
      phone: '1234567890',
      address: '123 Main St',
      bloodType: 'O+',
      birthday: new Date('1980-01-01'),
      gender: 'MALE'
    };
    
    const result = teacherSchema.safeParse(invalidTeacher);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should reject invalid gender value', () => {
    const invalidTeacher = {
      username: 'teacher123',
      password: 'password123',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      bloodType: 'O+',
      birthday: new Date('1980-01-01'),
      gender: 'OTHER' // Invalid gender value
    };
    
    const result = teacherSchema.safeParse(invalidTeacher);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('gender');
    }
  });
});

describe('Parent Schema Validation', () => {
  it('should validate a valid parent', () => {
    const validParent = {
      username: 'parent123',
      password: 'password123',
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '9876543210',
      address: '456 Elm St'
    };
    
    const result = parentSchema.safeParse(validParent);
    expect(result.success).toBe(true);
  });

  it('should reject a parent without phone number', () => {
    const invalidParent = {
      username: 'parent123',
      password: 'password123',
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '',
      address: '456 Elm St'
    };
    
    const result = parentSchema.safeParse(invalidParent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('phone');
    }
  });
});

describe('Student Schema Validation', () => {
  it('should validate a valid student', () => {
    const validStudent = {
      username: 'student123',
      password: 'password123',
      name: 'Alex',
      surname: 'Johnson',
      email: 'alex.j@example.com',
      phone: '5551234567',
      address: '789 Oak St',
      bloodType: 'A+',
      birthday: new Date('2005-05-15'),
      gender: 'MALE',
      gradeId: '5',
      classId: '10',
      parentId: '3'
    };
    
    const result = studentSchema.safeParse(validStudent);
    expect(result.success).toBe(true);
  });

  it('should reject a student without class ID', () => {
    const invalidStudent = {
      username: 'student123',
      password: 'password123',
      name: 'Alex',
      surname: 'Johnson',
      email: 'alex.j@example.com',
      phone: '5551234567',
      address: '789 Oak St',
      bloodType: 'A+',
      birthday: new Date('2005-05-15'),
      gender: 'MALE',
      gradeId: '5',
      classId: '',
      parentId: '3'
    };
    
    const result = studentSchema.safeParse(invalidStudent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('classId');
    }
  });
});

describe('Exam Schema Validation', () => {
  it('should validate a valid exam', () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 3600000); // 1 hour later
    
    const validExam = {
      title: 'Mathematics Final Exam',
      startTime,
      endTime,
      subjectId: '5'
    };
    
    const result = examSchema.safeParse(validExam);
    expect(result.success).toBe(true);
  });

  it('should reject an exam with end time before start time', () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() - 3600000); // 1 hour earlier
    
    const invalidExam = {
      title: 'Mathematics Final Exam',
      startTime,
      endTime,
      subjectId: '5'
    };
    
    const result = examSchema.safeParse(invalidExam);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('endTime');
    }
  });
});

describe('Subject Schema Validation', () => {
  it('should validate a valid subject', () => {
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(10, 30, 0, 0);
    
    const validSubject = {
      name: 'Advanced Algebra',
      day: 'MONDAY',
      startTime,
      endTime,
      departmentId: '1',
      classId: '5',
      teacherId: '7'
    };
    
    const result = subjectSchema.safeParse(validSubject);
    expect(result.success).toBe(true);
  });

  it('should reject a subject with invalid day', () => {
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(10, 30, 0, 0);
    
    const invalidSubject = {
      name: 'Advanced Algebra',
      day: 'SUNDAY', // Invalid day
      startTime,
      endTime,
      departmentId: '1',
      classId: '5',
      teacherId: '7'
    };
    
    const result = subjectSchema.safeParse(invalidSubject);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('day');
    }
  });
});

describe('Assignment Schema Validation', () => {
  it('should validate a valid assignment', () => {
    const startDate = new Date();
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 7); // 1 week later
    
    const validAssignment = {
      title: 'Research Paper',
      startDate,
      dueDate,
      subjectId: '3'
    };
    
    const result = assignmentSchema.safeParse(validAssignment);
    expect(result.success).toBe(true);
  });

  it('should reject an assignment with due date before start date', () => {
    const startDate = new Date();
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() - 1); // 1 day earlier
    
    const invalidAssignment = {
      title: 'Research Paper',
      startDate,
      dueDate,
      subjectId: '3'
    };
    
    const result = assignmentSchema.safeParse(invalidAssignment);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('dueDate');
    }
  });
});

describe('Result Schema Validation', () => {
  it('should validate a valid exam result', () => {
    const validResult = {
      score: 85,
      studentId: '10',
      examId: '5',
      assessmentType: 'exam'
    };
    
    const result = resultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it('should validate a valid assignment result', () => {
    const validResult = {
      score: 92,
      studentId: '10',
      assignmentId: '3',
      assessmentType: 'assignment'
    };
    
    const result = resultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it('should reject a result with score out of range', () => {
    const invalidResult = {
      score: 120,
      studentId: '10',
      examId: '5',
      assessmentType: 'exam'
    };
    
    const result = resultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('score');
    }
  });

  it('should reject a result with missing exam ID for exam type', () => {
    const invalidResult = {
      score: 85,
      studentId: '10',
      assignmentId: '3',
      assessmentType: 'exam'
    };
    
    const result = resultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('examId');
    }
  });
});

describe('Event Schema Validation', () => {
  it('should validate a valid event with class', () => {
    const startTime = new Date();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);
    
    const validEvent = {
      title: 'Science Fair',
      description: 'Annual science fair for all students',
      startTime,
      endTime,
      classId: '5'
    };
    
    const result = eventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('should validate a school-wide event without class', () => {
    const startTime = new Date();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 3);
    
    const schoolWideEvent = {
      title: 'School Assembly',
      description: 'End of year assembly',
      startTime,
      endTime,
      classId: null
    };
    
    const result = eventSchema.safeParse(schoolWideEvent);
    expect(result.success).toBe(true);
  });

  it('should reject an event with title too long', () => {
    const startTime = new Date();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);
    
    const invalidEvent = {
      title: 'A'.repeat(100), // Too long title
      description: 'Annual science fair for all students',
      startTime,
      endTime,
      classId: '5'
    };
    
    const result = eventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });
});

describe('Announcement Schema Validation', () => {
  it('should validate a valid announcement', () => {
    const validAnnouncement = {
      title: 'School Closure',
      description: 'School will be closed due to snow day',
      date: new Date(),
      classId: '2'
    };
    
    const result = announcementSchema.safeParse(validAnnouncement);
    expect(result.success).toBe(true);
  });

  it('should validate a school-wide announcement', () => {
    const schoolWideAnnouncement = {
      title: 'New Schedule',
      description: 'New school schedule starting next week',
      date: new Date(),
      classId: null
    };
    
    const result = announcementSchema.safeParse(schoolWideAnnouncement);
    expect(result.success).toBe(true);
  });

  it('should reject an announcement without description', () => {
    const invalidAnnouncement = {
      title: 'Important Notice',
      description: '',
      date: new Date(),
      classId: '5'
    };
    
    const result = announcementSchema.safeParse(invalidAnnouncement);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description');
    }
  });
});
