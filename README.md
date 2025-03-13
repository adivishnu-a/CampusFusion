# CampusFusion

CampusFusion is a modern school ERP (Enterprise Resource Planning) application designed to streamline educational institution operations. It provides a comprehensive management system with role-based access control, making daily administrative and academic activities more organized and efficient.

## Overview

CampusFusion is built using modern web technologies including Next.js 14 with App Router, TypeScript, and Tailwind CSS. The system features role-specific dashboards for administrators, teachers, students, and parents, each tailored to their unique needs. Authentication is handled securely through Clerk, while file storage is managed using AWS S3.

## Roles and Access Control

- **Admin**: Complete system control with access to all management functions
  - User management (students, teachers, parents)
  - Academic configuration (classes, subjects, assignments)
  - System-wide announcements and events
  - Performance monitoring and analytics

- **Teacher**: Academic management and student monitoring
  - Class and subject management
  - Exam and assignment creation
  - Attendance tracking
  - Student performance assessment
  - Grade and result management

- **Student**: Personal academic portal
  - Class schedule and timetable view
  - Assignment submission
  - Exam schedule and results
  - Attendance records
  - Performance tracking

- **Parent**: Student progress monitoring
  - Ward's academic performance
  - Attendance tracking
  - Exam results and assignments
  - School announcements and events

## Core Features

### User Management
- Role-based user creation and management
- Secure authentication via Clerk
- Profile management with image upload capabilities
- Detailed user profiles with essential information
  - Blood type
  - Contact details
  - Academic records
  - Profile photos (stored in AWS S3)

### Academic Management
- Class Management
  - Grade-wise class organization
  - Dynamic capacity management
  - Teacher supervision assignment
  - Student enrollment tracking

- Subject Management
  - Subject-teacher mapping
  - Class-wise subject allocation
  - Curriculum tracking

- Examination System
  - Exam scheduling and management
  - Result recording and analysis
  - Performance tracking
  - Grade calculation

- Assignment System
  - Assignment creation and distribution
  - Due date management
  - Class-wise assignment tracking
  - Result recording

### Scheduling
- Class Timetable Management
  - Weekly schedule visualization
  - Teacher availability tracking
  - Subject-wise time slots
  - Conflict prevention

- Event Calendar
  - School event scheduling
  - Class-specific events
  - Visual calendar interface
  - Date-based event filtering

### Attendance System
- Daily attendance tracking
- Class-wise attendance management
- Attendance analytics and reporting
- Visual attendance statistics

### Communication
- Announcement System
  - School-wide announcements
  - Class-specific notifications
  - Date-based announcement tracking
  
- Event Management
  - School event creation
  - Event scheduling
  - Target audience specification
  - Calendar integration

## Technology Stack

### Frontend
- Next.js 14 with App Router
- React 18 with Server Components
- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form for form management
- Zod for schema validation

### Backend & Database
- MongoDB with Prisma ORM
- Clerk Authentication
- AWS S3 for file storage
- Server Actions for API endpoints

### UI Components
- React Big Calendar for scheduling
- React Calendar for date picking
- Recharts for data visualization
- React Toastify for notifications
- Custom reusable components

## Getting Started

### Prerequisites
- Node.js (version 18 or above)
- npm or yarn
- MongoDB database
- AWS S3 bucket for file storage
- Clerk account for authentication

### Environment Setup

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

3. Install dependencies:
```bash
npm install
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed the database:
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── teacher/      # Teacher dashboard
│   │   ├── student/      # Student dashboard
│   │   ├── parent/       # Parent dashboard
│   │   └── list/         # List views for entities
│   ├── api/              # API routes
│   └── [...auth]/        # Auth routes
├── components/            # Reusable React components
│   ├── forms/            # Form components
│   └── ui/               # UI components
├── lib/                  # Utility functions
│   ├── actions.ts        # Server actions
│   ├── prisma.ts         # Database client
│   ├── s3.ts            # AWS S3 utilities
│   └── utils.ts          # Helper functions
└── prisma/               # Database schema and migrations
```

