# CampusFusion

CampusFusion is a modern school ERP (Enterprise Resource Planning) application designed to streamline educational institution operations. It provides a comprehensive management system with role-based access control, making daily administrative and academic activities more organized and efficient.

## Overview

Built with Next.js 14, TypeScript, and Tailwind CSS, CampusFusion features role-specific dashboards for administrators, teachers, students, and parents. Authentication is handled through Clerk, with file storage managed by AWS S3.

## Roles and Access Control

- **Admin**: Complete system control (user management, academic configuration, announcements, analytics)
- **Teacher**: Academic management (classes, assignments, attendance, grades)
- **Student**: Personal academic portal (schedules, assignments, exams, performance)
- **Parent**: Student progress monitoring (performance, attendance, announcements)

## Core Features

### User Management
- Role-based access with Clerk authentication
- Profile management with AWS S3 image storage
- Comprehensive user profiles

### Academic Management
- Class & Department organization
- Examination & Assignment systems
- Performance tracking

### Communication
- Announcements (school-wide or class-specific)
- Event scheduling & calendar integration

### Scheduling & Attendance
- Class timetables & event calendars
- Attendance tracking & reporting

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: MongoDB with Prisma ORM, Clerk Authentication, AWS S3
- **UI Components**: React Big Calendar, Recharts, React Toastify

<details>
<summary>API Reference</summary>

### Server Actions

#### Department Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createDepartment` | Creates a new department | Admin |
| `updateDepartment` | Updates an existing department | Admin |
| `deleteDepartment` | Deletes a department | Admin |

#### Class Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createClass` | Creates a new class | Admin |
| `updateClass` | Updates an existing class | Admin |
| `deleteClass` | Deletes a class (only if it has no students or subjects) | Admin |

#### Teacher Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createTeacher` | Creates a new teacher account with Clerk integration | Admin |
| `updateTeacher` | Updates a teacher's information | Admin |
| `deleteTeacher` | Deletes a teacher account and related Clerk user | Admin |

#### Student Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createStudent` | Creates a new student account with Clerk integration | Admin |
| `updateStudent` | Updates a student's information | Admin |
| `deleteStudent` | Deletes a student account and related Clerk user | Admin |

#### Parent Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createParent` | Creates a new parent account with Clerk integration | Admin |
| `updateParent` | Updates a parent's information | Admin |
| `deleteParent` | Deletes a parent account and related Clerk user | Admin |

#### Subject Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createSubject` | Creates a new subject | Admin |
| `updateSubject` | Updates an existing subject | Admin |
| `deleteSubject` | Deletes a subject | Admin |

#### Exam Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createExam` | Creates a new exam | Admin, Teacher (for own subjects) |
| `updateExam` | Updates an existing exam | Admin, Teacher (for own subjects) |
| `deleteExam` | Deletes an exam | Admin, Teacher (for own subjects) |

#### Assignment Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createAssignment` | Creates a new assignment | Admin, Teacher |
| `updateAssignment` | Updates an existing assignment | Admin, Teacher |
| `deleteAssignment` | Deletes an assignment | Admin, Teacher |

#### Result Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createResult` | Creates a new exam/assignment result | Admin, Teacher |
| `updateResult` | Updates an existing result | Admin, Teacher |
| `deleteResult` | Deletes a result | Admin, Teacher |

#### Event Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createEvent` | Creates a new event (school-wide or class-specific) | Admin |
| `updateEvent` | Updates an existing event | Admin |
| `deleteEvent` | Deletes an event | Admin |

#### Announcement Management
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `createAnnouncement` | Creates a new announcement (school-wide or class-specific) | Admin |
| `updateAnnouncement` | Updates an existing announcement | Admin |
| `deleteAnnouncement` | Deletes an announcement | Admin |

#### Utility Functions
| Function | Description | Roles |
| -------- | ----------- | ----- |
| `getEntityName` | Retrieves the name of a specific entity type for BreadCrumb | All |

### API Endpoints

#### Authentication
| Method | Endpoint | Description | Protected | Roles |
| ------ | -------- | ----------- | --------- | ----- |
| `GET` | `/api/user/role` | Get current user's role and ID | Yes | All |

