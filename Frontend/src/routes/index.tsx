import { lazy } from 'react';
import { UserRole } from '../utils/roles';

// Lazy-loaded components for better performance
const Dashboard = lazy(() => import('../pages/student/Dashboard'));
const Profile = lazy(() => import('../pages/student/Profile'));
const Attendance = lazy(() => import('../pages/student/Attendance'));
const Holiday = lazy(() => import('../pages/student/Holiday'));
const Achievement = lazy(() => import('../pages/student/Achievement'));
const Result = lazy(() => import('../pages/student/Result'));
const Leave = lazy(() => import('../pages/student/Leave'));
const LeaveApplicationCreate = lazy(() => import('../pages/student/LeaveApplicationCreate'));
const Feedback = lazy(() => import('../pages/student/Feedback'));
const TimeTable = lazy(() => import('../pages/student/TimeTable'));
const Announcements = lazy(() => import('../pages/student/Announcements'));
const Logout = lazy(() => import('../pages/Logout'));

// Route definitions with role-based permissions
export const routes = [
  {
    path: '/',
    component: Dashboard,
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
    exact: true,
  },
  {
    path: '/profile',
    component: Profile,
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
    path: '/result',
    component: Result,
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
    roles: [UserRole.STUDENT],
  },
  {
    path: '/time-table',
    component: TimeTable,
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    path: '/announcements',
    component: Announcements,
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
  },
  {
    path: '/logout',
    component: Logout,
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT],
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
]; 