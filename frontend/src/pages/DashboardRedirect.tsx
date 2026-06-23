import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function DashboardRedirect() {
  const role = useAuthStore((s) => s.role);
  if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (role === 'INSTRUCTOR') return <Navigate to="/instructor/dashboard" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}
