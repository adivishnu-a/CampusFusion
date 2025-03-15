"use server";

import {
  ClassSchema,
  ExamSchema,
  ParentSchema,
  StudentSchema,
  DepartmentSchema,
  TeacherSchema,
  SubjectSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { deleteObjectFromS3, uploadToS3 } from "./s3";
import { Clerk } from "@clerk/clerk-sdk-node";

type CurrentState = { success: boolean; error: boolean };

export const createDepartment = async (
  currentState: CurrentState,
  data: DepartmentSchema
) => {
  try {
    await prisma.department.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/departments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateDepartment = async (
  currentState: CurrentState,
  data: DepartmentSchema
) => {
  try {
    await prisma.department.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/departments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteDepartment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.department.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/departments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    if (!data.supervisorId) {
      delete data.supervisorId;
    }
    
    await prisma.class.create({
      data
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    const { id, ...updateData } = data;
    if (!updateData.supervisorId) {
      delete updateData.supervisorId;
    }

    await prisma.class.update({
      where: { id },
      data: updateData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  formData: FormData
) => {
  const id = formData.get("id") as string;
  try {
    const classToDelete = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    if (!classToDelete) {
      return { success: false, error: true };
    }

    // Check if class has any students or subjects
    if ((classToDelete._count?.students ?? 0) > 0 || (classToDelete._count?.subjects ?? 0) > 0) {
      return { success: false, error: true };
    }

    await prisma.class.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    let imageUrl = null;
    const file = formData.get("file") as File;
    const data = JSON.parse(formData.get("data") as string) as TeacherSchema;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split(".").pop();
      const fileName = `${data.username}.${fileExt}`;
      imageUrl = await uploadToS3(buffer, fileName, file.type, "teachers");
    }

    const teacherId = await prisma.teacher.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: imageUrl || null,
        bloodType: data.bloodType,
        gender: data.gender,
        birthday: data.birthday,
        departments: {
          connect: data.departments?.map((departmentId: string) => ({
            id: departmentId,
          })),
        },
      },
    });
    const user = (await clerkClient()).users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher", userId: `${teacherId.id}` },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    let imageUrl = null;
    const file: any = formData.get("file") as File;
    const data: any = JSON.parse(
      formData.get("data") as string
    ) as TeacherSchema;
    if (!data.id) {
      return { success: false, error: true };
    }
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split(".").pop();
      const fileName = `${data.username}.${fileExt}`;
      imageUrl = await uploadToS3(buffer, fileName, file.type, "teachers");
    }
    const clerkData: any = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
    const allUsers: any = await clerkData.users.getUserList();
    if (!allUsers) {
      console.log("Clerk allUsers data is undefined or null");
      return { success: false, error: true };
    }
    const userClerk: any = await allUsers.filter(
      (user: any) => user.publicMetadata?.userId === data.id
    );
    if (userClerk.length > 0) {
      const user = (await clerkClient()).users.updateUser(userClerk[0].id, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
      });
    }

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        ...(imageUrl !== null && { img: imageUrl || null }),
        bloodType: data.bloodType,
        gender: data.gender,
        birthday: data.birthday,
        departments: {
          set: data.departments?.map((departmentId: string) => ({
            id: departmentId,
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const uid = formData.get("id") as string;
    const clerkData: any = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
    const allUsers: any = await clerkData.users.getUserList();
    if (!allUsers) {
      console.log("Clerk allUsers data is undefined or null");
      return { success: false, error: true };
    }
    console.log(allUsers);
    const userClerk: any[] = await allUsers.filter(
      (user: any) => user.publicMetadata?.userId === uid
    );
    if (userClerk.length > 0) {
      (await clerkClient()).users.deleteUser(userClerk[0].id);
    }

    const deletingUser: any = await prisma.teacher.findUnique({
      where: {
        id: uid,
      },
    });
    if (deletingUser.img) {
      deletingUser.img = deletingUser.img.split("/").pop();
      await deleteObjectFromS3("teachers", deletingUser.img);
    }

    await prisma.teacher.delete({
      where: {
        id: uid,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const createStudent = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    let imageUrl = null;
    const file = formData.get("file") as File;
    const data = JSON.parse(formData.get("data") as string) as StudentSchema;
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split(".").pop();
      const fileName = `${data.username}.${fileExt}`;
      imageUrl = await uploadToS3(buffer, fileName, file.type, "students");
    }

    const studentId = await prisma.student.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: imageUrl || null,
        bloodType: data.bloodType,
        gender: data.gender,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    const user = (await clerkClient()).users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student", userId: `${studentId.id}` },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    let imageUrl = null;
    const file: any = formData.get("file") as File;
    const data: any = JSON.parse(
      formData.get("data") as string
    ) as StudentSchema;
    if (!data.id) {
      return { success: false, error: true };
    }
    console.log(data.id);
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split(".").pop();
      const fileName = `${data.username}.${fileExt}`;
      imageUrl = await uploadToS3(buffer, fileName, file.type, "students");
    }
    const clerkData: any = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
    const allUsers: any = await clerkData.users.getUserList();
    if (!allUsers) {
      console.log("Clerk allUsers data is undefined or null");
      return { success: false, error: true };
    }
    const userClerk: any = await allUsers.filter(
      (user: any) => user.publicMetadata?.userId === data.id
    );
    if (userClerk.length > 0) {
      const user = (await clerkClient()).users.updateUser(userClerk[0].id, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
      });
    }

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        ...(imageUrl !== null && { img: imageUrl || null }),
        bloodType: data.bloodType,
        gender: data.gender,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const uid = formData.get("id") as string;
    const clerkData: any = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
    const allUsers: any = await clerkData.users.getUserList();
    if (!allUsers) {
      console.log("Clerk allUsers data is undefined or null");
      return { success: false, error: true };
    }
    console.log(allUsers);
    const userClerk: any[] = await allUsers.filter(
      (user: any) => user.publicMetadata?.userId === uid
    );
    if (userClerk.length > 0) {
      (await clerkClient()).users.deleteUser(userClerk[0].id);
    }

    const deletingUser: any = await prisma.student.findUnique({
      where: {
        id: uid,
      },
    });
    if (deletingUser.img) {
      deletingUser.img = deletingUser.img.split("/").pop();
      await deleteObjectFromS3("students", deletingUser.img);
    }

    await prisma.student.delete({
      where: {
        id: uid,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const data = JSON.parse(formData.get("data") as string) as ParentSchema;

    const parentId = await prisma.parent.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    const user = (await clerkClient()).users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent", userId: `${parentId.id}` },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const data = JSON.parse(formData.get("data") as string) as ParentSchema;
    
    if (!data.id) {
      return { success: false, error: true };
    }

    const clerkData: any = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
    const allUsers: any = await clerkData.users.getUserList();
    
    if (!allUsers) {
      console.log("Clerk allUsers data is undefined or null");
      return { success: false, error: true };
    }
    
    const userClerk: any = await allUsers.filter(
      (user: any) => user.publicMetadata?.userId === data.id
    );
    
    if (userClerk.length > 0) {
      const user = (await clerkClient()).users.updateUser(userClerk[0].id, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
      });
    }

    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const uid = formData.get("id") as string;
    
    // Check if parent has any associated students
    const parentWithStudents = await prisma.parent.findUnique({
      where: { id: uid },
      include: { _count: { select: { students: true } } },
    });

    if (!parentWithStudents) {
      return { success: false, error: true };
    }

    // Prevent deletion if parent has students
    if ((parentWithStudents._count?.students ?? 0) > 0) {
      return { success: false, error: true };
    }
    
    const clerkData: any = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });
    const allUsers: any = await clerkData.users.getUserList();
    
    if (!allUsers) {
      console.log("Clerk allUsers data is undefined or null");
      return { success: false, error: true };
    }
    
    const userClerk: any[] = await allUsers.filter(
      (user: any) => user.publicMetadata?.userId === uid
    );
    
    if (userClerk.length > 0) {
      (await clerkClient()).users.deleteUser(userClerk[0].id);
    }

    await prisma.parent.delete({
      where: {
        id: uid,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
    const currentUserId = userId;
    if (role === "teacher") {
      const teacherSubject = await prisma.subject.findFirst({
        where: {
          teacherId: currentUserId!,
          id: data.subjectId,
        },
      });
      if (!teacherSubject) {
        return { success: false, error: true };
      }
    }
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
      },
    });

    // revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
    const currentUserId = userId;
    if (role === "teacher") {
      const teacherSubject = await prisma.subject.findFirst({
        where: {
          teacherId: currentUserId!,
          id: data.subjectId,
        },
      });
      if (!teacherSubject) {
        return { success: false, error: true };
      }
    }
    await prisma.exam.update({
      where:{
        id:data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
      },
    });

    // revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
    const currentUserId = userId;
    const id = data.get("id") as string;
    await prisma.exam.delete({
      where: {
        id: id,
        ...(role === "teacher" ? { subject: { teacherId: currentUserId } } : {}),
      },
    });

    // revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        departmentId: data.departmentId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const { id, ...updateData } = data;
    
    await prisma.subject.update({
      where: { id },
      data: updateData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  formData: FormData
) => {
  const id = formData.get("id") as string;
  try {
    await prisma.subject.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
