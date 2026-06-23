import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { Bell, Search } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/student/dashboard': 'Dashboard',
  '/student/courses': 'Discover Courses',
  '/student/submissions': 'My Submissions',
  '/student/profile': 'Profile Settings',
  '/instructor/dashboard': 'Dashboard',
  '/instructor/courses': 'My Courses',
  '/instructor/courses/new': 'Create Course',
  '/instructor/analytics': 'Analytics',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/courses': 'Course Management',
  '/admin/monitoring': 'System Monitoring',
};

export default function TopNavbar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const title = pageTitles[location.pathname] || 'EduFlow';

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 glass border-b border-slate-200/50 dark:border-slate-700/30">
      <h1 className="text-lg font-heading font-semibold text-slate-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-300 placeholder-slate-400" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full" />
        </button>

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white text-sm font-bold">
              {getInitials(user.fullName)}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
