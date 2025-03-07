import { PrismaClient, UserGender, Day } from "@prisma/client";
import bcryptjs from "bcryptjs";  // Changed from bcrypt to bcryptjs

const prisma = new PrismaClient();

// Function to hash passwords
async function hashPassword(password: string): Promise<string> {
  const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? 
    parseInt(process.env.BCRYPT_SALT_ROUNDS) : 
    10;
  return await bcryptjs.hash(password, saltRounds);
}

async function main(): Promise<void> {
  try {
    console.log("Seeding database...");

    // Clear existing data
    await prisma.admin.deleteMany();

    // ADMIN
    const admin = await prisma.admin.create({
      data: {
        username: "admin1",
        password: await hashPassword("admin123"),
      },
    });

    // GRADES (1-8)
    const grades = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        prisma.grade.create({ data: { level: i + 1 } })
      )
    );

    // CLASSES (One per grade)
    const classes = await Promise.all(
      grades.map((grade, i) =>
        prisma.class.create({
          data: {
            name: `${i + 1}A`,
            capacity: Math.floor(Math.random() * (22 - 18 + 1)) + 18,
            gradeId: grade.id,
          },
        })
      )
    );

    // SUBJECTS
    const subjectNames: string[] = [
      "Mathematics",
      "Science",
      "English",
      "Social Studies",
      "Language Arts",
      "General Knowledge",
      "Physical Education",
      "Art & Craft",
      "Moral Science",
      "Computer Basics",
    ];

    const subjects = await Promise.all(
      subjectNames.map((name) =>
        prisma.subject.create({ data: { name } })
      )
    );

    // TEACHERS
    const teacherData = [
      { name: "John", surname: "Smith", subject: "Mathematics" },
      { name: "Mary", surname: "Johnson", subject: "Science" },
      { name: "David", surname: "Williams", subject: "English" },
      { name: "Sarah", surname: "Brown", subject: "Social Studies" },
      { name: "Michael", surname: "Davis", subject: "Language Arts" },
      { name: "Elizabeth", surname: "Miller", subject: "General Knowledge" },
      { name: "James", surname: "Wilson", subject: "Physical Education" },
      { name: "Patricia", surname: "Moore", subject: "Art & Craft" },
      { name: "Robert", surname: "Taylor", subject: "Moral Science" },
      { name: "Jennifer", surname: "Anderson", subject: "Computer Basics" },
    ];

    const teachers = await Promise.all(
      teacherData.map(async (t, index) => {
        const subject = subjects.find((s) => s.name === t.subject);
        if (!subject) throw new Error(`Subject not found: ${t.subject}`);
        // Assign a class to supervise (for example purposes)
        const assignedClass = classes[index % classes.length];

        return prisma.teacher.create({
          data: {
            username: `${t.name.toLowerCase()}.${t.surname.toLowerCase()}`,
            password: await hashPassword("teacher123"),
            name: t.name,
            surname: t.surname,
            email: `${t.name.toLowerCase()}.${t.surname.toLowerCase()}@school.com`,
            phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            address: `${Math.floor(100 + Math.random() * 900)} School Street`,
            bloodType: ["A+", "A-", "B+", "B-", "O+", "O-"][Math.floor(Math.random() * 6)],
            gender: index % 2 === 0 ? UserGender.MALE : UserGender.FEMALE,
            birthday: new Date(1970 + Math.floor(Math.random() * 20),
                               Math.floor(Math.random() * 12),
                               Math.floor(Math.random() * 28)),
            subjects: { connect: { id: subject.id } },
            classes: { connect: { id: assignedClass.id } },
          },
        });
      })
    );

    // PARENTS
    const parents = await Promise.all(
      Array.from({ length: 10 }, async (_, i) =>
        prisma.parent.create({
          data: {
            username: `parent${i + 1}`,
            password: await hashPassword("parent123"),
            name: `Parent${i + 1}`,
            surname: `Guardian${i + 1}`,
            email: `parent${i + 1}@school.com`,
            phone: `+91${Math.floor(6000000000 + Math.random() * 4000000000)}`,
            address: `Parent Address ${i + 1}`,
          },
        })
      )
    );

    // STUDENTS
    const students = await Promise.all(
      Array.from({ length: 20 }, async (_, i) => {
        return prisma.student.create({
          data: {
            username: `student${i + 1}`,
            password: await hashPassword("student123"),
            name: `Student${i + 1}`,
            surname: `Lastname${i + 1}`,
            email: `student${i + 1}@school.com`,
            phone: `+91${Math.floor(7000000000 + Math.random() * 3000000000)}`,
            address: `Student Address ${i + 1}`,
            bloodType: ["A+", "A-", "B+", "B-", "O+", "O-"][Math.floor(Math.random() * 6)],
            gender: i % 2 === 0 ? UserGender.MALE : UserGender.FEMALE,
            birthday: new Date(2008 + Math.floor(Math.random() * 6),
                               Math.floor(Math.random() * 12),
                               Math.floor(Math.random() * 28)),
            parentId: parents[i % parents.length].id,
            classId: classes[i % classes.length].id,
            gradeId: grades[i % grades.length].id,
          },
        });
      })
    );

    // LESSONS: Create a lesson for each subject in a class
    const lessons = await Promise.all(
      subjects.map(async (subject, i) => {
        return prisma.lesson.create({
          data: {
            name: `${subject.name} - Class ${classes[i % classes.length].name}`,
            day: Day.MONDAY,
            startTime: new Date(2024, 0, 1, 8 + Math.floor(Math.random() * 6), 0, 0),
            endTime: new Date(2024, 0, 1, 9 + Math.floor(Math.random() * 6), 0, 0),
            subjectId: subject.id,
            classId: classes[i % classes.length].id,
            teacherId: teachers[i % teachers.length].id,
          },
        });
      })
    );

    // EXAMS: One exam per lesson
    const exams = await Promise.all(
      lessons.map((lesson) =>
        prisma.exam.create({
          data: {
            title: `${lesson.name} Exam`,
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
            lessonId: lesson.id,
          },
        })
      )
    );

    // ASSIGNMENTS: One assignment per lesson
    const assignments = await Promise.all(
      lessons.map((lesson) =>
        prisma.assignment.create({
          data: {
            title: `${lesson.name} Homework`,
            startDate: new Date(),
            dueDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
            lessonId: lesson.id,
          },
        })
      )
    );

    // ATTENDANCES: Create attendance for each student in a random lesson
    await Promise.all(
      students.map((student) =>
        prisma.attendance.create({
          data: {
            date: new Date(),
            present: Math.random() > 0.2, // 80% chance present
            studentId: student.id,
            lessonId: lessons[Math.floor(Math.random() * lessons.length)].id,
          },
        })
      )
    );

    // RESULTS: Create a result for each student in a random exam
    await Promise.all(
      students.map((student) =>
        prisma.result.create({
          data: {
            score: Math.floor(Math.random() * 100),
            studentId: student.id,
            examId: exams[Math.floor(Math.random() * exams.length)].id,
          },
        })
      )
    );

    // EVENTS: Create sample events (optionally linked to a class)
    await prisma.event.createMany({
      data: [
        {
          title: "Sports Day",
          description: "Annual sports event with various games",
          startTime: new Date(),
          endTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000), // 4 hours later
          classId: classes[0].id,
        },
        {
          title: "Science Fair",
          description: "Exhibition of science projects",
          startTime: new Date(),
          endTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), // 3 hours later
          classId: classes[1].id,
        },
      ],
    });

    // ANNOUNCEMENTS: Create sample announcements (optionally linked to a class)
    await prisma.announcement.createMany({
      data: [
        {
          title: "Exam Schedule",
          description: "Exams will be held next week for all classes.",
          date: new Date(),
          classId: classes[0].id,
        },
        {
          title: "Holiday Notice",
          description: "School will be closed on the upcoming public holiday.",
          date: new Date(),
          classId: classes[1].id,
        },
      ],
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute seeding
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
