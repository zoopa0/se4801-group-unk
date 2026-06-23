import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { assignmentService } from '@/services/assignmentService';
import { enrollmentService } from '@/services/enrollmentService';
import { useToastStore } from '@/store/toastStore';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Calendar, FileText, Users, ArrowLeft, Eye } from 'lucide-react';

export default function CourseManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<'assignments' | 'students'>('assignments');
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<number | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => courseService.getById(id),
  });

  const { data: assignmentsPage, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments', 'course', id],
    queryFn: () => assignmentService.listByCourse(id, 0, 100),
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', 'course', id],
    queryFn: () => enrollmentService.getCourseEnrollments(id),
  });

  const deleteAssignmentMut = useMutation({
    mutationFn: (aId: number) => assignmentService.delete(aId),
    onSuccess: () => {
      addToast('success', 'Assignment deleted successfully');
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setDeleteAssignmentId(null);
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Delete failed. Real submissions exist.');
      setDeleteAssignmentId(null);
    },
  });

  if (courseLoading || assignmentsLoading || enrollmentsLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (!course) return <div className="text-center py-12">Course not found.</div>;

  const assignments = assignmentsPage?.content || [];
  const students = enrollments || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-3 gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              {course.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Course Code: {course.courseCode}</p>
          </div>
          <Link
            to={`/instructor/courses/${id}/assignments/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Assignment
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700/50 gap-6">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'assignments'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500'
          }`}
        >
          Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'students'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500'
          }`}
        >
          Enrolled Students ({students.length})
        </button>
      </div>

      {/* Content */}
      <div className="glass-card p-6 rounded-2xl">
        {activeTab === 'assignments' && (
          assignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">No assignments created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Max Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asg) => (
                    <tr key={asg.id} className="border-b border-slate-100 dark:border-slate-800 text-sm">
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        {asg.title}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {formatDate(asg.dueDate)}
                      </td>
                      <td className="py-4 px-4 font-mono font-medium">{asg.maxScore} pts</td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Link
                          to={`/instructor/assignments/${asg.id}/review`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Submissions
                        </Link>
                        <button
                          onClick={() => setDeleteAssignmentId(asg.id)}
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
          )
        )}

        {activeTab === 'students' && (
          students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">No students enrolled yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((stu) => (
                    <tr key={stu.id} className="border-b border-slate-100 dark:border-slate-800 text-sm">
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        {stu.studentName}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={stu.status} />
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {formatDate(stu.enrolledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Delete Assignment Confirmation */}
      <ConfirmModal
        open={deleteAssignmentId !== null}
        title="Delete Assignment?"
        description="Are you sure you want to delete this assignment? It will fail if students have already submitted work."
        onConfirm={() => deleteAssignmentMut.mutateAsync(deleteAssignmentId!)}
        onCancel={() => setDeleteAssignmentId(null)}
      />
    </div>
  );
}
