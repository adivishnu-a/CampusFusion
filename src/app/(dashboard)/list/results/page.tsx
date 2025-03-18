import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
// import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions } from "@/lib/queryUtils";

type ResultList = {
  id: string;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
  studentId: string;
  examId?: string;
  assignmentId?: string;
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Score",
      accessor: "score",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.studentName + " " + item.studentSurname}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">
        {item.teacherName + " " + item.teacherSurname}
      </td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-IN").format(item.startTime)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer 
                table="result" 
                type="update" 
                data={{
                  id: item.id,
                  score: item.score,
                  studentId: item.studentId,
                  examId: item.examId,
                  assignmentId: item.assignmentId
                }} 
              />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch students and classes for filter options
  const students = await prisma.student.findMany({
    select: { 
      id: true, 
      name: true,
      surname: true
    },
    ...(role === "teacher" ? {
      where: {
        class: {
          subjects: {
            some: {
              teacherId: currentUserId!
            }
          }
        }
      }
    } : {})
  });

  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // Define filter options
  const filterOptions = [
    ...students.map(student => ({
      label: `${student.name} ${student.surname}`,
      value: student.id,
      field: 'studentId'
    })),
    ...classes.map(cls => ({
      label: cls.name,
      value: cls.id,
      field: 'classId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Score', field: 'score' },
    { label: 'Date', field: 'exam.startTime' },
    { label: 'Student Name', field: 'student.name' }
  ];

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "classId":
            query.OR = [
              { exam: { subject: { classId: value } } },
              { assignment: { subject: { classId: value } } }
            ];
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
              { assignment: { title: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { subject: { teacherId: currentUserId! } } },
        { assignment: { subject: { teacherId: currentUserId! } } },
      ];
      break;

    case "student":
      query.studentId = currentUserId!;
      break;

    case "parent":
      query.student = {
        parentId: currentUserId!,
      };
      break;
    default:
      break;
  }

  // Build query options with sorting
  const queryOptions = buildQueryOptions(searchParams, {
    where: query,
    include: {
      student: { select: { name: true, surname: true } },
      exam: {
        include: {
          subject: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
            },
          },
        },
      },
      assignment: {
        include: {
          subject: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
            },
          },
        },
      },
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany(queryOptions),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes.map((item) => {
    const assessment = item.exam || item.assignment;

    if (!assessment) return null;

    const isExam = "startTime" in assessment;

    return {
      id: item.id,
      title: assessment.title,
      studentName: item.student.name,
      studentSurname: item.student.surname,
      teacherName: assessment.subject.teacher.name,
      teacherSurname: assessment.subject.teacher.surname,
      score: item.score,
      className: assessment.subject.class.name,
      startTime: isExam ? assessment.startTime : assessment.startDate,
      studentId: item.studentId,
      examId: item.examId || undefined,
      assignmentId: item.assignmentId || undefined
    };
  }).filter(Boolean) as ResultList[];

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
