import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'row' | 'page';
  count?: number;
}

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg', className)} />;
}

export default function LoadingSkeleton({ variant = 'card', count = 4 }: LoadingSkeletonProps) {
  if (variant === 'page') {
    return (
      <div className="space-y-6 animate-fade-in">
        <SkeletonPulse className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <SkeletonPulse className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonPulse key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} className="h-48 rounded-2xl" />
      ))}
    </div>
  );
}
