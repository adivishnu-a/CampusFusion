import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Department, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

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

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AssignmentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.subject = {
              ...(query.subject as Prisma.SubjectWhereInput),
              classId: value
            };
            break;
          case "teacherId":
            query.subject = {
              ...(query.subject as Prisma.SubjectWhereInput),
              teacherId: value
            };
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { subject: { department: { name: { contains: value, mode: "insensitive" } } } },
              { subject: { teacher: { name: { contains: value, mode: "insensitive" } } } }
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

  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        subject: {
          include: {
            department: true,
            class: true,
            teacher: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { dueDate: "desc" },
    }),
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
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue">
              <Image src="/filter.png" alt="" width={20} height={20} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue">
              <Image src="/sort.png" alt="" width={20} height={20} />
            </button>
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
