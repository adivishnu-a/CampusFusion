import Announcements from "@/components/Announcements";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import BigCalendarContainer from '@/components/BigCalendarContainer';
import FormContainer from "@/components/FormContainer";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  let student = null;
  
  try {
    student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { include: { _count: { select: { subjects: true } } } },
        parent: true,
      },
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    notFound();
  }

  if (!student) {
    notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-campDarwinCobaltBlue shadow-sm py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"}
                alt="Student"
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
                <h1 className="text-xl text-white font-semibold">{student.name + " " + student.surname}</h1>
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-100">
                Parent: {student.parent?.name + " " + student.parent?.surname} ({student.parent?.username})
              </p>
              <div className="flex text-white items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={20} height={20} />
                  <span>{student.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={20} height={20} />
                  <span>{new Intl.DateTimeFormat("en-IN").format(student.birthday)}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={20} height={20} />
                  <span>{student.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={20} height={20} />
                  <span>{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 shadow-sm rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 shadow-sm rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">{student.class.name.charAt(0)}th</h1>
                <span className="text-sm text-gray-500">Grade</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 shadow-sm rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleSubject.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">{student.class._count.subjects}</h1>
                <span className="text-sm text-gray-500">Subjects</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 shadow-sm rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">{student.class.name}</h1>
                <span className="text-sm text-gray-500">Class</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white shadow-sm rounded-md p-4 h-[1000px]">
          <h1>Student&apos;s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 shadow-sm rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-600">
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelCobaltBlue hover:bg-campDarwinPastelCobaltBlueHover" href={`/list/subjects?classId=${student.class.id}`}>
              Student&apos;s Subjects
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelZincYellow hover:bg-campDarwinPastelZincYellowHover" href={`/list/teachers?classId=${student.class.id}`}>
              Student&apos;s Teachers
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelOrange hover:bg-campDarwinPastelOrangeHover" href={`/list/exams?classId=${student.class.id}`}>
              Student&apos;s Exams
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelCandyPeach hover:bg-campDarwinPastelCandyPeachHover" href={`/list/assignments?classId=${student.class.id}`}>
              Student&apos;s Assignments
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelCobaltBlue hover:bg-campDarwinPastelCobaltBlueHover" href={`/list/results?studentId=${student.id}`}>
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <Performance studentId={student.id} />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;