import { Class, Day, Grade, Subject, PrismaClient, Student, Teacher, UserGender } from "@prisma/client";
// Remove Clerk import since we're not using it
// import { Clerk } from "@clerk/clerk-sdk-node";

const prisma = new PrismaClient();

// Remove clerkClient initialization
// const clerkClient = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

// This function is now a no-op but we keep it to avoid changing the structure
async function createClerkUser(username: string, firstName: string, lastName: string, role: string, userId: string, password: string = 'password123') {
  // Skip Clerk user creation but log for reference
  console.log(`Skipping Clerk user creation for ${role}: ${firstName} ${lastName}`);
}

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
  await prisma.subject.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Database cleaned, starting seeding...");

  // Get the current date and previous dates for the last 14 days
  const today = new Date();
  const lastTwoWeeks = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // ADMINS (4 admins)
  console.log("Creating admins...");
  const adminData = [
    { username: "admin.principal", name: "James", surname: "Reynolds" },
    { username: "admin.viceprincipal", name: "Sarah", surname: "Matthews" },
    { username: "admin.coordinator", name: "Michael", surname: "Chen" },
    { username: "admin.registrar", name: "Elizabeth", surname: "Parker" }
  ];

  const admins = [];
  for (const admin of adminData) {
    const createdAdmin = await prisma.admin.create({ 
      data: { username: admin.username } 
    });
    
    // We'll keep the function call but it's now a no-op
    await createClerkUser(
      admin.username, 
      admin.name, 
      admin.surname, 
      "admin", 
      createdAdmin.id
    );
    
    admins.push(createdAdmin);
  }

  // GRADES (1st to 5th)
  console.log("Creating grades...");
  const grades = await Promise.all(
    Array.from({ length: 5 }, (_, i) => i + 1).map(level =>
      prisma.grade.create({ data: { level } })
    )
  );

  // CLASSES (3 sections per grade: A, B, C)
  console.log("Creating classes...");
  const classNames = ["A", "B", "C"];
  const classes: Class[] = [];
  for (const grade of grades) {
    for (const section of classNames) {
      const cls = await prisma.class.create({
        data: {
          name: `${grade.level}${section}`,
          capacity: 20, // Setting capacity to 20 students per class
          gradeId: grade.id
        }
      });
      classes.push(cls);
    }
  }

  // DEPARTMENTS with realistic school departments
  console.log("Creating departments...");
  const departmentData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "Social Studies" },
    { name: "Computer Science" },
    { name: "Physical Education" },
    { name: "Fine Arts" }
  ];

  const departments = await Promise.all(
    departmentData.map(department => prisma.department.create({ data: department }))
  );

  // TEACHERS (15 teachers)
  console.log("Creating teachers...");
  const teacherData = [
    // Mathematics Department
    { name: "Robert", surname: "Johnson", department: "Mathematics", gender: UserGender.MALE },
    { name: "Linda", surname: "Chen", department: "Mathematics", gender: UserGender.FEMALE },
    
    // Science Department
    { name: "Michael", surname: "Williams", department: "Science", gender: UserGender.MALE },
    { name: "Emily", surname: "Garcia", department: "Science", gender: UserGender.FEMALE },
    { name: "David", surname: "Rodriguez", department: "Science", gender: UserGender.MALE },
    
    // English Department
    { name: "Jennifer", surname: "Miller", department: "English", gender: UserGender.FEMALE },
    { name: "William", surname: "Davis", department: "English", gender: UserGender.MALE },
    
    // Social Studies Department
    { name: "Maria", surname: "Martinez", department: "Social Studies", gender: UserGender.FEMALE },
    { name: "James", surname: "Taylor", department: "Social Studies", gender: UserGender.MALE },
    
    // Computer Science Department
    { name: "Sarah", surname: "Brown", department: "Computer Science", gender: UserGender.FEMALE },
    { name: "Thomas", surname: "Wilson", department: "Computer Science", gender: UserGender.MALE },
    
    // Physical Education Department
    { name: "Richard", surname: "Anderson", department: "Physical Education", gender: UserGender.MALE },
    { name: "Patricia", surname: "Thompson", department: "Physical Education", gender: UserGender.FEMALE },
    
    // Fine Arts Department
    { name: "Elizabeth", surname: "Lee", department: "Fine Arts", gender: UserGender.FEMALE },
    { name: "Joseph", surname: "White", department: "Fine Arts", gender: UserGender.MALE }
  ];

  const teachers: Teacher[] = [];
  for (let i = 0; i < teacherData.length; i++) {
    const teacher = teacherData[i];
    const department = departments.find(d => d.name === teacher.department);

    if (!department) {
      console.error(`Department ${teacher.department} not found`);
      continue;
    }

    const username = `${teacher.name.toLowerCase()}.${teacher.surname.toLowerCase()}`;
    const email = `${username}@school.edu`;
    const phone = `+1${Math.floor(Math.random() * 900000000 + 1000000000)}`;
    const address = `${Math.floor(Math.random() * 1000)} Faculty Avenue`;
    const bloodType = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"][Math.floor(Math.random() * 8)];
    const birthday = new Date(1970 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    // Assign teacher as supervisor to a class
    const supervisorClass = classes[i % classes.length];

    const createdTeacher = await prisma.teacher.create({
      data: {
        username,
        name: teacher.name,
        surname: teacher.surname,
        email,
        phone,
        address,
        img: null,
        bloodType,
        gender: teacher.gender,
        birthday,
        departments: { connect: { id: department.id } },
        classes: { connect: { id: supervisorClass.id } }
      }
    });

    // Update class with supervisor
    await prisma.class.update({
      where: { id: supervisorClass.id },
      data: { supervisorId: createdTeacher.id }
    });

    // Create Clerk user - now a no-op
    await createClerkUser(
      username,
      teacher.name,
      teacher.surname,
      "teacher",
      createdTeacher.id
    );

    teachers.push(createdTeacher);
  }

  // PARENTS (80 parents)
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

  const parents = [];
  for (let i = 0; i < 80; i++) {
    const firstName = parentFirstNames[i % parentFirstNames.length];
    const lastName = parentLastNames[Math.floor(i / parentFirstNames.length) % parentLastNames.length];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}`;
    const email = `${username}@email.com`;
    const phone = `+1${Math.floor(Math.random() * 900000000 + 1000000000)}`;
    const address = `${Math.floor(Math.random() * 2000)} Family Street, Apt ${Math.floor(Math.random() * 100) + 1}`;
    
    const parent = await prisma.parent.create({
      data: {
        username,
        name: firstName,
        surname: lastName,
        email,
        phone,
        address
      }
    });
    
    // Create Clerk user - now a no-op
    await createClerkUser(
      username,
      firstName,
      lastName,
      "parent",
      parent.id
    );
    
    parents.push(parent);
  }

  // STUDENTS (150 students, distributed across classes)
  console.log("Creating students...");
  const studentFirstNames = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
    "Isabella", "William", "Mia", "James", "Charlotte", "Alexander", "Amelia",
    "Benjamin", "Harper", "Michael", "Evelyn", "Daniel", "Abigail", "Henry",
    "Emily", "Joseph", "Elizabeth", "David", "Sofia", "Samuel", "Avery", "John",
    "Ella", "Owen", "Madison", "Sebastian", "Scarlett", "Jack", "Victoria",
    "Matthew", "Luna", "Lucas", "Grace", "Oliver", "Chloe", "Andrew", "Lily",
    "Ryan", "Zoe", "Nathan", "Hannah", "Elijah"
  ];

  const studentLastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
    "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright"
  ];

  // Create an array to track class capacity
  const classStudentCount: Record<string, number> = {};
  classes.forEach(cls => {
    classStudentCount[cls.id] = 0;
  });

  const students: Student[] = [];
  let parentIndex = 0;
  
  for (let i = 0; i < 150; i++) {
    const firstName = studentFirstNames[i % studentFirstNames.length];
    const lastName = studentLastNames[Math.floor(i / studentFirstNames.length) % studentLastNames.length];
    
    // Distributing students across classes
    // Find a class that has not reached capacity
    let classIndex = i % classes.length;
    let attempts = 0;
    
    while (classStudentCount[classes[classIndex].id] >= classes[classIndex].capacity) {
      classIndex = (classIndex + 1) % classes.length;
      attempts++;
      if (attempts > classes.length) {
        console.error("All classes are at full capacity.");
        break;
      }
    }
    
    const cls = classes[classIndex];
    classStudentCount[cls.id]++;
    
    // Assign parent (each parent gets 1-2 students)
    const parent = parents[parentIndex];
    
    // Increment parent index after every 1 or 2 students
    if (i % 2 === 1 || Math.random() > 0.5) { // 50% chance for a parent to have 1 child, 50% for 2
      parentIndex = (parentIndex + 1) % parents.length;
    }
    
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}`;
    const email = `${username}@student.edu`;
    const phone = `+1${Math.floor(Math.random() * 900000000 + 1000000000)}`;
    const bloodType = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"][Math.floor(Math.random() * 8)];
    const gender = i % 2 === 0 ? UserGender.MALE : UserGender.FEMALE;
    
    // Calculate birthday based on grade (younger students in lower grades)
    const gradeLevel = cls.name.charAt(0);
    const birthYear = 2024 - (5 + parseInt(gradeLevel, 10)); // Age starts at 6 for 1st grade
    const birthday = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    const student = await prisma.student.create({
      data: {
        username,
        name: firstName,
        surname: lastName,
        email,
        phone,
        address: parent.address, // Child lives at same address as parent
        img: null,
        bloodType,
        gender,
        birthday,
        parent: { connect: { id: parent.id } },
        grade: { connect: { id: cls.gradeId } },
        class: { connect: { id: cls.id } }
      }
    });
    
    // Create Clerk user - now a no-op
    await createClerkUser(
      username,
      firstName,
      lastName,
      "student",
      student.id
    );
    
    students.push(student);
  }

  // Create TimeTable for each class
  console.log("Creating timetables...");
  
  // Define time slots for the day
  const timeSlots = [
    { start: 8, end: 9 },    // 8:00 AM - 9:00 AM
    { start: 9, end: 10 },   // 9:00 AM - 10:00 AM
    { start: 10, end: 11 },  // 10:00 AM - 11:00 AM
    { start: 11, end: 12 },  // 11:00 AM - 12:00 PM
    { start: 13, end: 14 },  // 1:00 PM - 2:00 PM
    { start: 14, end: 15 },  // 2:00 PM - 3:00 PM
    { start: 15, end: 16 }   // 3:00 PM - 4:00 PM
  ];
  
  // Create mapping for which department each teacher belongs to
  const teacherDepartments: { [key: string]: string } = {};
  for (const teacher of teachers) {
    teacherDepartments[teacher.id] = teacher.departmentIds[0];
  }

  // Track teacher availability to avoid schedule conflicts
  const teacherSchedule: Record<string, Record<string, Record<number, boolean>>> = {};
  const days: Day[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  
  for (const teacher of teachers) {
    teacherSchedule[teacher.id] = {};
    for (const day of days) {
      teacherSchedule[teacher.id][day] = {};
      for (const slot of timeSlots) {
        teacherSchedule[teacher.id][day][slot.start] = false; // false means available
      }
    }
  }

  // Track class timetable slots to avoid duplicate entries
  const classTimetableSlots: Record<string, Set<string>> = {};
  for (const cls of classes) {
    classTimetableSlots[cls.id] = new Set();
  }

  // Create subjects and timetables together
  const subjects: Subject[] = [];
  
  for (const cls of classes) {
    // Create timetable for class
    const timeTable = await prisma.timeTable.create({
      data: {
        classId: cls.id,
        Class: { connect: { id: cls.id } }
      }
    });
    
    // Update class with timetable ID
    await prisma.class.update({
      where: { id: cls.id },
      data: { timeTableId: timeTable.id }
    });
    
    // Create a schedule for each class (one subject per department)
    for (const department of departments) {
      // Find teachers for this department
      const departmentTeachers = teachers.filter(t => t.departmentIds[0] === department.id);
      
      if (departmentTeachers.length === 0) {
        console.log(`No teachers for department ${department.name}, skipping`);
        continue;
      }

      // For each department, create a subject and schedule it in the timetable
      // Find available slot for a teacher from this department
      let scheduledDay: Day | null = null;
      let scheduledSlot = -1;
      let selectedTeacher = null;
      
      // Try each day and slot until finding an available one that hasn't been used for this class
      dayLoop: for (const day of days) {
        for (const slot of timeSlots) {
          // Skip if this day+time is already used for this class
          const timeSlotKey = `${day}_${slot.start}`;
          if (classTimetableSlots[cls.id].has(timeSlotKey)) {
            continue;
          }

          // Check each teacher until we find one available at this time
          for (const teacher of departmentTeachers) {
            if (!teacherSchedule[teacher.id][day][slot.start]) {
              scheduledDay = day;
              scheduledSlot = slot.start;
              selectedTeacher = teacher;
              
              // Mark as scheduled
              teacherSchedule[teacher.id][day][slot.start] = true;
              classTimetableSlots[cls.id].add(timeSlotKey);
              
              break dayLoop;
            }
          }
        }
      }
      
      if (!scheduledDay || scheduledSlot === -1 || !selectedTeacher) {
        console.log(`Couldn't schedule ${department.name} for class ${cls.name}, skipping`);
        continue;
      }
      
      // Create subject
      const subjectName = getSubjectNameByDepartment(department.name, cls.name.charAt(0));
      
      const subject = await prisma.subject.create({
        data: {
          name: subjectName,
          day: scheduledDay,
          startTime: new Date(2024, 0, 1, scheduledSlot, 0),
          endTime: new Date(2024, 0, 1, scheduledSlot + 1, 0),
          department: { connect: { id: department.id } },
          class: { connect: { id: cls.id } },
          teacher: { connect: { id: selectedTeacher.id } }
        }
      });
      
      subjects.push(subject);
      
      // Create timetable entry
      await prisma.timeTableEntry.create({
        data: {
          timetable: { connect: { id: timeTable.id } },
          day: scheduledDay,
          startTime: new Date(2024, 0, 1, scheduledSlot, 0),
          endTime: new Date(2024, 0, 1, scheduledSlot + 1, 0),
          department: { connect: { id: department.id } },
          teacher: { connect: { id: selectedTeacher.id } }
        }
      });
    }
  }

  // ATTENDANCE for the last 14 days
  console.log("Creating attendance records...");
  for (const date of lastTwoWeeks) {
    // Skip weekends
    const day = date.getDay();
    if (day === 0 || day === 6) continue; // Skip Sunday (0) and Saturday (6)
    
    for (const cls of classes) {
      const classStudents = students.filter(s => s.classId === cls.id);
      
      // Realistically random attendance (88-98% attendance rate)
      const presentCount = Math.floor(classStudents.length * (0.88 + Math.random() * 0.1));
      const presentStudents = classStudents
        .sort(() => Math.random() - 0.5)
        .slice(0, presentCount);

      await prisma.attendance.create({
        data: {
          date,
          class: { connect: { id: cls.id } },
          presentStudentIds: presentStudents.map(s => s.id)
        }
      });
    }
  }

  // EXAMS (1 exam per subject)
  console.log("Creating exams and results...");
  const examTypes = ["Mid-Term", "Final", "Quiz", "Unit Test"];
  
  for (const subject of subjects) {
    const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
    
    // Randomly pick a date from last week for the exam
    const examDate = new Date(today);
    examDate.setDate(today.getDate() - Math.floor(Math.random() * 7) - 1);
    const startHour = 9 + Math.floor(Math.random() * 6); // Between 9 AM and 2 PM
    
    const exam = await prisma.exam.create({
      data: {
        title: `${examType} - ${subject.name}`,
        startTime: new Date(examDate.setHours(startHour, 0, 0, 0)),
        endTime: new Date(examDate.setHours(startHour + 2, 0, 0, 0)),
        subject: { connect: { id: subject.id } }
      }
    });

    // Create results for this exam
    const classStudents = students.filter(s => s.classId === subject.classId);
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

  // ASSIGNMENTS (1 assignment per subject)
  console.log("Creating assignments...");
  const assignmentTypes = [
    "Problem Set", "Lab Report", "Essay", "Research Paper", "Project",
    "Case Study", "Presentation", "Reading Response", "Group Work"
  ];

  for (const subject of subjects) {
    const assignmentType = assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)];
    
    // Create assignment start date between 1-2 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (7 + Math.floor(Math.random() * 7)));
    
    // Due date is 5-7 days after start date
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + 5 + Math.floor(Math.random() * 3));
    
    const assignment = await prisma.assignment.create({
      data: {
        title: `${assignmentType} - ${subject.name}`,
        startDate,
        dueDate,
        subject: { connect: { id: subject.id } }
      }
    });

    // Create results for assignments that are due
    if (dueDate <= today) {
      const classStudents = students.filter(s => s.classId === subject.classId);
      for (const student of classStudents) {
        await prisma.result.create({
          data: {
            score: Math.floor(Math.random() * 31) + 70, // Scores between 70-100
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
    { title: "Science Fair", desc: "Annual showcase of student science projects" },
    { title: "Sports Day", desc: "Inter-class athletics and team sports competition" },
    { title: "Parent-Teacher Meeting", desc: "Quarterly academic progress discussion" },
    { title: "Cultural Festival", desc: "Celebration of diversity and arts" },
    { title: "Career Day", desc: "Guest speakers discussing various career paths" },
    { title: "Field Trip", desc: "Educational outing to local museum" },
    { title: "Book Fair", desc: "Annual book fair and reading promotion event" },
    { title: "Talent Show", desc: "Students showcase their special talents" },
    { title: "Academic Competition", desc: "Inter-school knowledge bowl" },
    { title: "Health and Wellness Day", desc: "Activities promoting physical and mental health" }
  ];

  // Create events in the upcoming week
  for (let i = 0; i < classes.length; i++) {
    const eventIndex = i % eventsList.length;
    const event = eventsList[eventIndex];
    
    // Set event date in next 1-10 days
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + Math.floor(Math.random() * 10) + 1);
    
    await prisma.event.create({
      data: {
        title: `${event.title} - ${classes[i].name}`,
        description: event.desc,
        startTime: new Date(eventDate.setHours(9, 0, 0, 0)),
        endTime: new Date(eventDate.setHours(15, 0, 0, 0)),
        class: { connect: { id: classes[i].id } }
      }
    });
  }

  // ANNOUNCEMENTS
  console.log("Creating announcements...");
  const announcementsList = [
    { title: "Upcoming Parent-Teacher Conference", desc: "Schedule for next week's meetings" },
    { title: "Schedule Changes", desc: "Important updates to class schedules" },
    { title: "Extra Help Sessions", desc: "Additional academic support available after school" },
    { title: "Sports Team Tryouts", desc: "Information about joining school teams" },
    { title: "Library Book Drive", desc: "Collecting gently used books for our library" },
    { title: "Exam Schedule", desc: "Dates and times for upcoming exams" },
    { title: "School Magazine Submissions", desc: "Call for student articles and artwork" },
    { title: "Field Trip Permission Forms", desc: "Return forms by Friday" },
    { title: "School Photo Day", desc: "Bring your best smile next Tuesday" },
    { title: "Volunteer Opportunity", desc: "Help needed for upcoming school event" }
  ];

  // Create announcements from last 14 days
  for (const cls of classes) {
    // 2 recent announcements per class
    for (let i = 0; i < 2; i++) {
      const announcementIndex = (classes.indexOf(cls) + i) % announcementsList.length;
      const announcement = announcementsList[announcementIndex];
      
      const announcementDate = new Date(today);
      announcementDate.setDate(today.getDate() - Math.floor(Math.random() * 14));
      
      await prisma.announcement.create({
        data: {
          title: `${announcement.title} - ${cls.name}`,
          description: announcement.desc,
          date: announcementDate,
          class: { connect: { id: cls.id } }
        }
      });
    }
  }

  console.log("Database seeded successfully!");
}

// Helper function to generate appropriate subject names by department and grade
function getSubjectNameByDepartment(departmentName: string, gradeLevel: string): string {
  const grade = parseInt(gradeLevel);
  
  switch (departmentName) {
    case "Mathematics":
      return grade <= 2 ? "Basic Mathematics" : (grade <= 4 ? "Intermediate Mathematics" : "Advanced Mathematics");
    
    case "Science":
      return grade <= 2 ? "Science Fundamentals" : (grade <= 4 ? "General Science" : "Integrated Science");
    
    case "English":
      return grade <= 2 ? "Reading & Writing" : (grade <= 4 ? "Language Arts" : "English Literature");
    
    case "Social Studies":
      return grade <= 2 ? "Community Studies" : (grade <= 4 ? "History & Geography" : "World Studies");
    
    case "Computer Science":
      return grade <= 2 ? "Digital Literacy" : (grade <= 4 ? "Computer Skills" : "Programming Fundamentals");
    
    case "Physical Education":
      return "Physical Education";
    
    case "Fine Arts":
      return grade <= 3 ? "Art & Music" : "Creative Arts";
    
    default:
      return `${departmentName} ${grade}`;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });