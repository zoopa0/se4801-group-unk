import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { submissionService } from '@/services/submissionService';
import { assignmentService } from '@/services/assignmentService';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import type { SubmissionDTO, SubmissionStatus } from '@/types/api';

export default function AssignmentReview() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const id = Number(assignmentId);

  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | undefined>(undefined);
  const [selectedSub, setSelectedSub] = useState<SubmissionDTO | null>(null);
  const [page, setPage] = useState(0);

  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignments', id],
    queryFn: () => assignmentService.getById(id),
  });

  const { data: submissionsPage, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', 'assignment', id, statusFilter, page],
    queryFn: () => submissionService.getForAssignment(id, statusFilter, page, 10),
  });

  if (assignmentLoading || submissionsLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (!assignment) return <div className="text-center py-12">Assignment not found.</div>;

  const submissions = submissionsPage?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link
          to={`/instructor/courses/${assignment.courseId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>
        <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mt-3">
          Submissions Review: {assignment.title}
        </h2>
      </div>

      {/* Filter and Content Split View */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: submissions list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 rounded-2xl space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setStatusFilter(undefined); setSelectedSub(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  statusFilter === undefined
                    ? 'border-brand-500 bg-brand-500/5 text-brand-500'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setStatusFilter('ON_TIME'); setSelectedSub(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  statusFilter === 'ON_TIME'
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-700'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                On-Time
              </button>
              <button
                onClick={() => { setStatusFilter('LATE'); setSelectedSub(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  statusFilter === 'LATE'
                    ? 'border-red-500 bg-red-500/5 text-red-700'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                Late
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No submissions found.
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedSub?.id === sub.id
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
                        : 'border-slate-100 hover:border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {sub.studentName}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-500">
                        {formatDateTime(sub.submittedAt)}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {submissionsPage && (
            <Pagination
              page={page}
              totalPages={submissionsPage.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* Right: Submission details & grader panel */}
        <div className="lg:col-span-2">
          {selectedSub ? (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedSub.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted on {formatDateTime(selectedSub.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge status={selectedSub.status} />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Submission Content
                </span>
                <div className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm font-mono whitespace-pre-wrap leading-relaxed dark:text-slate-300 min-h-[300px]">
                  {selectedSub.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-2xl h-full flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-500 text-sm">
                Select a student's submission from the list on the left to view their work details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
