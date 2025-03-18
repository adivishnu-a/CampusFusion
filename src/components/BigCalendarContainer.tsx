import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string;
}) => {
  const dataRes = await prisma.subject.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as string }),
    },
    select: {
      name: true,
      startTime: true,
      endTime: true,
      day: true,
      class: {
        select: {
          name: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    }
  });

  const data = dataRes.map((subject) => ({
    title: `${subject.name} (${type === "teacherId" ? subject.class.name : subject.department.name})`,
    start: subject.startTime,
    end: subject.endTime,
    day: subject.day // Pass the day information to the schedule adjuster
  }));

  // Adjust schedule to current week with proper day mapping
  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="h-full" style={{ minHeight: "600px" }}>
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;