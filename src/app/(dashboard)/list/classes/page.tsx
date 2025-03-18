import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Grade, Prisma, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions, parseFilterValues } from "@/lib/queryUtils";

type ClassList = Class & {
  supervisor: Teacher | null;
  grade: Grade;
  _count: {
    students: number;
    subjects: number;
  };
};

const ClassListPage = async ({
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
      header: "Class Name",
      accessor: "name",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },
    {
      header: "Students",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">Grade {item.grade.level}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.capacity}</td>
      <td className="hidden md:table-cell">{item._count.students}</td>
      <td className="hidden md:table-cell">{item._count.subjects}</td>
      <td className="hidden md:table-cell">
        {item.supervisor
          ? item.supervisor.name + " " + item.supervisor.surname
          : "-"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <Link href={`/list/students?classId=${item.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue">
                  <Image src="/view.png" alt="" width={16} height={16} />
                </button>
              </Link>
              <FormContainer table="class" type="update" data={item} />
              <FormContainer table="class" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch available grades and teachers for filters
  const grades = await prisma.grade.findMany({
    select: { id: true, level: true },
  });

  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });

  // Define filter options
  const filterOptions = [
    ...grades.map(grade => ({
      label: `Grade ${grade.level}`,
      value: grade.id,
      field: 'gradeId'
    })),
    ...teachers.map(teacher => ({
      label: `${teacher.name} ${teacher.surname}`,
      value: teacher.id,
      field: 'supervisorId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Name', field: 'name' },
    { label: 'Capacity', field: 'capacity' },
    { label: 'Grade Level', field: 'grade.level' },
    { label: 'Student Count', field: 'students._count' }, // Fixed format
    { label: 'Subject Count', field: 'subjects._count' }  // Fixed format
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            if (value.includes(',')) {
              // Handle multiple supervisor IDs
              const supervisorIds = parseFilterValues(value);
              query.OR = supervisorIds.map(id => ({ supervisorId: id }));
            } else {
              query.supervisorId = value;
            }
            break;
          case "gradeId":
            if (value.includes(',')) {
              // Handle multiple grade IDs
              const gradeIds = parseFilterValues(value);
              query.OR = gradeIds.map(id => ({ gradeId: id }));
            } else {
              query.gradeId = value;
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { supervisor: { name: { contains: value, mode: "insensitive" } } },
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
        { supervisorId: currentUserId },
        { subjects: { some: { teacherId: currentUserId } } },
      ];
      break;
    case "student":
      query.students = { some: { id: currentUserId } };
      break;
    case "parent":
      query.students = { some: { parentId: currentUserId } };
      break;
    default:
      break;
  }

  // Build query options with sorting
  const queryOptions = buildQueryOptions(searchParams, {
    where: query,
    include: {
      supervisor: true,
      grade: true,
      _count: {
        select: {
          students: true,
          subjects: true,
        },
      },
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany(queryOptions),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {role === "admin" && <FormContainer table="class" type="create" />}
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

export default ClassListPage;
