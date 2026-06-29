import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Smartphone, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Lookup = () => {
  const [patientId, setPatientId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!patientId.trim() || !mobileNumber.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/patient/verify', {
        patientId: patientId.trim(),
        mobileNumber: mobileNumber.trim()
      });
      
      // Save patient session to localStorage for validation on submission page
      localStorage.setItem('patientSession', JSON.stringify(response.patient));
      navigate('/review/submit');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Verification failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-hospital-50 via-slate-50 to-hospital-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-hospital-400/20 blur-3xl dark:bg-hospital-600/10"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-600/5"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl shadow-hospital-950/10 border border-white/50 dark:border-slate-800/60 dark:bg-slate-900/40 relative z-10">
        
        {/* Hospital Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hospital-600 text-white shadow-xl shadow-hospital-600/30">
            <Activity className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Visakha Steel General Hospital
          </h1>
          <p className="mt-2 text-sm font-semibold text-hospital-600 dark:text-hospital-400">
            In-Patient Feedback System
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Only discharged patients can submit their reviews
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Patient ID (Medical Registration No.)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. P102"
                className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-hospital-500 focus:bg-white focus:ring-4 focus:ring-hospital-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-hospital-400 dark:focus:ring-hospital-400/10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Registered Mobile Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-hospital-500 focus:bg-white focus:ring-4 focus:ring-hospital-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-hospital-400 dark:focus:ring-hospital-400/10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-hospital-600 py-4 text-sm font-bold text-white shadow-lg shadow-hospital-600/25 hover:bg-hospital-700 hover:shadow-hospital-700/35 active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Verifying Admission Status...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-slate-800 text-center">
          <Link to="/admin/login" className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 dark:text-hospital-400 dark:hover:text-hospital-300">
            Administrative Login
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

export default Lookup;
