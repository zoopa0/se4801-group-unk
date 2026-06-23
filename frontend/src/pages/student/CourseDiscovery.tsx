import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { useToastStore } from '@/store/toastStore';
import Pagination from '@/components/shared/Pagination';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import { Search, BookOpen, User, Loader2 } from 'lucide-react';

export default function CourseDiscovery() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const qc = useQueryClient();

  const { data: pagedCourses, isLoading } = useQuery({
    queryKey: ['courses', 'published', page],
    queryFn: () => courseService.listPublished(page, 12),
    enabled: !searchMode,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['courses', 'search', keyword],
    queryFn: () => courseService.search(keyword),
    enabled: searchMode && keyword.length > 1,
  });

  const enrollMut = useMutation({
    mutationFn: (courseId: number) => enrollmentService.enroll({ courseId }),
    onSuccess: () => { addToast('success', 'Enrolled successfully!'); qc.invalidateQueries({ queryKey: ['enrollments'] }); },
    onError: (err: any) => addToast('error', err?.response?.data?.message || 'Enrollment failed'),
  });

  const courses = searchMode ? searchResults || [] : pagedCourses?.content || [];

  const handleSearch = (val: string) => {
    setKeyword(val);
    setSearchMode(val.length > 1);
  };

  if (isLoading) return <LoadingSkeleton variant="card" count={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Discover Courses</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by title or code..." value={keyword} onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400" />
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState title="No courses found" description="Try adjusting your search or check back later." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="glass-card p-6 rounded-2xl hover-glow flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-brand-500/10 text-brand-500 text-xs font-bold rounded-md">{course.courseCode}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{course.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 flex-1">{course.description || 'No description'}</p>
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500"><User className="w-3.5 h-3.5" />{course.instructorName}</div>
              <button onClick={() => enrollMut.mutate(course.id)} disabled={enrollMut.isPending}
                className="mt-4 w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {enrollMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />} Enroll
              </button>
            </div>
          ))}
        </div>
      )}

      {!searchMode && pagedCourses && (
        <Pagination page={page} totalPages={pagedCourses.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
