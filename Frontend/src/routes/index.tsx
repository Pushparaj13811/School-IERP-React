import React from 'react';
import { lazy } from 'react';
import { UserRole } from '../utils/roles';

// Lazy-loaded components for better performance
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'));
const ParentDashboard = lazy(() => import('../pages/parent/Dashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));

// Profile components
const StudentProfile = lazy(() => import('../pages/student/Profile'));
const TeacherProfile = lazy(() => import('../pages/teacher/Profile'));
const ParentProfile = lazy(() => import('../pages/parent/Profile'));
const AdminProfile = lazy(() => import('../pages/admin/Profile'));

const Attendance = lazy(() => import('../pages/student/Attendance'));
const Holiday = lazy(() => import('../pages/student/Holiday'));
const Achievement = lazy(() => import('../pages/student/Achievement'));
const Result = lazy(() => import('../pages/student/Result'));
const Leave = lazy(() => import('../pages/student/Leave'));
const LeaveApplicationCreate = lazy(() => import('../pages/student/LeaveApplicationCreate'));
const Feedback = lazy(() => import('../pages/student/Feedback'));
const TimeTable = lazy(() => import('../pages/student/TimeTable'));
const Announcements = lazy(() => import('../pages/shared/AnnouncementView'));
const Logout = lazy(() => import('../pages/Logout'));

// Admin pages
const AddTeacher = lazy(() => import('../pages/admin/AddTeacher'));
const AddParents = lazy(() => import('../pages/admin/AddParents'));
const AddStudents = lazy(() => import('../pages/admin/AddStudents'));
const CreateAnnouncement = lazy(() => import('../pages/admin/CreateAnnouncement'));
const Report = lazy(() => import('../pages/admin/Report'));
const StudentsList = lazy(() => import('../pages/admin/StudentsList'));
const TeachersList = lazy(() => import('../pages/admin/TeachersList'));
const ParentsList = lazy(() => import('../pages/admin/ParentsList'));
const ManageResults = lazy(() => import('../pages/admin/ManageResults'));

const ResultEntry = lazy(() => import('../pages/teacher/ResultEntry'));
const CreateAnnouncementTeacher = lazy(() => import('../pages/teacher/CreateAnnouncement'));
const Contact = lazy(() => import('../pages/shared/Contact'));

// Update the imports at the top
const AdminAnnouncements = lazy(() => import('../pages/admin/Announcements'));

interface RouteComponentProps {
  user: { role: UserRole } | null;
}

type RouteComponent = React.FC<RouteComponentProps>;

interface Route {
  path: string;
  component: RouteComponent | React.FC;
  roles: UserRole[];
  exact?: boolean;
}

// Route definitions with role-based permissions
export const routes: Route[] = [
  {
    path: '/',
    component: ({ user }: RouteComponentProps) => {
      switch (user?.role) {
        case UserRole.ADMIN:
          return <AdminDashboard />;
        case UserRole.TEACHER:
          return <TeacherDashboard />;
        case UserRole.PARENT:
          return <ParentDashboard />;
        default:
          return <StudentDashboard />;
      }
    },
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
    exact: true,
  },
  {
    path: '/profile',
    component: ({ user }: RouteComponentProps) => {
      switch (user?.role) {
        case UserRole.ADMIN:
          return <AdminProfile />;
        case UserRole.TEACHER:
          return <TeacherProfile />;
        case UserRole.PARENT:
          return <ParentProfile />;
        default:
          return <StudentProfile />;
      }
    },
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
  },
  {
    path: '/attendance',
    component: Attendance,
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT],
  },
  {
    path: '/holiday',
    component: Holiday,
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
  },
  {
    path: '/achievement',
    component: Achievement,
    roles: [UserRole.STUDENT, UserRole.PARENT],
  },
  {
    path:'/contact_us',
    component: Contact,
    roles: [UserRole.PARENT],
  },
  {
    path: '/result',
    component: ({ user }: RouteComponentProps) => {
      if (user?.role === UserRole.TEACHER) {
        return <ResultEntry />;
      }
      return <Result />;
    },
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT],
  },
  {
    path: '/leave',
    component: Leave,
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    path: '/leave/create',
    component: LeaveApplicationCreate,
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    path: '/feedback',
    component: Feedback,
    roles: [UserRole.STUDENT,UserRole.PARENT],
  },
  {
    path: '/time-table',
    component: TimeTable,
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    path: '/announcements',
    component: ({ user }: RouteComponentProps) => {
      if (user?.role === UserRole.ADMIN) {
        return <AdminAnnouncements />;
      }
      return <Announcements />;
    },
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
  },
  {
    path: '/logout',
    component: Logout,
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
  },
  // Admin routes
  {
    path: '/students',
    component: StudentsList,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/teachers',
    component: TeachersList,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/parents',
    component: ParentsList,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/manage-results',
    component: ManageResults,
    roles: [UserRole.ADMIN],
  },
  {
    path: 'teachers/add-teacher',
    component: AddTeacher,
    roles: [UserRole.ADMIN],
  },
  {
    path: 'parents/add-parents',
    component: AddParents,
    roles: [UserRole.ADMIN],
  },
  {
    path: 'students/add-students',
    component: AddStudents,
    roles: [UserRole.ADMIN],
  },
  {
    path: 'announcements/create-announcement',
    component: CreateAnnouncement,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/report',
    component: Report,
    roles: [UserRole.ADMIN],
  },
  // Profile view routes
  {
    path: '/student-profile/:id',
    component: StudentProfile,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/teacher-profile/:id',
    component: TeacherProfile,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/parent-profile/:id',
    component: ParentProfile,
    roles: [UserRole.ADMIN],
  },
  {
    path: '/announcements/create',
    component: CreateAnnouncementTeacher,
    roles: [UserRole.TEACHER],
  },
];

// Route groups for sidebar navigation
export const routeGroups = [
  {
    title: 'Home',
    icon: 'bi-house-door-fill',
    routes: ['/', '/profile'],
  },
  {
    title: 'Academics',
    icon: 'bi-book',
    routes: ['/time-table', '/attendance'],
  },
  {
    title: 'Exam',
    icon: 'bi-file-earmark-text',
    routes: ['/result'],
  },
  {
    title: 'Others',
    icon: 'bi-three-dots',
    routes: ['/leave', '/holiday', '/achievement', '/feedback', '/announcements'],
  },
  {
    title: 'User Management',
    icon: 'bi-people',
    routes: [
      '/teacher/add-teacher',
      '/parents/add-parents',
      '/students/add-students',
      '/students',
      '/teachers',
      '/parents'
    ],
  },
  {
    title: 'Admin Tools',
    icon: 'bi-gear-fill',
    routes: [
      '/manage-results',
      '/report'
    ],
  },
]; 