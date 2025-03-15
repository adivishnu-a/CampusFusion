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
});

export type ExamSchema = z.infer<typeof examSchema>;