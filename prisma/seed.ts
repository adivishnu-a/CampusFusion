import { Class, Day, Grade, Lesson, PrismaClient, Student, Teacher, UserGender } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");
  
  // Clear all existing data
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.timeTableEntry.deleteMany({});
  await prisma.timeTable.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Database cleaned, starting seeding...");

  // Get the current week's dates
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);

  // Create week dates array
  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });

  // ADMINS
  console.log("Creating admins...");
  const admin1 = await prisma.admin.create({ data: { username: "admin.principal" } });
  const admin2 = await prisma.admin.create({ data: { username: "admin.viceprincipal" } });
  const admin3 = await prisma.admin.create({ data: { username: "admin.coordinator" } });

  // GRADES (6th to 12th)
  console.log("Creating grades...");
  const grades = await Promise.all(
    Array.from({ length: 7 }, (_, i) => i + 6).map(level =>
      prisma.grade.create({ data: { level } })
    )
  );

  // CLASSES (4 sections per grade: A, B, C, D)
  console.log("Creating classes...");
  const classNames = ["A", "B", "C", "D"];
  const classes: Class[] = [];
  for (const grade of grades) {
    for (const section of classNames) {
      const cls = await prisma.class.create({
        data: {
          name: `${grade.level}${section}`,
          capacity: 40,
          gradeId: grade.id
        }
      });
      classes.push(cls);
    }
  }

  // SUBJECTS with realistic subjects
  console.log("Creating subjects...");
  const subjectData = [
    { name: "Advanced Mathematics" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "English Literature" },
    { name: "World History" },
    { name: "Geography" },
    { name: "Computer Science" },
    { name: "Physical Education" },
    { name: "Environmental Science" },
    { name: "Economics" },
    { name: "Business Studies" },
    { name: "Political Science" },
    { name: "Psychology" },
    { name: "Sociology" }
  ];

  const subjects = await Promise.all(
    subjectData.map(subject => prisma.subject.create({ data: subject }))
  );

  // TEACHERS (100 teachers)
  console.log("Creating teachers...");
  const teacherFirstNames = [
    "James", "Emily", "Michael", "Sarah", "Robert", "Jennifer", "David", "Lisa",
    "John", "Maria", "William", "Elizabeth", "Richard", "Patricia", "Joseph",
    "Margaret", "Charles", "Barbara", "Thomas", "Susan", "Christopher", "Jessica",
    "Daniel", "Karen", "Matthew", "Nancy", "Anthony", "Betty", "Donald", "Dorothy"
  ];

  const teacherLastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
  ];

  const teachers: Teacher[] = [];
  for (let i = 0; i < 100; i++) {
    const firstName = teacherFirstNames[i % teacherFirstNames.length];
    const lastName = teacherLastNames[Math.floor(i / teacherFirstNames.length)];
    const subject = subjects[i % subjects.length];

    const teacher = await prisma.teacher.create({
      data: {
        username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(i/30) + 1}`,
        name: firstName,
        surname: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(i/30) + 1}@school.edu`,
        phone: `+1${Math.floor(Math.random() * 900000000 + 1000000000)}`,
        address: `${Math.floor(Math.random() * 1000)} Education Street`,
        img: null,
        bloodType: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"][Math.floor(Math.random() * 8)],
        gender: i % 2 === 0 ? UserGender.MALE : UserGender.FEMALE,
        birthday: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        subjects: { connect: { id: subject.id } },
        classes: { connect: { id: classes[i % classes.length].id } }
      }
    });
    teachers.push(teacher);
  }

  // Create TimeTable for each class
  console.log("Creating timetables...");
  for (const cls of classes) {
    const timeTable = await prisma.timeTable.create({
      data: {
        classId: cls.id,
        Class: { connect: { id: cls.id } }
      }
    });

    // Create TimeTableEntries
    const days: Day[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const timeSlots = [
      { start: 8, end: 9 },
      { start: 9, end: 10 },
      { start: 10, end: 11 },
      { start: 11, end: 12 },
      { start: 13, end: 14 },
      { start: 14, end: 15 },
      { start: 15, end: 16 }
    ];

    for (const day of days) {
      for (const slot of timeSlots) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const teacher = teachers.find(t => t.subjectIds.includes(subject.id)) || teachers[0];

        await prisma.timeTableEntry.create({
          data: {
            timetable: { connect: { id: timeTable.id } },
            day,
            startTime: new Date(2024, 0, 1, slot.start, 0),
            endTime: new Date(2024, 0, 1, slot.end, 0),
            subject: { connect: { id: subject.id } },
            teacher: { connect: { id: teacher.id } }
          }
        });
      }
    }
  }

  // PARENTS (200 parents)
  console.log("Creating parents...");
  const parentFirstNames = [
    "Robert", "Mary", "John", "Patricia", "Michael", "Jennifer", "William", "Linda",
    "David", "Elizabeth", "Richard", "Barbara", "Joseph", "Susan", "Thomas", "Jessica",
    "Charles", "Sarah", "Christopher", "Karen", "Daniel", "Nancy", "Matthew", "Lisa",
    "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly",
    "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol"
  ];

  const parentLastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
  ];

  const parents = await Promise.all(
    Array.from({ length: 200 }, (_, i) => {
      const firstName = parentFirstNames[i % parentFirstNames.length];
      const lastName = parentLastNames[Math.floor(i / parentFirstNames.length)];
      return prisma.parent.create({
        data: {
          username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(i/40) + 1}`,
          name: firstName,
          surname: lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(i/40) + 1}@email.com`,
          phone: `+1${Math.floor(Math.random() * 900000000 + 1000000000)}`,
          address: `${Math.floor(Math.random() * 2000)} Family Street`
        }
      });
    })
  );

  // STUDENTS (800 students, approximately 30 per class)
  console.log("Creating students...");
  const studentFirstNames = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
    "Isabella", "William", "Mia", "James", "Charlotte", "Alexander", "Amelia",
    "Benjamin", "Harper", "Michael", "Evelyn", "Daniel", "Abigail", "Henry",
    "Emily", "Joseph", "Elizabeth", "David", "Sofia", "Samuel", "Avery", "John",
    "Ella", "Owen", "Madison", "Sebastian", "Scarlett", "Jack", "Victoria",
    "Matthew", "Luna", "Lucas", "Grace", "Oliver", "Chloe", "Andrew", "Lily"
  ];

  const studentLastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
    "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott",
    "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker"
  ];

  const students: Student[] = [];
  for (let i = 0; i < 800; i++) {
    const firstName = studentFirstNames[i % studentFirstNames.length];
    const lastName = studentLastNames[Math.floor(i / studentFirstNames.length)];
    const cls = classes[Math.floor(i / 30)]; // Distribute students evenly across classes
    const parent = parents[Math.floor(i / 4)]; // Each parent has about 4 children

    const student = await prisma.student.create({
      data: {
        username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}`,
        name: firstName,
        surname: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@student.edu`,
        phone: `+1${Math.floor(Math.random() * 900000000 + 1000000000)}`,
        address: parent.address,
        img: null,
        bloodType: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"][Math.floor(Math.random() * 8)],
        gender: i % 2 === 0 ? UserGender.MALE : UserGender.FEMALE,
        birthday: new Date(2005 + Math.floor(i / 114), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        parent: { connect: { id: parent.id } },
        grade: { connect: { id: cls.gradeId } },
        class: { connect: { id: cls.id } }
      }
    });
    students.push(student);
  }

  // LESSONS
  console.log("Creating lessons...");
  const lessons: Lesson[] = [];
  for (const cls of classes) {
    const classSubjects = subjects.slice(0, 8); // Each class has 8 subjects
    for (const subject of classSubjects) {
      const teacher = teachers.find(t => t.subjectIds.includes(subject.id));
      if (teacher) {
        const lesson = await prisma.lesson.create({
          data: {
            name: `${subject.name} - ${cls.name}`,
            day: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][Math.floor(Math.random() * 6)] as Day,
            startTime: new Date(2024, 0, 1, 8 + Math.floor(Math.random() * 8), 0),
            endTime: new Date(2024, 0, 1, 9 + Math.floor(Math.random() * 8), 0),
            subject: { connect: { id: subject.id } },
            class: { connect: { id: cls.id } },
            teacher: { connect: { id: teacher.id } }
          }
        });
        lessons.push(lesson);
      }
    }
  }

  // ATTENDANCE for the current week
  console.log("Creating attendance records...");
  for (const date of weekDates) {
    for (const cls of classes) {
      const classStudents = students.filter(s => s.classId === cls.id);
      
      // Realistically random attendance (88-98% attendance rate)
      const presentCount = Math.floor(classStudents.length * (0.88 + Math.random() * 0.1));
      const presentStudents = classStudents
        .sort(() => Math.random() - 0.5)
        .slice(0, presentCount);

      await prisma.attendance.create({
        data: {
          date: date,
          class: { connect: { id: cls.id } },
          presentStudentIds: presentStudents.map(s => s.id)
        }
      });
    }
  }

  // EXAMS (3 exams per subject per class)
  console.log("Creating exams and results...");
  const examTypes = ["Mid-Term", "Final", "Quiz", "Unit Test", "Assessment"];
  for (const lesson of lessons) {
    for (let i = 0; i < 3; i++) {
      const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
      const exam = await prisma.exam.create({
        data: {
          title: `${examType} - ${lesson.name}`,
          startTime: new Date(2024, 0, 15 + i, 9, 0),
          endTime: new Date(2024, 0, 15 + i, 11, 0),
          lesson: { connect: { id: lesson.id } }
        }
      });

      // Create results for this exam
      const classStudents = students.filter(s => s.classId === lesson.classId);
      for (const student of classStudents) {
        await prisma.result.create({
          data: {
            score: Math.floor(Math.random() * 31) + 70, // Scores between 70-100
            exam: { connect: { id: exam.id } },
            student: { connect: { id: student.id } }
          }
        });
      }
    }
  }

  // ASSIGNMENTS (2 assignments per subject per class)
  console.log("Creating assignments and results...");
  const assignmentTypes = [
    "Problem Set", "Lab Report", "Essay", "Research Paper", "Project",
    "Case Study", "Presentation", "Portfolio", "Book Report", "Group Work"
  ];

  for (const lesson of lessons) {
    for (let i = 0; i < 2; i++) {
      const assignmentType = assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)];
      const assignment = await prisma.assignment.create({
        data: {
          title: `${assignmentType} - ${lesson.name}`,
          startDate: new Date(2024, 0, 10 + i * 7),
          dueDate: new Date(2024, 0, 17 + i * 7),
          lesson: { connect: { id: lesson.id } }
        }
      });

      // Create results for this assignment
      const classStudents = students.filter(s => s.classId === lesson.classId);
      for (const student of classStudents) {
        await prisma.result.create({
          data: {
            score: Math.floor(Math.random() * 31) + 70,
            assignment: { connect: { id: assignment.id } },
            student: { connect: { id: student.id } }
          }
        });
      }
    }
  }

  // EVENTS
  console.log("Creating events...");
  const eventsList = [
    { title: "Annual Science Fair", desc: "Showcase of innovative student projects" },
    { title: "Sports Day", desc: "Annual inter-class athletic competition" },
    { title: "Parent-Teacher Meeting", desc: "Quarterly academic progress discussion" },
    { title: "Cultural Festival", desc: "Celebration of diverse cultural traditions" },
    { title: "Career Guidance Workshop", desc: "Professional development and college planning" },
    { title: "Literary Week", desc: "Book fair and literary competitions" },
    { title: "Math Olympiad", desc: "Inter-school mathematics competition" },
    { title: "Earth Day Celebration", desc: "Environmental awareness activities" },
    { title: "Technology Expo", desc: "Student tech project showcase" },
    { title: "Health and Wellness Day", desc: "Physical and mental health awareness" }
  ];

  for (const cls of classes) {
    for (const event of eventsList.slice(0, 3)) { // 3 events per class
      await prisma.event.create({
        data: {
          title: `${event.title} - ${cls.name}`,
          description: event.desc,
          startTime: new Date(2024, 0, 15, 9, 0),
          endTime: new Date(2024, 0, 15, 17, 0),
          class: { connect: { id: cls.id } }
        }
      });
    }
  }

  // ANNOUNCEMENTS
  console.log("Creating announcements...");
  const announcementsList = [
    { title: "Upcoming Parent-Teacher Conference", desc: "Schedule for next week's meetings" },
    { title: "Holiday Schedule Update", desc: "Important changes to winter break dates" },
    { title: "Extra Classes Schedule", desc: "Additional academic support sessions" },
    { title: "Sports Team Selection", desc: "Tryouts for various sports teams" },
    { title: "Library Week Activities", desc: "Special events and competitions" },
    { title: "Exam Schedule Released", desc: "Important dates for upcoming examinations" },
    { title: "School Magazine Submissions", desc: "Call for student articles and artwork" },
    { title: "Field Trip Information", desc: "Details about upcoming educational visits" },
    { title: "Vaccination Drive", desc: "School health program update" },
    { title: "Scholarship Opportunities", desc: "Information about available scholarships" }
  ];

  for (const cls of classes) {
    for (const announcement of announcementsList.slice(0, 5)) { // 5 announcements per class
      await prisma.announcement.create({
        data: {
          title: `${announcement.title} - ${cls.name}`,
          description: announcement.desc,
          date: new Date(),
          class: { connect: { id: cls.id } }
        }
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });