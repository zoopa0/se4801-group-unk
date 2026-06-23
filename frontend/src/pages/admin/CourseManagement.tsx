import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { useToastStore } from '@/store/toastStore';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import StatusBadge from '@/components/shared/StatusBadge';
import Pagination from '@/components/shared/Pagination';
import { formatDate } from '@/lib/utils';
import { Trash2, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function AdminCourseManagement() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [page, setPage] = useState(0);
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);

  const { data: coursesPage, isLoading } = useQuery({
    queryKey: ['admin', 'courses', page],
    queryFn: () => adminService.listCourses({ page, size: 10 }), // Displays all courses system-wide
  });

  const updateCourseMut = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      adminService.moderateCourse(id, { published }),
    onSuccess: () => {
      addToast('success', 'Course publishing status moderated!');
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Moderation failed');
    },
  });

  const deleteCourseMut = useMutation({
    mutationFn: (id: number) => adminService.deleteCourse(id),
    onSuccess: () => {
      addToast('success', 'Course deleted by Administrator');
      qc.invalidateQueries({ queryKey: ['admin', 'courses'] });
      setDeleteCourseId(null);
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Delete failed. Enrolled students active.');
      setDeleteCourseId(null);
    },
  });

  if (isLoading) return <LoadingSkeleton variant="page" />;

  const courses = coursesPage?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Moderate Courses</h2>
          <p className="text-slate-500 text-sm">System-wide control over course publications and syllabus deletions</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No courses registered in the system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created On</th>
                  <th className="py-3 px-4 text-right">Moderations</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-100 dark:border-slate-800 text-sm">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {course.courseCode}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {course.title}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {course.instructorName}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={course.published ? 'PUBLISHED' : 'DRAFT'} />
                    </td>
                    <td className="py-4 px-4 text-slate-500">{formatDate(course.createdAt)}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          updateCourseMut.mutate({ id: course.id, published: !course.published })
                        }
                        className={`p-1 rounded-lg transition-colors inline ${
                          course.published
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-emerald-500 hover:text-emerald-600'
                        }`}
                        title={course.published ? 'Unpublish Course' : 'Publish Course'}
                      >
                        {course.published ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteCourseId(course.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 inline"
                        title="Force Delete Course"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {coursesPage && (
        <Pagination page={page} totalPages={coursesPage.totalPages} onPageChange={setPage} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteCourseId !== null}
        title="Admin Force Delete Course?"
        description="This action is absolute. It will delete the course record along with all assigned files and submissions."
        onConfirm={() => deleteCourseMut.mutateAsync(deleteCourseId!)}
        onCancel={() => setDeleteCourseId(null)}
      />
    </div>
  );
}
