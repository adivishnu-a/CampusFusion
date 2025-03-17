import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Department, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions, parseFilterValues, buildFilterCondition } from "@/lib/queryUtils";

type DepartmentList = Department & { teachers: Teacher[] };

const DepartmentListPage = async ({
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
      header: "Teachers",
      accessor: "teachers",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: DepartmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((teacher) => teacher.name).join(",")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="department" type="update" data={item} />
              <FormContainer table="department" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch teachers for filter options
  const teachers = await prisma.teacher.findMany({
    select: { 
      id: true, 
      name: true,
      surname: true
    }
  });

  // Define filter options
  const filterOptions = [
    ...teachers.map(teacher => ({
      label: `${teacher.name} ${teacher.surname}`,
      value: teacher.id,
      field: 'teacherId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Name', field: 'name' },
    { label: 'Teacher Count', field: 'teachers._count' } // Fixed format
  ];

  const { page, sortField, sortOrder, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.DepartmentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            // Handle multiple teacher IDs with OR relationship
            const teacherIds = parseFilterValues(value);
            if (teacherIds.length > 0) {
              query.teachers = {
                some: {
                  OR: teacherIds.map(id => ({ id }))
                }
              };
            }
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
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
      teachers: true,
      _count: {
        select: {
          teachers: true
        }
      }
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const [data, count] = await prisma.$transaction([
    prisma.department.findMany(queryOptions),
    prisma.department.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Departments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {role === "admin" && <FormContainer table="department" type="create" />}
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

export default DepartmentListPage;
