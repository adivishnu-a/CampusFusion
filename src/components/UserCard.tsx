import prisma from "@/lib/prisma";
import Image from "next/image";

// Function to calculate academic year based on current date
const getAcademicYear = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed, 5 = June
  
  // If before June, academic year is (currentYear-1)/(currentYear)
  // If June or later, academic year is (currentYear)/(currentYear+1)
  if (currentMonth < 5) { // Before June
    return `${currentYear-1}/${String(currentYear).slice(-2)}`;
  } else { // June or later
    return `${currentYear}/${String(currentYear+1).slice(-2)}`;
  }
};

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();
  
  // Get the current academic year
  const academicYear = getAcademicYear();

  return (
    <div className="rounded-2xl odd:bg-campDarwinCobaltBlue even:bg-campDarwinSignalBlue p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center gap-1">
        <span className="text-[12px] font-semibold bg-white px-2 py-1 rounded-full text-campDarwinCharcoal">
          {academicYear}
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4 text-white">{data}</h1>
      {type==="parent"?(<h2 className="capitalize font-semibold text-sm text-white">{type} Accounts</h2>):(<h2 className="capitalize font-semibold text-sm text-white">{type}s</h2>)}
    </div>
  );
};

export default UserCard;