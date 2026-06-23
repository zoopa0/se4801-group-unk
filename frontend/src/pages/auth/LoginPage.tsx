import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const tokenRes = await authService.login(data);
      const payload = JSON.parse(atob(tokenRes.token.split('.')[1]));
      const user = { id: 0, email: payload.sub, fullName: payload.sub.split('@')[0], role: payload.role as any, active: true, createdAt: new Date().toISOString() };
      login(tokenRes.token, user);
      addToast('success', 'Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid credentials';
      setError('password', { message: msg });
      addToast('error', msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-cyan relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" /><div className="absolute bottom-20 right-20 w-48 h-48 bg-accent-cyan rounded-full blur-3xl" /></div>
        <div className="relative z-10 text-center px-12">
          <GraduationCap className="w-20 h-20 text-white/90 mx-auto mb-6" />
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Welcome to EduFlow</h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">"Education is the most powerful weapon which you can use to change the world."</p>
          <p className="text-white/50 text-sm mt-4">— Nelson Mandela</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-light dark:bg-surface-dark">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8"><GraduationCap className="w-8 h-8 text-brand-500" /><span className="font-heading font-bold text-xl text-gradient">EduFlow</span></div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Sign in to your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your credentials to continue</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input {...register('email')} type="email" placeholder="you@university.edu" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" /></div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg">{loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign In'}</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">Don't have an account? <Link to="/register" className="text-brand-500 font-semibold hover:underline">Create one</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
