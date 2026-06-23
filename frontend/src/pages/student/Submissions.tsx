import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { submissionService } from '@/services/submissionService';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import StatusBadge from '@/components/shared/StatusBadge';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { FileText, ClipboardCheck, AlertTriangle, Percent } from 'lucide-react';

export default function StudentSubmissions() {
  const [page, setPage] = useState(0);

  const { data: submissionsPage, isLoading } = useQuery({
    queryKey: ['submissions', 'my', page],
    queryFn: () => submissionService.getMySubmissions(page, 10),
  });

  const submissions = submissionsPage?.content || [];

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  // Derived statistics (for the sidebar analytics panel)
  const totalSubmissions = submissionsPage?.totalElements || 0;
  const onTimeCount = submissions.filter((s) => s.status === 'ON_TIME').length || 0;
  const lateCount = submissions.filter((s) => s.status === 'LATE').length || 0;
  const onTimeRatio = totalSubmissions > 0 ? Math.round((onTimeCount / totalSubmissions) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
        My Submissions
      </h2>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main submissions table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-6 rounded-2xl">
            {submissions.length === 0 ? (
              <EmptyState
                title="No Submissions Yet"
                description="You haven't submitted any work for your assignments yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Assignment</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-sm"
                      >
                        <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                          {sub.assignmentTitle}
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                          {sub.assignmentTitle} {/* or Course Title if structured */}
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          {formatDateTime(sub.submittedAt)}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={sub.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

        {/* Analytics sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Submission Performance
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Submissions</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {totalSubmissions}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">On-Time Ratio</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {onTimeRatio}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Late Submissions</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {lateCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 leading-relaxed">
              Make sure to submit all assignments before their deadlines to maintain a high on-time ratio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
