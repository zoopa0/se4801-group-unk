import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { courseService } from '@/services/courseService';
import MetricCard from '@/components/shared/MetricCard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Users, UserCheck, BookOpen, ShieldAlert, Monitor, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: usersPage, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.listUsers({ page: 0, size: 100 }),
  });

  const { data: coursesPage, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => adminService.listCourses({ page: 0, size: 100 }),
  });

  if (usersLoading || coursesLoading) return <LoadingSkeleton variant="page" />;

  const users = usersPage?.content || [];
  const totalUsers = usersPage?.totalElements || 0;
  const activeStudents = users.filter((u) => u.role === 'STUDENT' && u.active).length;
  const activeInstructors = users.filter((u) => u.role === 'INSTRUCTOR' && u.active).length;
  const totalCourses = coursesPage?.totalElements || 0;

  const registrationTrends = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = {};
    const orderedDays: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      counts[dayName] = 0;
      orderedDays.push(dayName);
    }
    
    users.forEach((u) => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        // Map to day name in local time
        const dayName = days[d.getDay()];
        if (dayName in counts) {
          counts[dayName]++;
        }
      }
    });
    
    return orderedDays.map((name) => ({
      name,
      Registrations: counts[name],
    }));
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Admin Command Center</h2>
          <p className="text-slate-500 text-sm">System-wide monitoring, course moderations, and user profiles</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total System Users" value={totalUsers} icon={Users} color="blue" />
        <MetricCard title="Active Students" value={activeStudents} icon={UserCheck} color="cyan" />
        <MetricCard title="Active Instructors" value={activeInstructors} icon={UserCheck} color="emerald" />
        <MetricCard title="Total Courses" value={totalCourses} icon={BookOpen} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Registration Line Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">User Growth Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="Registrations" stroke="#4338CA" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions panel */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Management</h3>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">Manage Users</span>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/courses"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">Moderate Courses</span>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/monitoring"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-semibold dark:text-slate-300">System Monitoring</span>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Super admin role actions are logged.
          </div>
        </div>
      </div>
    </div>
  );
}
