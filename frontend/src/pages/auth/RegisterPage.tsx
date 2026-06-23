import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import { useToastStore } from '@/store/toastStore';
import { GraduationCap, User, Mail, Lock, Loader2, GraduationCap as StudentIcon, BookOpen } from 'lucide-react';
import type { Role } from '@/types/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Full name required').max(100),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['STUDENT', 'INSTRUCTOR'] as const),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'STUDENT' } });
  const selectedRole = watch('role');
  const password = watch('password') || '';

  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 4 ? 1 : 0;
  const strengthColors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.register({ email: data.email, password: data.password, fullName: data.fullName, role: data.role });
      addToast('success', 'Account created! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-surface-light via-white to-brand-50 dark:from-surface-dark dark:via-slate-900 dark:to-brand-900/20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="glass-card p-8 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-6"><GraduationCap className="w-8 h-8 text-brand-500" /><span className="font-heading font-bold text-xl text-gradient">EduFlow</span></div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join the academic community</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[{ role: 'STUDENT' as Role, icon: StudentIcon, label: 'Student' }, { role: 'INSTRUCTOR' as Role, icon: BookOpen, label: 'Instructor' }].map(({ role, icon: Icon, label }) => (
              <button key={role} type="button" onClick={() => setValue('role', role as any)}
                className={cn('p-4 rounded-xl border-2 text-center transition-all', selectedRole === role ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300')}>
                <Icon className={cn('w-6 h-6 mx-auto mb-1', selectedRole === role ? 'text-brand-500' : 'text-slate-400')} />
                <span className={cn('text-sm font-semibold', selectedRole === role ? 'text-brand-500' : 'text-slate-600 dark:text-slate-400')}>{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input {...register('fullName')} placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all" /></div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input {...register('email')} type="email" placeholder="you@university.edu" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all" /></div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input {...register('password')} type="password" placeholder="Min 8 characters" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all" /></div>
              {password.length > 0 && <div className="flex gap-1 mt-2">{[0,1,2].map(i => <div key={i} className={cn('h-1 flex-1 rounded-full', i < strength ? strengthColors[strength] : 'bg-slate-200 dark:bg-slate-700')} />)}</div>}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:outline-none transition-all" /></div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg mt-2">{loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Account'}</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">Already have an account? <Link to="/login" className="text-brand-500 font-semibold hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
