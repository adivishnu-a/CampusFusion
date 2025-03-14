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
  //   console.log(today.getDate(), today.getDay(), daysSinceMonday, lastMonday);
 
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
 
  resData.forEach(async(item) => {
    const itemDate = new Date(item.date);
    const dayOfWeek = itemDate.getDay();
 
    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      const dayName = daysOfWeek[dayOfWeek - 1];
      attendanceMap[dayName].present += item.presentStudentIds.length;
      const absent:any= await prisma.class.findFirst({
        where:{
          id: item.classId,
        },
        select:{
          capacity: true,
        }
      })
      attendanceMap[dayName].absent += absent.capacity - attendanceMap[dayName].present;
    }
  });
 
  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));
 
  // console.log(data);
 
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