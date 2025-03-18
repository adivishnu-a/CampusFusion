import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import Image from "next/image";
import Link from "next/link";
import FormContainer from "@/components/FormContainer";
import React from "react";
import { Teacher, Department, Class, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions } from "@/lib/queryUtils";

type TeacherList = Teacher & { departments: Department[] } & { classes: Class[] };

const TeachersListPage = async ({
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
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Departments",
      accessor: "departments",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
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
  
  const renderRow = (item: TeacherList) => (
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
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.departments.map((departmentItem)=>departmentItem.name).join(",")}</td>
      <td className="hidden md:table-cell">{item.classes.map((classItem)=>classItem.name).join(",")}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  // Fetch available departments for filters
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
  });

  // Define filter options
  const filterOptions = [
    ...departments.map(dept => ({
      label: dept.name,
      value: dept.id,
      field: 'departmentId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Name', field: 'name' },
    { label: 'Username', field: 'username' },
    { label: 'Phone', field: 'phone' },
    { label: 'Class Count', field: 'classes._count' }, // Fixed format
    { label: 'Department Count', field: 'departments._count' } // Fixed format
  ];

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  
  // URL PARAMS CONDITION
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.subjects = {
              some: {
                classId: value,
              },
            };
            break;
          case "departmentId":
            query.departments = {
              some: {
                id: value
              }
            };
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } }
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
      departments: true,
      classes: true,
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany(queryOptions),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex-1 m-4 mt-0">
      {/* Top */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {role === "admin" && <FormContainer table="teacher" type="create" />}
          </div>
        </div>
      </div>
      {/* List */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeachersListPage;
