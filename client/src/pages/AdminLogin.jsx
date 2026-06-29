import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, Activity, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(username.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-hospital-50 via-slate-50 to-hospital-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-hospital-300/20 blur-3xl dark:bg-hospital-800/10"></div>
      <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-800/5"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl shadow-hospital-950/10 border border-white/50 dark:border-slate-800/60 dark:bg-slate-900/40 relative z-10 animate-fade-in">
        
        {/* Logo and Headings */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hospital-600 text-white shadow-xl shadow-hospital-600/30">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Administrative Console
          </h1>
          <p className="mt-2 text-sm font-semibold text-hospital-600 dark:text-hospital-400">
            Visakha Steel General Hospital
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Authorized admin & medical staff access only
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-hospital-500 focus:bg-white focus:ring-4 focus:ring-hospital-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-hospital-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-hospital-500 focus:bg-white focus:ring-4 focus:ring-hospital-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-hospital-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-hospital-600 py-4 text-sm font-bold text-white shadow-lg hover:bg-hospital-700 active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
          >
            {submitting ? 'Authenticating Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-slate-800 text-center">
          <Link to="/" className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 dark:text-hospital-400 dark:hover:text-hospital-300">
            Go back to Patient Survey Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

// Simple link helper to avoid dependency issues if React Router Link isn't fully set up in import
const Link = ({ to, children, className }) => {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState({}, '', to);
        const popStateEvent = new PopStateEvent('popstate');
        window.dispatchEvent(popStateEvent);
      }}
      className={className}
    >
      {children}
    </a>
  );
};

export default AdminLogin;
