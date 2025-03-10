import prisma from "@/lib/prisma";
import Image from "next/image";

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

  return (
    <div className="rounded-2xl odd:bg-campDarwinCobaltBlue even:bg-campDarwinSignalBlue p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center gap-1">
        <span className="text-[12px] font-semibold bg-white px-2 py-1 rounded-full text-campDarwinCharcoal">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4 text-white">{data}</h1>
      <h2 className="capitalize font-semibold text-sm text-white">{type}s</h2>
    </div>
  );
};

export default UserCard;