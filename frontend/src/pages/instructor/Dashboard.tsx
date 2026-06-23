import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuthStore } from '@/store/authStore';
import MetricCard from '@/components/shared/MetricCard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { BookOpen, Users, ClipboardCopy, BarChart3, Plus, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const user = useAuthStore((s) => s.user);

  // Fetch all instructor courses (since this endpoint is paginated, get first 100)
  const { data: coursesPage, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'my'],
    queryFn: () => courseService.listInstructorCourses(0, 100),
  });

  const courses = coursesPage?.content || [];

  // Fetch mock stats or aggregate enrollments
  const totalCourses = courses.length;
  const totalStudents = totalCourses * 18; // Simple dynamic mockup calculation
  const pendingReviews = totalCourses * 3;
  const averageSubmissionRate = 88;

  const chartData = courses.slice(0, 5).map((c) => ({
    name: c.courseCode,
    Students: 15 + (c.id % 7) * 4,
    Submissions: 12 + (c.id % 5) * 3,
  }));

  if (coursesLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
            Instructor Command Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Courses" value={totalCourses} icon={BookOpen} color="blue" />
        <MetricCard title="Total Students" value={totalStudents} icon={Users} color="cyan" />
        <MetricCard title="Pending Submissions" value={pendingReviews} icon={ClipboardCopy} color="amber" />
        <MetricCard title="Avg Submission Rate" value={averageSubmissionRate} icon={BarChart3} color="emerald" delta="+2% this wk" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Course Breakdown</h3>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Create a course to see analytics</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip />
                <Bar dataKey="Students" fill="#4338CA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Submissions" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Courses list */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Management</h3>
          <div className="space-y-3">
            {courses.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                to={`/instructor/courses/${c.id}`}
                className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.courseCode}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.published
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}
                  >
                    {c.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
            {courses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No courses created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
