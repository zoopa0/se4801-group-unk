import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { useToastStore } from '@/store/toastStore';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import StatusBadge from '@/components/shared/StatusBadge';
import Pagination from '@/components/shared/Pagination';
import { formatDate } from '@/lib/utils';
import { Shield, Trash2, Edit2, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Role } from '@/types/api';

export default function UserManagement() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const { data: usersPage, isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter, activeFilter, page],
    queryFn: () => adminService.listUsers({
      role: roleFilter,
      active: activeFilter,
      page,
      size: 10,
    }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminService.updateUser(id, { active }),
    onSuccess: () => {
      addToast('success', 'User activation state changed!');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Toggle status failed');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      addToast('success', 'User deleted from the system');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteUserId(null);
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Failed to delete user.');
      setDeleteUserId(null);
    },
  });

  if (isLoading) return <LoadingSkeleton variant="page" />;

  const users = usersPage?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-slate-500 text-sm">Configure system permissions, roles, and user statuses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 font-semibold mb-1">Filter by Role</label>
          <select
            value={roleFilter || ''}
            onChange={(e) => {
              setRoleFilter(e.target.value ? (e.target.value as Role) : undefined);
              setPage(0);
            }}
            className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-500 font-semibold mb-1">Filter by Status</label>
          <select
            value={activeFilter === undefined ? '' : activeFilter.toString()}
            onChange={(e) => {
              const val = e.target.value;
              setActiveFilter(val === '' ? undefined : val === 'true');
              setPage(0);
            }}
            className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-6 rounded-2xl">
        {users.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No users found matching the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 text-sm">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                      {user.fullName}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={user.active ? 'ACTIVE' : 'DROPPED'} />
                    </td>
                    <td className="py-4 px-4 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: user.id, active: !user.active })
                        }
                        className="text-slate-500 hover:text-brand-500 transition-colors p-1"
                        title={user.active ? 'Deactivate' : 'Activate'}
                      >
                        {user.active ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500 inline" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400 inline" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteUserId(user.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {usersPage && (
        <Pagination page={page} totalPages={usersPage.totalPages} onPageChange={setPage} />
      )}

      {/* Delete User Modal */}
      <ConfirmModal
        open={deleteUserId !== null}
        title="Delete User Account?"
        description="Are you sure you want to delete this user? This will completely purge their account record from the database."
        onConfirm={() => deleteUserMutation.mutateAsync(deleteUserId!)}
        onCancel={() => setDeleteUserId(null)}
      />
    </div>
  );
}
