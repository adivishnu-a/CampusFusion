import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  // Get all attendance records from the start of the year
  const startDate = new Date(new Date().getFullYear(), 0, 1);
  
  // Get all attendance records for classes this student is in
  const student = await prisma.student.findUnique({
    where: { id },
    select: { classId: true }
  });

  if (!student) {
    return (
      <div className="">
        <h1 className="text-xl font-semibold">-</h1>
        <span className="text-sm text-gray-500">Attendance</span>
      </div>
    );
  }

  // Get all attendance records for this student's class
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      classId: student.classId,
      date: {
        gte: startDate,
      },
    },
  });
  
  // Calculate how many days the student was present
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(record => 
    record.presentStudentIds.includes(id)
  ).length;
  
  // Calculate attendance percentage
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  
  return (
    <div className="">
      <h1 className="text-xl font-semibold">{percentage || "-"}%</h1>
      <span className="text-sm text-gray-500">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;