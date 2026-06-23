import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignmentService';
import { submissionService } from '@/services/submissionService';
import { useToastStore } from '@/store/toastStore';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate, formatDateTime, timeUntil } from '@/lib/utils';
import { AlertCircle, Clock, Award, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

export default function AssignmentDetails() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const id = Number(assignmentId);

  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [content, setContent] = useState('');
  const [countdown, setCountdown] = useState('');

  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignments', id],
    queryFn: () => assignmentService.getById(id),
  });

  const { data: submissionsPage, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', 'my'],
    queryFn: () => submissionService.getMySubmissions(0, 100),
  });

  const submitMutation = useMutation({
    mutationFn: () => submissionService.submit({ assignmentId: id, content }),
    onSuccess: () => {
      addToast('success', 'Assignment submitted successfully!');
      qc.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Submission failed');
    },
  });

  // Calculate live countdown
  useEffect(() => {
    if (!assignment?.dueDate) return;

    const updateCountdown = () => {
      setCountdown(timeUntil(assignment.dueDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [assignment?.dueDate]);

  if (assignmentLoading || submissionsLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">Assignment not found</p>
        <Link to="/student/dashboard" className="text-brand-500 hover:underline mt-2 inline-block">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const existingSubmission = submissionsPage?.content.find(
    (s) => s.assignmentId === id
  );

  const isOverdue = new Date(assignment.dueDate).getTime() < new Date().getTime();
  const cannotSubmit = isOverdue || !!existingSubmission;

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('warning', 'Please provide submission content');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <div>
        <Link
          to={`/student/courses/${assignment.courseId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Assignments
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div>
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                {assignment.courseTitle}
              </span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                {assignment.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-bold">Due Date</p>
                  <p className="text-xs font-semibold dark:text-slate-300">
                    {formatDate(assignment.dueDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-bold">Max Score</p>
                  <p className="text-xs font-semibold dark:text-slate-300">
                    {assignment.maxScore} Points
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-bold">Time Left</p>
                  <p
                    className={`text-xs font-semibold ${
                      isOverdue ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {countdown}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Instructions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {assignment.description || 'No description or files have been uploaded.'}
            </p>
          </div>
        </div>

        {/* Right: Submission Box */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Submission Status
            </h3>

            {existingSubmission ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                      Work Submitted
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-0.5">
                      Submitted on {formatDateTime(existingSubmission.submittedAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Submission Status</span>
                  <div>
                    <StatusBadge status={existingSubmission.status} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Submitted Content</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-mono whitespace-pre-wrap dark:text-slate-300">
                    {existingSubmission.content}
                  </div>
                </div>
              </div>
            ) : isOverdue ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">
                      Submission Locked
                    </h4>
                    <p className="text-xs text-red-700 dark:text-red-500 mt-0.5">
                      The due date for this assignment has passed. Submissions are no longer accepted.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSub} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Submit Content
                  </label>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={5000}
                    placeholder="Enter your assignment content/submission details here..."
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all resize-none"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Max 5000 characters</span>
                    <span>{content.length}/5000</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cannotSubmit || submitMutation.isPending}
                  className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
