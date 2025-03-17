import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Department, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions, parseFilterValues } from "@/lib/queryUtils";

type ExamList = Exam & {
  subject: {
    department: Department;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
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
      header: "Department Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
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

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">
        {item.subject.department.name}
      </td>
      <td>{item.subject.class.name}</td>
      <td className="hidden md:table-cell">
        {item.subject.teacher.name + " " + item.subject.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-IN").format(item.startTime)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch subjects and classes for filter options
  const subjects = await prisma.subject.findMany({
    select: { 
      id: true, 
      department: { select: { name: true } },
      class: { select: { name: true } }
    },
  });

  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // Define filter options
  const filterOptions = [
    ...classes.map(cls => ({
      label: cls.name,
      value: cls.id,
      field: 'classId'
    })),
    ...subjects.map(subject => ({
      label: `${subject.department.name} (${subject.class.name})`,
      value: subject.id,
      field: 'subjectId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Title', field: 'title' },
    { label: 'Date', field: 'startTime' },
    { label: 'Department', field: 'subject.department.name' },
    { label: 'Class', field: 'subject.class.name' }
  ];

  const { page, sortField, sortOrder, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  // Use a properly typed subject object
  const query: Prisma.ExamWhereInput = {};
  const subjectQuery: Prisma.SubjectWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            if (value.includes(',')) {
              // Handle multiple class IDs
              const classIds = parseFilterValues(value);
              // Create proper nested query
              subjectQuery.OR = classIds.map(id => ({ classId: id }));
            } else {
              subjectQuery.classId = value;
            }
            break;
          case "teacherId":
            if (value.includes(',')) {
              // Handle multiple teacher IDs
              const teacherIds = parseFilterValues(value);
              subjectQuery.OR = teacherIds.map(id => ({ teacherId: id }));
            } else {
              subjectQuery.teacherId = value;
            }
            break;
          case "subjectId":
            if (value.includes(',')) {
              // Handle multiple subject IDs
              const subjectIds = parseFilterValues(value);
              query.OR = subjectIds.map(id => ({ subjectId: id }));
            } else {
              query.subjectId = value;
            }
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { subject: { department: { name: { contains: value, mode: "insensitive" } } } },
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
      subjectQuery.teacherId = currentUserId!;
      break;
    case "student":
      subjectQuery.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      subjectQuery.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  // Only add the subject query if we have conditions for it
  if (Object.keys(subjectQuery).length > 0) {
    query.subject = subjectQuery;
  }

  // Build query options with sorting
  const queryOptions = buildQueryOptions(searchParams, {
    where: query,
    include: {
      subject: {
        include: {
          department: true,
          teacher: { select: { name: true, surname: true } },
          class: { select: { name: true } },
        },
      },
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany(queryOptions),
    prisma.exam.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
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

export default ExamListPage;
