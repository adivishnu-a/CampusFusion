import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { buildQueryOptions } from "@/lib/queryUtils";

type AnnouncementList = Announcement & { class: Class | null };

const AnnouncementListPage = async ({
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
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
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

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-campDarwinPastelSlateGray text-sm hover:bg-campDarwinPastelBlue"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td className="hidden md:table-cell">{item.description}</td>
      <td>{item.class?.name || "School-wide"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-IN").format(item.date)}
      </td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="announcement" type="update" data={item} />
            <FormModal table="announcement" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Fetch classes for filter options
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // Define filter options
  const filterOptions = [
    {
      label: 'School-wide announcements',
      value: 'null',
      field: 'scope'
    },
    {
      label: 'Class-specific announcements',
      value: 'class',
      field: 'scope'
    },
    ...classes.map(cls => ({
      label: cls.name,
      value: cls.id,
      field: 'classId'
    }))
  ];

  // Define sort options
  const sortOptions = [
    { label: 'Title', field: 'title' },
    { label: 'Date', field: 'createdAt' },
    { label: 'Class', field: 'class.name' }
  ];

  const { page, sortField, sortOrder, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = value;
            break;
          case "scope":
            if (value === 'null') {
              query.classId = null;
            } else if (value === 'class') {
              query.classId = { not: null };
            }
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  if (role && role !== "admin") {
    const roleConditions: any = {
      teacher: { class: { subjects: { some: { teacherId: currentUserId! } } } },
      student: { class: { students: { some: { id: currentUserId! } } } },
      parent: { class: { students: { some: { parentId: currentUserId! } } } },
    };
    
    // For non-admin users, show school-wide announcements and class-specific announcements for their classes
    query.OR = [
      { classId: null }, // School-wide announcements
      roleConditions[role] || {}, // Class-specific announcements for the user's classes
    ];
  }

  try {
    // Build query options with sorting
    const queryOptions = buildQueryOptions(searchParams, {
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    });

    const [data, count] = await prisma.$transaction([
      prisma.announcement.findMany(queryOptions),
      prisma.announcement.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <FilterModal options={filterOptions} />
              <SortModal options={sortOptions} />
              {role === "admin" && (
                <FormModal table="announcement" type="create" />
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
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return (
      <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold text-red-500">Error loading announcements</h2>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }
};

export default AnnouncementListPage;
