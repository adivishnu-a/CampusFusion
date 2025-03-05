// npx prisma db seed - seeds data onto the MongoDB database using Prisma
import { Day, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ADMINS
  const admin1 = await prisma.admin.create({ data: { username: "admin1" } });
  const admin2 = await prisma.admin.create({ data: { username: "admin2" } });

  // GRADES
  const grades: any[] = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({ data: { level: i } });
    grades.push(grade);
  }

  // CLASSES
  const classes: any[] = [];
  for (let i = 1; i <= 6; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `${i}A`,
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        grade: { connect: { id: grades[i - 1].id } },
      },
    });
    classes.push(cls);
  }

  // SUBJECTS
  const subjects: any[] = [];
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];
  for (const subject of subjectData) {
    const sub = await prisma.subject.create({ data: subject });
    subjects.push(sub);
  }

  // TEACHERS
  const teachers: any[] = [];
  for (let i = 1; i <= 15; i++) {
    // cycle through subjects and classes
    const subject = subjects[(i - 1) % subjects.length];
    const cls = classes[(i - 1) % classes.length];
    const teacher = await prisma.teacher.create({
      data: {
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 30)
        ),
        subjects: { connect: { id: subject.id } },
        classes: { connect: { id: cls.id } },
      },
    });
    teachers.push(teacher);
  }

  // LESSONS
  const lessons: any[] = [];
  for (let i = 1; i <= 30; i++) {
    const subject = subjects[(i - 1) % subjects.length];
    const cls = classes[(i - 1) % classes.length];
    const teacher = teachers[(i - 1) % teachers.length];
    const days = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const randomDay = days[Math.floor(Math.random() * days.length)];
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson${i}`,
        day: randomDay as Day,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        subject: { connect: { id: subject.id } },
        class: { connect: { id: cls.id } },
        teacher: { connect: { id: teacher.id } },
      },
    });
    lessons.push(lesson);
  }

  // PARENTS
  const parents: any[] = [];
  for (let i = 1; i <= 25; i++) {
    const parent = await prisma.parent.create({
      data: {
        username: `parent${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
      },
    });
    parents.push(parent);
  }

  // STUDENTS
  const students: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const parent = parents[(Math.ceil(i / 2) - 1) % parents.length];
    const grade = grades[(i - 1) % grades.length];
    const cls = classes[(i - 1) % classes.length];
    const student = await prisma.student.create({
      data: {
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 10)
        ),
        parent: { connect: { id: parent.id } },
        grade: { connect: { id: grade.id } },
        class: { connect: { id: cls.id } },
      },
    });
    students.push(student);
  }

  // EXAMS
  const exams: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const lesson = lessons[(i - 1) % lessons.length];
    const exam = await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        lesson: { connect: { id: lesson.id } },
      },
    });
    exams.push(exam);
  }

  // ASSIGNMENTS
  const assignments: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const lesson = lessons[(i - 1) % lessons.length];
    const assignment = await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        lesson: { connect: { id: lesson.id } },
      },
    });
    assignments.push(assignment);
  }

  // RESULTS
  for (let i = 1; i <= 10; i++) {
    const student = students[(i - 1) % students.length];
    if (i <= 5) {
      await prisma.result.create({
        data: {
          score: 90,
          student: { connect: { id: student.id } },
          exam: { connect: { id: exams[i - 1].id } },
        },
      });
    } else {
      await prisma.result.create({
        data: {
          score: 90,
          student: { connect: { id: student.id } },
          assignment: { connect: { id: assignments[i - 6].id } },
        },
      });
    }
  }

  // ATTENDANCES
  for (let i = 1; i <= 10; i++) {
    const student = students[(i - 1) % students.length];
    const lesson = lessons[(i - 1) % lessons.length];
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: true,
        student: { connect: { id: student.id } },
        lesson: { connect: { id: lesson.id } },
      },
    });
  }

  // EVENTS
  for (let i = 1; i <= 5; i++) {
    const cls = classes[(i - 1) % classes.length];
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        class: { connect: { id: cls.id } },
      },
    });
  }

  // ANNOUNCEMENTS
  for (let i = 1; i <= 5; i++) {
    const cls = classes[(i - 1) % classes.length];
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        class: { connect: { id: cls.id } },
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });