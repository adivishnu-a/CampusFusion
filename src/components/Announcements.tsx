import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Announcements = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  // const currentUserId = userId;

  const roleConditions = {
    teacher: { subjects: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href="/list/announcements" className="text-xs text-gray-500 hover:text-gray-700">View All</Link>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-campDarwinPastelCobaltBlue shadow-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[0].title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-IN").format(data[0].date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{data[0].description}</p>
          </div>
        )}
        {data[1] && (
          <div className="bg-campDarwinPastelCandyPeach shadow-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[1].title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-IN").format(data[1].date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{data[1].description}</p>
          </div>
        )}
        {data[2] && (
          <div className="bg-campDarwinPastelZincYellow shadow-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[2].title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-IN").format(data[2].date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{data[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
