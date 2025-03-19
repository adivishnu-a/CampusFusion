import { z } from "zod";
export const departmentSchema = z.object({
  id: z.coerce.string().optional(),
  name: z.string().min(1, { message: "Department name is required" }),
  teachers: z.array(z.string()), //teacher id's
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;

export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce
    .number()
    .min(1, { message: "Capacity must be at least 1!" })
    .max(100, { message: "Capacity cannot exceed 100!" }),
  gradeId: z.string().min(1, { message: "Grade is required!" }),
  supervisorId: z.string().optional().nullable(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  departments: z.array(z.string()).optional(), //store department id's
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone number is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  gradeId: z.coerce.string().min(1, { message: "Grade ID is required" }),
  classId: z.coerce.string().min(1, { message: "Class ID is required" }),
  parentId: z.coerce.string().min(1, { message: "Parent ID is required" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.string().optional(),
  title: z.string().min(1, { message: "Exam Title is required" }),
  startTime: z.coerce.date({message:"Start Time is required"}),
  endTime: z.coerce.date({message:"End Time is required"}),
  subjectId: z.coerce.string().min(1, { message: "Subject ID is required" }),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end >= start;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export type ExamSchema = z.infer<typeof examSchema>;

export const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"], {
    message: "Day is required!",
  }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  departmentId: z.string().min(1, { message: "Department is required!" }),
  classId: z.string().min(1, { message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end >= start;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const assignmentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Assignment title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  subjectId: z.string().min(1, { message: "Subject is required!" }),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.dueDate);
  return end >= start;
}, {
  message: "Due date must be after start date",
  path: ["dueDate"]
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.string().optional(),
  score: z.coerce.number()
    .min(0, { message: "Score cannot be negative" })
    .max(100, { message: "Score cannot exceed 100" }),
  studentId: z.string().min(1, { message: "Student is required!" }),
  examId: z.string().optional(),
  assignmentId: z.string().optional(),
  assessmentType: z.enum(["exam", "assignment"], { 
    message: "Assessment type must be either exam or assignment" 
  }),
}).refine(data => {
  // Either exam ID or assignment ID must be provided
  if (data.assessmentType === "exam") {
    return !!data.examId;
  } else {
    return !!data.assignmentId;
  }
}, {
  message: "You must select an exam or assignment based on assessment type",
  path: ["examId"] // This will highlight the exam field if validation fails
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(1, { message: "Event title is required!" })
    .max(80, { message: "Title cannot exceed 80 characters!" }),
  description: z.string().min(1, { message: "Event description is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.string().optional().nullable(),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end >= start;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(1, { message: "Announcement title is required!" })
    .max(80, { message: "Title cannot exceed 80 characters!" }),
  description: z.string().min(1, { message: "Announcement description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.string().optional().nullable(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;