#### Classes
| Method | Endpoint | Description | Protected | Roles |
| ------ | -------- | ----------- | --------- | ----- |
| `GET` | `/api/classes` | Get all classes | Yes | Admin |
| `GET` | `/api/classes?teacherId={id}` | Get classes supervised by a teacher | Yes | Teacher |

#### Students
| Method | Endpoint | Description | Protected | Roles |
| ------ | -------- | ----------- | --------- | ----- |
| `GET` | `/api/students?classId={id}` | Get students in a specific class | Yes | Admin, Teacher |

#### Attendance
| Method | Endpoint | Description | Protected | Roles |
| ------ | -------- | ----------- | --------- | ----- |
| `GET` | `/api/attendance?classId={id}&date={date}` | Get attendance for a specific class and date | Yes | Admin, Teacher |
| `POST` | `/api/attendance` | Create a new attendance record | Yes | Admin, Teacher |
| `PUT` | `/api/attendance` | Update an existing attendance record | Yes | Admin, Teacher |

#### Results
| Method | Endpoint | Description | Protected | Roles |
| ------ | -------- | ----------- | --------- | ----- |
| `GET` | `/api/results?studentId={id}` | Get results for a specific student | Yes | Admin, Teacher, Student (self), Parent (own children) |
| `GET` | `/api/results?teacherId={id}` | Get aggregated performance data for a teacher | Yes | Admin, Teacher (self) |
| `GET` | `/api/results` | Get all results (with role-based filtering) | Yes | Admin, Teacher |

### Integrations

#### Authentication (Clerk)
- User registration and authentication
- Role-based access control
- User profile management

#### File Storage (AWS S3)
- Profile image uploads
- Image storage and retrieval
- Secure file deletion

#### Data Visualization (Recharts)
- Performance charts
- Attendance tracking
- Grade distribution analytics

#### Calendar Integration (React Big Calendar)
- Event scheduling
- Class timetables
- Academic calendar management

</details>

<details>
<summary>Recent Optimizations</summary>

### Performance Improvements

#### Teacher Performance Calculation
- Replaced multiple nested API calls with a single optimized endpoint
- Implemented server-side aggregation of result data
- Reduced page load time for teacher profiles dramatically

#### Safe Department Handling
- Added proper handling for null department references
- Pre-fetch department data before rendering teacher profiles
- Improved error handling for missing database records

</details>

## Getting Started

### Prerequisites
- Node.js (v18+), npm/yarn, MongoDB, AWS S3 bucket, Clerk account

### Setup

1. Clone the repository
```bash
git clone https://github.com/adivishnu-a/CampusFusion.git
cd CampusFusion
```

2. Configure environment variables in .env:
```env
MONGO_DATABASE_URL="your_mongodb_url"
CLERK_SECRET_KEY="your_clerk_secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
AWS_ACCESS_KEY="your_aws_access_key"
AWS_SECRET_KEY="your_aws_secret_key"
AWS_REGION="your_aws_region"
AWS_BUCKET_NAME="your_s3_bucket_name"
```

3. Installation and setup:
```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: seed the database
npm run dev
```

## Project Structure

```
src/
├── app/                   # Next.js app directory
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/         # Admin-specific pages
│   │   ├── teacher/       # Teacher-specific pages
│   │   ├── student/       # Student-specific pages
│   │   ├── parent/        # Parent-specific pages
│   │   └── list/          # Entity list views (assignments, announcements, etc.)
│   ├── api/               # API endpoints
│   └── (auth)/            # Authentication pages
├── components/            # Reusable React components
│   ├── forms/             # Form components for data entry
│   ├── ui/                # UI elements and layout components
│   └── charts/            # Data visualization components
├── lib/                   # Utility functions
│   ├── actions.ts         # Server actions for data operations
│   ├── prisma.ts          # Database client configuration
│   ├── s3.ts              # AWS S3 file storage utilities
│   ├── data.ts            # Data structures and mock data
│   └── formValidationSchemas.ts # Zod validation schemas
└── prisma/                # Database configuration
    ├── schema.prisma      # Prisma data model
    └── seed.ts            # Database seeding script
```