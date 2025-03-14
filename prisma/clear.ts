// npx ts-node prisma/clear.ts
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");
  
  // Clear all existing data in the correct order to respect foreign key constraints
  // Start with dependent tables first
  await prisma.result.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.timeTableEntry.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.timeTable.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Database cleaned successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });