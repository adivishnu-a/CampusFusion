import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Subject, Prisma, Department, Teacher } from "@prisma/client";

type SubjectList = {
  id: string;
  department: { name: string };
  class: { name: string };
  teacher: { name: string; surname: string };
};
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions } from "@/lib/queryUtils";

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  const currentUserId = userId;

  // Fetch related data for the form dropdowns
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });
  
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
  });
  
  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });
  
  // Combined related data for the form
  const formRelatedData = {
    classes,
    departments,
    teachers,
  };

  // Define filter options
  const filterOptions = [
    ...departments.map(dept => ({
      label: dept.name,
      value: dept.id,
      field: 'departmentId'
    })),
    ...classes.map(cls => ({
      label: cls.name,
      value: cls.id,
      field: 'classId'
    })),
    ...teachers.map(teacher => ({
      label: `${teacher.name} ${teacher.surname}`,
      value: teacher.id,
      field: 'teacherId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Department', field: 'department.name' },
    { label: 'Class', field: 'class.name' },
    { label: 'Teacher', field: 'teacher.name' }
  ];

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
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">{item.department.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="subject" type="update" data={item} relatedData={formRelatedData} />
              <FormModal table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sortField, sortOrder, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.SubjectWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = value;
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "departmentId":
            query.departmentId = value;
            break;
          case "search":
            query.OR = [
              { department: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } }
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Build query options with sorting
  const queryOptions = buildQueryOptions(searchParams, {
    where: query,
    include: {
      department: { select: { name: true } },
      class: { select: { name: true } },
      teacher: { select: { name: true, surname: true } },
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany(queryOptions),
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {role === "admin" && <FormModal table="subject" type="create" relatedData={formRelatedData} />}
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

export default SubjectListPage;
