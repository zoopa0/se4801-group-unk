import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignmentService';
import { useToastStore } from '@/store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const schema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  dueDate: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Due date must be in the future',
  }),
  maxScore: z.coerce.number().min(1, 'Score must be at least 1').max(1000, 'Max 1000 points'),
});

type FormData = z.infer<typeof schema>;

export default function AssignmentForm() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: Omit<FormData, 'dueDate'> & { dueDate: string }) =>
      assignmentService.create({
        courseId: id,
        title: data.title,
        description: data.description || '',
        dueDate: new Date(data.dueDate).toISOString(),
        maxScore: data.maxScore,
      }),
    onSuccess: () => {
      addToast('success', 'Assignment created successfully!');
      qc.invalidateQueries({ queryKey: ['assignments'] });
      navigate(`/instructor/courses/${id}`);
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Failed to create assignment');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <Link
          to={`/instructor/courses/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Management
        </Link>
      </div>

      <div className="glass-card p-8 rounded-2xl">
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-6">
          Create Assignment
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Assignment Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Midterm Programming Assignment"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('dueDate')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all"
              />
              {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Score
              </label>
              <input
                type="number"
                {...register('maxScore')}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all"
              />
              {errors.maxScore && <p className="text-xs text-red-500 mt-1">{errors.maxScore.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Instructions / Description
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Outline the rules, submission guidelines, questions, and references..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Assignment
          </button>
        </form>
      </div>
    </div>
  );
}
