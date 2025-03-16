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