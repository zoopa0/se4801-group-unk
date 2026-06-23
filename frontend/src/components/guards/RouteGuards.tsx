import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types/api';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleGuard({ roles }: { roles: Role[] }) {
  const role = useAuthStore((s) => s.role);
  if (!role || !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
