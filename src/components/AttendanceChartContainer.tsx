import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";
 
const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
 
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);
  lastMonday.setHours(0, 0, 0, 0);
 
  // Get attendance data for the current week
  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
      },
    },
    select: {
      date: true,
      presentStudentIds: true,
      classId: true,
    },
  });
 
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 
  // Initialize attendance map with zero counts
  const attendanceMap: {
    [key: string]: { present: number; absent: number };
  } = {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
    Sat: { present: 0, absent: 0 },
  };
 
  // Process each attendance record
  for (const item of resData) {
    const itemDate = new Date(item.date);
    const dayOfWeek = itemDate.getDay();
 
    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      const dayName = daysOfWeek[dayOfWeek - 1];
      const presentCount = item.presentStudentIds.length;
      attendanceMap[dayName].present += presentCount;
      
      // Get the actual student count in the class to calculate absent students
      const classData = await prisma.class.findFirst({
        where: {
          id: item.classId,
        },
        include: {
          _count: {
            select: {
              students: true
            }
          }
        }
      });
      
      if (classData && classData._count.students > 0) {
        const totalStudents = classData._count.students;
        const absentCount = totalStudents - presentCount;
        attendanceMap[dayName].absent += absentCount;
      }
    }
  }
 
  // Format the data for the chart
  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));
 
  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <AttendanceChart data={data} />
    </div>
  );
};
 
export default AttendanceChartContainer;