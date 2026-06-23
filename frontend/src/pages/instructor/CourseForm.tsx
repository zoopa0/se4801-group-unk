import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { useToastStore } from '@/store/toastStore';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  courseCode: z.string().min(2, 'Course code is required').max(20),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  published: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function CourseForm() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = courseId ? Number(courseId) : null;
  const isEdit = id !== null;

  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const qc = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => courseService.getById(id!),
    enabled: isEdit,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        courseCode: course.courseCode,
        description: course.description || '',
        published: course.published,
      });
    }
  }, [course, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEdit) {
        return courseService.update(id!, data);
      }
      return courseService.create(data);
    },
    onSuccess: () => {
      addToast('success', isEdit ? 'Course updated!' : 'Course created successfully!');
      qc.invalidateQueries({ queryKey: ['courses'] });
      navigate('/instructor/courses');
    },
    onError: (err: any) => {
      addToast('error', err?.response?.data?.message || 'Action failed');
    },
  });

  if (isEdit && courseLoading) return <LoadingSkeleton variant="page" />;

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </Link>
      </div>

      <div className="glass-card p-8 rounded-2xl">
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-6">
          {isEdit ? 'Edit Course Details' : 'Create a New Course'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Course Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Introduction to Software Engineering"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Course Code
              </label>
              <input
                {...register('courseCode')}
                placeholder="e.g. SE-401"
                disabled={isEdit}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:text-slate-500"
              />
              {errors.courseCode && <p className="text-xs text-red-500 mt-1">{errors.courseCode.message}</p>}
            </div>

            <div className="flex flex-col justify-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('published')}
                  className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Publish Immediately
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Course Description
            </label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Describe the syllabus, prerequisites, and learning objectives..."
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
            {isEdit ? 'Save Course Changes' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
}
