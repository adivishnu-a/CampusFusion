import EventCalendar from "@/components/EventCalendar";
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";
import EventCalendarContainer from "@/components/EventCalendarContainer";
const TeacherPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  const currentUserId = userId;
  return (
    <div className='p-4 flex gap-4 flex-col xl:flex-row'>
      {/* Left */}
      <div className='w-full xl:w-2/3'>
        <div className='h-full bg-white p-4 rounded-xl shadow-sm'>
          <h1 className="text-xl font-semibold text-campDarwinCharcoal">Schedule</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* Right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  )
}

export default TeacherPage;