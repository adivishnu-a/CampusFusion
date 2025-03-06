import Announcements from "@/components/Announcements";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import BigCalendar from '@/components/BigCalendar';
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";

const SingleStudentPage = () => {
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
                src="https://images.pexels.com/photos/5414817/pexels-photo-5414817.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Student"
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
                <h1 className="text-xl text-white font-semibold">Cameron Moran</h1>
                {role === "admin" && (
                  <FormModal
                    table="student"
                    type="update"
                    data={{
                      id: 1,
                      username: "cameronmoran",
                      email: "cameronmoran@gmail.com",
                      password: "password",
                      firstName: "Cameron",
                      lastName: "Moran",
                      phone: "+1 234 567 89",
                      address: "1234 Main St, Anytown, USA",
                      bloodType: "B+",
                      birthday: "2003-01-01",
                      gender: "female",
                      img: "https://images.pexels.com/photos/5414817/pexels-photo-5414817.jpeg?auto=compress&cs=tinysrgb&w=1200",
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-gray-100">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </p>
              <div className="flex text-white items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={20} height={20} />
                  <span>A+</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={20} height={20} />
                  <span>January 2025</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={20} height={20} />
                  <span>user@gmail.com</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={20} height={20} />
                  <span>+1 234 567</span>
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
              <div className="">
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-500">Attendance</span>
              </div>
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
                <h1 className="text-xl font-semibold">6th</h1>
                <span className="text-sm text-gray-500">Grade</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 shadow-sm rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">18</h1>
                <span className="text-sm text-gray-500">Lessons</span>
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
                <h1 className="text-xl font-semibold">6A</h1>
                <span className="text-sm text-gray-500">Class</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white shadow-sm rounded-md p-4 h-[1000px]">
          <h1>Student&apos;s Schedule</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 shadow-sm rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-600">
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelCobaltBlue hover:bg-campDarwinPastelCobaltBlueHover" href={`/list/lessons?classId=67c817a5e76edc30ec336ff9`}>
              Student&apos;s Lessons
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelZincYellow hover:bg-campDarwinPastelZincYellowHover" href={`/list/teachers?classId=67c817a5e76edc30ec336ff9`}>
              Student&apos;s Teachers
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelOrange hover:bg-campDarwinPastelOrangeHover" href={`/list/exams?classId=67c817a5e76edc30ec336ff9`}>
              Student&apos;s Exams
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelCandyPeach hover:bg-campDarwinPastelCandyPeachHover" href={`/list/assignments?classId=67c817a5e76edc30ec336ff9`}>
              Student&apos;s Assignments
            </Link>
            <Link className="p-3 shadow-sm rounded-md bg-campDarwinPastelCobaltBlue hover:bg-campDarwinPastelCobaltBlueHover" href={`/list/results?studentId=67c817a5e76edc30ec336ff9`}>
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;