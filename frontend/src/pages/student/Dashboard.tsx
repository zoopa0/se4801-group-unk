import { useQuery } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollmentService';
import { submissionService } from '@/services/submissionService';
import { useAuthStore } from '@/store/authStore';
import MetricCard from '@/components/shared/MetricCard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { BookOpen, ClipboardCheck, FileText, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate, timeUntil } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: enrollments, isLoading: eLoading } = useQuery({ queryKey: ['enrollments', 'my'], queryFn: () => enrollmentService.getMyEnrollments(0, 100) });
  const { data: submissions, isLoading: sLoading } = useQuery({ queryKey: ['submissions', 'my'], queryFn: () => submissionService.getMySubmissions(0, 100) });

  if (eLoading || sLoading) return <LoadingSkeleton variant="page" />;

  const activeCourses = enrollments?.content.filter((e) => e.status === 'ACTIVE').length || 0;
  const totalSubmissions = submissions?.content.length || 0;
  const onTime = submissions?.content.filter((s) => s.status === 'ON_TIME').length || 0;

  // Weekly chart data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = weekDays.map((day, i) => ({
    day,
    submissions: submissions?.content.filter((s) => new Date(s.submittedAt).getDay() === (i + 1) % 7).length || 0,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your academic overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Courses" value={activeCourses} icon={BookOpen} color="blue" />
        <MetricCard title="Total Submissions" value={totalSubmissions} icon={FileText} color="cyan" />
        <MetricCard title="On-Time Submissions" value={onTime} icon={ClipboardCheck} color="emerald" />
        <MetricCard title="Courses Completed" value={enrollments?.content.filter(e => e.status === 'COMPLETED').length || 0} icon={Clock} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4338CA" stopOpacity={0.3} /><stop offset="100%" stopColor="#4338CA" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Area type="monotone" dataKey="submissions" stroke="#4338CA" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enrolled Courses */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Courses</h3>
          <div className="space-y-3">
            {enrollments?.content.slice(0, 5).map((e) => (
              <Link key={e.id} to={`/student/courses/${e.courseId}`}
                className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{e.courseTitle}</p>
                <p className="text-xs text-slate-500 mt-0.5">{e.status} · {formatDate(e.enrolledAt)}</p>
              </Link>
            ))}
            {(!enrollments || enrollments.content.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">No enrollments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
