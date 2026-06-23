import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '@/components/guards/RouteGuards';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardRedirect from '@/pages/DashboardRedirect';
import StudentDashboard from '@/pages/student/Dashboard';
import CourseDiscovery from '@/pages/student/CourseDiscovery';
import CourseDetails from '@/pages/student/CourseDetails';
import AssignmentDetails from '@/pages/student/AssignmentDetails';
import StudentSubmissions from '@/pages/student/Submissions';
import StudentProfile from '@/pages/student/Profile';
import InstructorDashboard from '@/pages/instructor/Dashboard';
import MyCourses from '@/pages/instructor/MyCourses';
import CourseForm from '@/pages/instructor/CourseForm';
import CourseManagement from '@/pages/instructor/CourseManagement';
import AssignmentForm from '@/pages/instructor/AssignmentForm';
import AssignmentReview from '@/pages/instructor/AssignmentReview';
import InstructorAnalytics from '@/pages/instructor/Analytics';
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import AdminCourseManagement from '@/pages/admin/CourseManagement';
import SystemMonitoring from '@/pages/admin/SystemMonitoring';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardRedirect /> },
      {
        element: <AppLayout />,
        children: [
          {
            element: <RoleGuard roles={['STUDENT']} />,
            children: [
              { path: '/student/dashboard', element: <StudentDashboard /> },
              { path: '/student/courses', element: <CourseDiscovery /> },
              { path: '/student/courses/:courseId', element: <CourseDetails /> },
              { path: '/student/assignments/:assignmentId', element: <AssignmentDetails /> },
              { path: '/student/submissions', element: <StudentSubmissions /> },
              { path: '/student/profile', element: <StudentProfile /> },
            ],
          },
          {
            element: <RoleGuard roles={['INSTRUCTOR']} />,
            children: [
              { path: '/instructor/dashboard', element: <InstructorDashboard /> },
              { path: '/instructor/courses', element: <MyCourses /> },
              { path: '/instructor/courses/new', element: <CourseForm /> },
              { path: '/instructor/courses/:courseId', element: <CourseManagement /> },
              { path: '/instructor/courses/:courseId/edit', element: <CourseForm /> },
              { path: '/instructor/courses/:courseId/assignments/new', element: <AssignmentForm /> },
              { path: '/instructor/assignments/:assignmentId/review', element: <AssignmentReview /> },
              { path: '/instructor/analytics', element: <InstructorAnalytics /> },
            ],
          },
          {
            element: <RoleGuard roles={['ADMIN']} />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboard /> },
              { path: '/admin/users', element: <UserManagement /> },
              { path: '/admin/courses', element: <AdminCourseManagement /> },
              { path: '/admin/monitoring', element: <SystemMonitoring /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
