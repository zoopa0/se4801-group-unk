import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Grid, List, Plus, Edit2, Globe, Trash2, Eye, LayoutGrid } from 'lucide-react';

export default function MyCourses() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const qc = useQueryClient();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);

  const { data: coursesPage, isLoading } = useQuery({
    queryKey: ['courses', 'my'],
    queryFn: () => courseService.listInstructorCourses(0, 100),
  });

  const courses = coursesPage?.content || [];

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      courseService.update(id, { published }),
    onSuccess: () => {
      addToast('success', 'Course status updated successfully');
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Failed to update course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courseService.delete(id),
    onSuccess: () => {
      addToast('success', 'Course deleted successfully');
      qc.invalidateQueries({ queryKey: ['courses'] });
      setDeleteCourseId(null);
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Failed to delete course. Verify if students are enrolled.');
      setDeleteCourseId(null);
    },
  });

  if (isLoading) return <LoadingSkeleton variant="card" count={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">My Courses</h2>
          <p className="text-slate-500 text-sm">Manage your created courses and syllabus</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow text-brand-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 shadow text-brand-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <p className="text-slate-500 mb-4">You have not created any courses yet.</p>
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-all text-sm"
          >
            Get Started
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover-glow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 bg-brand-500/10 text-brand-500 text-xs font-bold rounded-md">
                    {course.courseCode}
                  </span>
                  <StatusBadge status={course.published ? 'PUBLISHED' : 'DRAFT'} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                  {course.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <Link
                  to={`/instructor/courses/${course.id}`}
                  className="flex-1 py-2 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Manage
                </Link>
                <Link
                  to={`/instructor/courses/${course.id}/edit`}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() =>
                    publishMutation.mutate({ id: course.id, published: !course.published })
                  }
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                  title={course.published ? 'Unpublish' : 'Publish'}
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteCourseId(course.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  <td className="py-4 px-4">
                    <StatusBadge status={course.published ? 'PUBLISHED' : 'DRAFT'} />
                  </td>
                  <td className="py-4 px-4 text-slate-500">{formatDate(course.createdAt)}</td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Link
                      to={`/instructor/courses/${course.id}`}
                      className="text-brand-500 hover:underline text-xs font-bold"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => setDeleteCourseId(course.id)}
                      className="text-red-500 hover:underline text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteCourseId !== null}
        title="Delete Course?"
        description="This action is permanent and will delete the course along with all associated assignments. It will fail if students are already enrolled."
        onConfirm={() => deleteMutation.mutateAsync(deleteCourseId!)}
        onCancel={() => setDeleteCourseId(null)}
      />
    </div>
  );
}
