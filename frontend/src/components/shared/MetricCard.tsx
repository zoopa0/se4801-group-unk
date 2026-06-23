import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'cyan' | 'emerald' | 'amber' | 'red';
  delta?: string;
}

const colorMap = {
  blue: 'from-brand-500/10 to-brand-400/5 text-brand-500 dark:text-brand-300',
  cyan: 'from-cyan-500/10 to-cyan-400/5 text-cyan-500 dark:text-cyan-300',
  emerald: 'from-emerald-500/10 to-emerald-400/5 text-emerald-500 dark:text-emerald-300',
  amber: 'from-amber-500/10 to-amber-400/5 text-amber-500 dark:text-amber-300',
  red: 'from-red-500/10 to-red-400/5 text-red-500 dark:text-red-300',
};

const iconBg = {
  blue: 'bg-brand-500/10 text-brand-500',
  cyan: 'bg-cyan-500/10 text-cyan-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  amber: 'bg-amber-500/10 text-amber-500',
  red: 'bg-red-500/10 text-red-500',
};

export default function MetricCard({ title, value, icon: Icon, color, delta }: MetricCardProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div ref={ref} className={cn(
      'glass-card p-6 hover-glow cursor-default',
      'bg-gradient-to-br', colorMap[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{display}</p>
          {delta && <p className="text-xs mt-1 text-emerald-500 font-medium">{delta}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
