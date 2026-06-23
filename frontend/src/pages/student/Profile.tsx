import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useToastStore } from '@/store/toastStore';
import { getInitials } from '@/lib/utils';
import { User, Shield, Moon, Sun, Monitor } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleSavePreferences = () => {
    addToast('success', 'Preferences updated successfully');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
        Profile Settings
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {getInitials(user.fullName)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {user.fullName}
            </h3>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <span className="px-3 py-1 bg-brand-500/10 text-brand-500 text-xs font-bold rounded-full">
            {user.role}
          </span>
        </div>

        {/* Settings details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Form (Static Representation) */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" />
              Account Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user.fullName}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences & Appearance */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" />
              System Preferences
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch application style theme</p>
              </div>
              <button
                onClick={toggle}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Alerts</p>
                <p className="text-xs text-slate-500">Receive assignment reminder emails</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-500" />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
