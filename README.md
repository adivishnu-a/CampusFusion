# CampusFusion

CampusFusion is an ERP application designed to streamline key school operations. With an intuitive interface, it ensures that educators and students can efficiently access essential information, making daily activities more organized and seamless.

## Overview

CampusFusion is a comprehensive school management system built with Next.js, Tailwind CSS, and TypeScript. The application provides role-specific dashboards for administrators, teachers, students, and parents, allowing each user type to access relevant information and perform role-specific tasks.

## Roles

- **Admin**: Manages all users, classes, subjects, and school activities
- **Teacher**: Manages classes, lessons, exams, assignments, and student performance
- **Student**: Views schedule, assignments, exams, and personal performance
- **Parent**: Monitors their children's academic progress, attendance, and school announcements

## Core Features

- **Centralized Dashboard Overview**: Role-specific dashboards with tailored information
- **User Management**: Administration of teachers, students, and parents
- **Class & Subject Management**: Organization of educational structure
- **Schedule Management**: Lesson planning and calendar integration
- **Assessment Tools**: Exams, assignments, and results tracking
- **Attendance Tracking**: Student presence monitoring system
- **Event Calendar**: School-wide and class-specific events
- **Announcements System**: Important notifications for the school community
- **Performance Analytics**: Visual representation of attendance and academic performance
- **Finance Tracking**: Revenue and expense monitoring (admin)
- **Student Demographics**: Visual representation of student body composition

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Calendar**: React Big Calendar, React Calendar
- **Database Schema**: Prisma with MongoDB (planned)

## Getting Started

### Prerequisites

- Node.js (version 18 or above)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/adivishnu-a/CampusFusion.git
cd CampusFusion
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- (dashboard): Dashboard pages for different roles
- components: Reusable UI components
- lib: Utility functions and temporary data
- prisma: Database schema and configurations
