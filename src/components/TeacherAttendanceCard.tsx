import prisma from "@/lib/prisma";

const TeacherAttendanceCard = async ({ teacherId }: { teacherId: string }) => {
  // Get all classes supervised by this teacher
  const teacherClasses = await prisma.class.findMany({
    where: { supervisorId: teacherId },
    select: { id: true }
  });

  if (!teacherClasses || teacherClasses.length === 0) {
    return (
      <div className="">
        <h1 className="text-xl font-semibold">-</h1>
        <span className="text-sm text-gray-500">Attendance</span>
      </div>
    );
  }

  const classIds = teacherClasses.map(c => c.id);
  
  // Get attendance records from the start of the year for all teacher's classes
  const startDate = new Date(new Date().getFullYear(), 0, 1);
  
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      classId: { in: classIds },
      date: {
        gte: startDate,
      },
    },
  });

  // Get total student count across all classes
  const studentsInClasses = await prisma.student.findMany({
    where: {
      classId: { in: classIds }
    },
    select: { id: true }
  });

  if (!attendanceRecords.length || !studentsInClasses.length) {
    return (
      <div className="">
        <h1 className="text-xl font-semibold">-</h1>
        <span className="text-sm text-gray-500">Attendance</span>
      </div>
    );
  }

  // Calculate total present days across all classes
  let totalPresenceDays = 0;
  attendanceRecords.forEach(record => {
    totalPresenceDays += record.presentStudentIds.length;
  });

  // Calculate total possible attendance days (students × attendance days)
  const totalPossibleDays = studentsInClasses.length * attendanceRecords.length;
  
  // Calculate percentage
  const percentage = totalPossibleDays > 0 
    ? Math.round((totalPresenceDays / totalPossibleDays) * 100) 
    : 0;
  
  return (
    <div className="">
      <h1 className="text-xl font-semibold">{percentage}%</h1>
      <span className="text-sm text-gray-500">Attendance</span>
    </div>
  );
};

export default TeacherAttendanceCard;