import Announcements from "@/components/Announcements";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
const StudentPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  const currentUserId = userId;

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });
  console.log(classItem);

  return (
    <div className='p-4 flex gap-4 flex-col xl:flex-row'>
      {/* Left */}
      <div className='w-full xl:w-2/3'>
        <div className='h-full bg-white p-4 rounded-xl shadow-sm'>
          <h1 className="text-xl font-semibold text-campDarwinCharcoal">Schedule ({classItem[0].name})</h1>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
        </div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  )
}

export default StudentPage