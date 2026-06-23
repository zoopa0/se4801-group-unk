import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { assignmentService } from '@/services/assignmentService';
import { submissionService } from '@/services/submissionService';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { BookOpen, User, Calendar, Award, ChevronRight, FileText } from 'lucide-react';

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments'>('overview');

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => courseService.getById(id),
  });

  const { data: assignmentsPage, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments', 'course', id],
    queryFn: () => assignmentService.listByCourse(id, 0, 100),
  });

  const { data: submissionsPage, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', 'my'],
    queryFn: () => submissionService.getMySubmissions(0, 100),
  });

  if (courseLoading || assignmentsLoading || submissionsLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Course not found</p>
        <Link to="/student/courses" className="text-brand-500 hover:underline mt-2 inline-block">
          Back to Course Discovery
        </Link>
      </div>
    );
  }

  const assignments = assignmentsPage?.content || [];
  const submissions = submissionsPage?.content || [];

  // Map assignment submission status
  const getAssignmentStatus = (assignmentId: number, dueDate: string) => {
    const sub = submissions.find((s) => s.assignmentId === assignmentId);
    if (sub) {
      return sub.status; // 'ON_TIME' or 'LATE' -> maps to Emerald / Red
    }
    const isOverdue = new Date(dueDate).getTime() < new Date().getTime();
    return isOverdue ? 'OVERDUE' : 'PENDING';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-brand-500/10 text-brand-500 text-xs font-bold rounded-md">
                {course.courseCode}
              </span>
              <span className="text-xs text-slate-500">
                Created {formatDate(course.createdAt)}
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              {course.title}
            </h2>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-slate-400" />
              <span>Instructor: <strong className="font-semibold">{course.instructorName}</strong></span>
            </div>
          </div>
          <Link
            to="/student/courses"
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start md:self-center"
          >
            Back to Discovery
          </Link>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700/50 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-500 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'assignments'
              ? 'border-brand-500 text-brand-500 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {/* Content area */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Course Description
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {course.description || 'No course description has been provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Subject Code</p>
                  <p className="text-sm font-semibold dark:text-slate-300">{course.courseCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Enrolled On</p>
                  <p className="text-sm font-semibold dark:text-slate-300">
                    {formatDate(course.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="glass-card p-6 rounded-2xl">
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                <h4 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  No Assignments Listed
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  The instructor has not added any assignments for this course yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Assignment Name</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Max Score</th>
                      <th className="py-3 px-4">Submission Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => {
                      const status = getAssignmentStatus(assignment.id, assignment.dueDate);
                      return (
                        <tr
                          key={assignment.id}
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-sm"
                        >
                          <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                            {assignment.title}
                          </td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(assignment.dueDate)}
                          </td>
                          <td className="py-4 px-4 font-mono font-medium">
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-brand-500" />
                              {assignment.maxScore} pts
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              to={`/student/assignments/${assignment.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
                            >
                              Open Details
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
