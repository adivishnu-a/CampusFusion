// import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
// import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Department, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { buildQueryOptions } from "@/lib/queryUtils";

type AssignmentList = Assignment & {
  subject: {
    department: Department;
    class: Class;
    teacher: Teacher;
  };
};

const AssignmentListPage = async ({
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
      accessor: "department",
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
      header: "Assignment",
      accessor: "title",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
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

  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="p-4">{item.subject.department.name}</td>
      <td>{item.subject.class.name}</td>
      <td className="hidden md:table-cell">
        {item.subject.teacher.name + " " + item.subject.teacher.surname}
      </td>
      <td>{item.title}</td>
      <td>{new Date(item.dueDate).toLocaleDateString()}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || (role === "teacher" && item.subject.teacher.id === currentUserId)) && (
            <>
              <FormContainer table="assignment" type="update" data={{
                ...item,
                subjectId: item.subjectId
              }} />
              <FormContainer table="assignment" type="delete" id={item.id} />
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
    { label: 'Due Date', field: 'dueDate' },
    { label: 'Department', field: 'subject.department.name' },
    { label: 'Class', field: 'subject.class.name' }
  ];

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AssignmentWhereInput = {};

  query.subject = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.subject.classId = value;
            break;
          case "teacherId":
            query.subject.teacherId = value;
            break;
          case "subjectId":
            query.subjectId = value;
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
  if (role === "teacher" && currentUserId) {
    query.subject = {
      ...(query.subject as Prisma.SubjectWhereInput),
      teacherId: currentUserId
    };
  } else if (role === "student" && currentUserId) {
    query.subject = {
      ...(query.subject as Prisma.SubjectWhereInput),
      class: {
        students: {
          some: {
            id: currentUserId
          }
        }
      }
    };
  } else if (role === "parent" && currentUserId) {
    query.subject = {
      ...(query.subject as Prisma.SubjectWhereInput),
      class: {
        students: {
          some: {
            parentId: currentUserId
          }
        }
      }
    };
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
    prisma.assignment.findMany(queryOptions),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterModal options={filterOptions} />
            <SortModal options={sortOptions} />
            {(role === "admin" || role === "teacher") && <FormContainer table="assignment" type="create" />}
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

export default AssignmentListPage;
