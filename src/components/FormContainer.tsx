import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "department"
    | "class"
    | "subject"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "department":
        const departmentTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: departmentTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherDepartments = await prisma.department.findMany({
          select: { id: true, name: true },
        });
        relatedData = { departments: teacherDepartments };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "parent":
        // Nothing special needed for parent form
        break;
      case "exam":
        const examSubjects = await prisma.subject.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { subjects: examSubjects };
        break;
      case "assignment":
        const assignmentSubjects = await prisma.subject.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { subjects: assignmentSubjects };
        break;
      case "subject":
        const departments = await prisma.department.findMany({
          select: { id: true, name: true },
        });
        
        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        
        const teachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        
        relatedData = { departments, classes, teachers };
        break;
      case "result":
        // Fetch students
        const students = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
          ...(role === "teacher" ? {
            where: {
              class: {
                subjects: {
                  some: {
                    teacherId: currentUserId!
                  }
                }
              }
            }
          } : {})
        });
        
        // Fetch exams
        const exams = await prisma.exam.findMany({
          select: { id: true, title: true },
          ...(role === "teacher" ? {
            where: {
              subject: {
                teacherId: currentUserId!
              }
            }
          } : {})
        });
        
        // Fetch assignments
        const assignments = await prisma.assignment.findMany({
          select: { id: true, title: true },
          ...(role === "teacher" ? {
            where: {
              subject: {
                teacherId: currentUserId!
              }
            }
          } : {})
        });
        
        relatedData = { students, exams, assignments };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;