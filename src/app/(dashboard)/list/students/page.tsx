import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions, parseFilterValues } from "@/lib/queryUtils";

type StudentList = Student & { class: Class };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  // const userId = (sessionClaims?.metadata as { userId?: string })?.userId;
  // const currentUserId = userId;

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
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

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.class.name[0]}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.StudentWhereInput = {};
  
  // Fetch available class data for filters
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  const grades = await prisma.grade.findMany({
    select: { id: true, level: true },
  });

  // Define filter options
  const filterOptions = [
    ...classes.map(cls => ({
      label: cls.name,
      value: cls.id,
      field: 'classId'
    })),
    ...grades.map(grade => ({
      label: `Grade ${grade.level}`,
      value: grade.id,
      field: 'gradeId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Name', field: 'name' },
    { label: 'Class', field: 'class.name' },
    { label: 'Username', field: 'username' },
    { label: 'Email', field: 'email' },
    { label: 'Phone', field: 'phone' }
  ];

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              subjects: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "classId":
            if (value.includes(',')) {
              // Handle multiple class IDs
              const classIds = parseFilterValues(value);
              query.OR = classIds.map(id => ({ classId: id }));
            } else {
              query.classId = value;
            }
            break;
          case "gradeId":
            if (value.includes(',')) {
              // Handle multiple grade IDs
              const gradeIds = parseFilterValues(value);
              query.class = {
                OR: gradeIds.map(id => ({ gradeId: id }))
              };
            } else {
              query.class = { gradeId: value };
            }
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } },
              { email: { contains: value, mode: "insensitive" } }
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
      class: true,
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  try {
    const [data, count] = await prisma.$transaction([
      prisma.student.findMany(queryOptions),
      prisma.student.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            All Students
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <FilterModal options={filterOptions} />
              <SortModal options={sortOptions} />
              {role === "admin" && <FormContainer table="student" type="create" />}
            </div>
          </div>
        </div>
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={data} />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return (
      <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
        <h1 className="text-lg font-semibold text-red-500">Failed to load students.</h1>
      </div>
    );
  }
};
export default StudentListPage;
