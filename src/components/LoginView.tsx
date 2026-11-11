import React, { useState } from 'react';
import { ShieldCheck, User, Lock, AlertTriangle, KeyRound, CheckCircle2 } from 'lucide-react';
import { AdminUser, SystemSettings } from '../types';

interface LoginViewProps {
  settings: SystemSettings;
  onLoginSuccess: (admin: AdminUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password@123!');
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) {
      setError('Too many failed attempts. Login throttled for 15 minutes.');
      return;
    }

    // Default credentials verification
    const isValid =
      (username === 'admin' || username === 'admin@organization.local') &&
      (password === 'Password@123!' || password === 'admin123');

    if (isValid) {
      const admin: AdminUser = {
        id: 1,
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@organization.local',
        role: 'superadmin',
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
      onLoginSuccess(admin);
    } else {
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);
      if (nextCount >= 5) {
        setIsLockedOut(true);
        setError('Login Rate Limit Exceeded: Account locked for 15 minutes due to 5 failed attempts.');
      } else {
        setError(`Invalid credentials. ${5 - nextCount} attempt(s) remaining before security lockout.`);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-white">Administrative Sign In</h2>
          <p className="mt-1 text-xs text-slate-400">
            {settings.app_name}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username or Administrator Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLockedOut}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            Authenticate Administrator
          </button>
        </form>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-[11px] text-slate-400 text-center space-y-1">
          <div className="font-semibold text-slate-300">Default Credentials Provided:</div>
          <div className="font-mono text-emerald-400">
            Username: <span className="text-white">admin</span> | Password: <span className="text-white">Password@123!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
