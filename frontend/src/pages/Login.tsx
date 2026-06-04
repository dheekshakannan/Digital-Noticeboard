import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert, User, Lock, Loader2, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect straight to dashboard
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please fulfill all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(usernameOrEmail, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-brand-500 mb-6 group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        <span>Return to Board</span>
      </button>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Subtle background decoration */}
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-brand-500/5 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-indigo-500/5 blur-xl"></div>

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400 mb-3 hover:scale-105 transition-transform">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Administrator Gateway
          </h2>
          <p className="mt-1.5 text-xxs text-slate-450 dark:text-slate-500 font-semibold tracking-wider uppercase">
            Digital Notice Board
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3.5 rounded-xl border border-red-200/50 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 text-red-700 dark:text-red-400 flex items-center space-x-2.5">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="text-xs font-semibold leading-normal">{error}</p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. admin or admin@noticeboard.edu"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white interactive-transition"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white interactive-transition"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 mt-4 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-brand-500/10 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Unlock Dashboard</span>
            )}
          </button>

        </form>

        {/* Seed helper tooltip for local students learning development */}
        <div className="text-center pt-2.5 border-t border-slate-100 dark:border-slate-850">
          <p className="text-xxs text-slate-400 dark:text-slate-550 leading-relaxed font-semibold">
            DEVELOPMENT NOTE: Default Admin credentials seeded at bootup:
            <br />
            <span className="text-brand-500 dark:text-brand-400">admin / admin123</span>
          </p>
        </div>

      </div>

    </div>
  );
};
