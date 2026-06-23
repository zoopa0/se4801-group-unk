import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  GraduationCap, BookOpen, ClipboardCheck, BarChart3,
  Shield, Users, Layout, ArrowRight, Github, Twitter, Mail,
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Course Management', desc: 'Create, publish, and manage courses with ease.' },
  { icon: ClipboardCheck, title: 'Assignment Tracking', desc: 'Track deadlines, submissions, and progress.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor student engagement and performance.' },
  { icon: Shield, title: 'Secure Authentication', desc: 'JWT-based auth with role-based access control.' },
  { icon: Layout, title: 'Instructor Dashboard', desc: 'Comprehensive tools for course instructors.' },
  { icon: Users, title: 'Student Portal', desc: 'Productivity-focused student experience.' },
];

const stats = [
  { label: 'Active Students', value: 2500 },
  { label: 'Courses', value: 180 },
  { label: 'Assignments Submitted', value: 12400 },
  { label: 'Instructors', value: 85 },
];

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - progress, 3)) * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, value]);

  return <div ref={ref}>{display.toLocaleString()}+</div>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-brand-500" />
            <span className="font-heading font-bold text-xl text-gradient">EduFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-brand-500 transition-colors">Features</a>
            <a href="#stats" className="hover:text-brand-500 transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors">Login</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-md">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-accent-cyan/5" />
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-500 text-sm font-semibold rounded-full mb-6">
                Enterprise Platform
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-slate-900 dark:text-white leading-tight">
                Enterprise Student{' '}
                <span className="text-gradient">Productivity</span>{' '}
                Platform
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Streamline course management, track assignments, and boost academic productivity with EduFlow — built for modern universities.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/register" className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 shadow-lg hover:shadow-xl transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Explore Courses
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative">
                <div className="glass-card p-8 rounded-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Assignment submitted on time</span>
                      <span className="ml-auto text-xs text-emerald-500 font-bold">+95</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">New course enrolled: SE-401</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Productivity score: 92%</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-brand-500 to-accent-cyan rounded-2xl opacity-20 blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent-emerald to-accent-cyan rounded-xl opacity-20 blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white/50 dark:bg-slate-800/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Everything You Need</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">
              A comprehensive suite of tools designed for modern academic institutions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="gradient-border p-6 hover-glow cursor-default bg-white dark:bg-slate-800 rounded-2xl">
                <div className="p-3 bg-brand-500/10 rounded-xl w-fit mb-4">
                  <f.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-heading font-bold text-gradient">
                  <AnimatedCounter value={s.value} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700/50 py-12 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-500" />
            <span className="font-heading font-bold text-gradient">EduFlow</span>
            <span className="text-sm text-slate-400 ml-2">© 2026 Addis Ababa University</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-brand-500 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-500 transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
