import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useToastStore } from '@/store/toastStore';
import { useQuery, useQueries } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { assignmentService } from '@/services/assignmentService';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { FileSpreadsheet, FileText, BarChart3, BookOpen } from 'lucide-react';

export default function InstructorAnalytics() {
  const addToast = useToastStore((s) => s.addToast);

  // Fetch instructor's courses
  const { data: coursesPage, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'my'],
    queryFn: () => courseService.listInstructorCourses(0, 100),
  });

  const courses = coursesPage?.content || [];

  // Fetch assignments for each course in parallel
  const assignmentQueries = useQueries({
    queries: courses.map((c) => ({
      queryKey: ['assignments', 'course', c.id],
      queryFn: () => assignmentService.listByCourse(c.id, 0, 100),
      enabled: !!c.id,
    })),
  });

  const isAssignmentsLoading = assignmentQueries.some((q) => q.isLoading);

  if (coursesLoading || isAssignmentsLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  // Generate dynamic data: Assignments count per course
  const courseAssignmentsData = courses.map((c, idx) => {
    const assignmentsCount = assignmentQueries[idx]?.data?.totalElements || 0;
    return {
      name: c.courseCode,
      Assignments: assignmentsCount,
    };
  });

  // Generate dynamic data: Course publication status breakdown
  const publishedCount = courses.filter((c) => c.published).length;
  const draftCount = courses.length - publishedCount;
  const statusData = [
    { name: 'Published', Courses: publishedCount },
    { name: 'Drafts', Courses: draftCount },
  ];

  const handleExportCSV = () => {
    if (courses.length === 0) {
      addToast('error', 'No course data available to export.');
      return;
    }
    const headers = ['Course Title', 'Course Code', 'PublishedStatus', 'AssignmentsCount'];
    const rows = courses.map((c, idx) => {
      const assignmentsCount = assignmentQueries[idx]?.data?.totalElements || 0;
      return [
        c.title,
        c.courseCode,
        c.published ? 'Published' : 'Draft',
        assignmentsCount.toString(),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'eduflow_instructor_analytics.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Analytics data exported successfully as CSV!');
  };

  const handleExportPDF = () => {
    addToast('success', 'Exporting report details as PDF (Printing current page view)...');
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
          <p className="text-slate-500 text-sm">Analyze course structures, published states, and assignments</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all"
          >
            <FileText className="w-4 h-4 text-red-500" /> Print PDF
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">No Analytics Data</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
            Create courses and assignments to see performance charts.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Assignments count by course */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Assignments per Course
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={courseAssignmentsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Assignments" fill="#4338CA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Published vs Draft Courses */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-500" />
              Course Publication Status
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Courses" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
