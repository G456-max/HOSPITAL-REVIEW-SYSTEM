import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, AlertTriangle, CheckCircle, Clock, Check, User 
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('unresolved'); // 'all', 'unresolved', 'resolved'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get('/review/alerts/all');
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/review/alerts/${id}/resolve`);
      // Refresh list
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Failed to resolve notification alert.');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unresolved') return !n.resolved;
    if (filter === 'resolved') return n.resolved;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Satisfaction Alerts</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            System warnings triggered when a department's overall rating index falls below 3.0 stars.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60 w-fit">
          <button
            onClick={() => setFilter('unresolved')}
            className={`
              rounded-lg px-4 py-1.5 text-xs font-bold transition-all
              ${filter === 'unresolved' 
                ? 'bg-white text-hospital-700 shadow dark:bg-slate-800 dark:text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }
            `}
          >
            Active Warnings
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`
              rounded-lg px-4 py-1.5 text-xs font-bold transition-all
              ${filter === 'resolved' 
                ? 'bg-white text-hospital-700 shadow dark:bg-slate-800 dark:text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }
            `}
          >
            Resolved Warnings
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`
              rounded-lg px-4 py-1.5 text-xs font-bold transition-all
              ${filter === 'all' 
                ? 'bg-white text-hospital-700 shadow dark:bg-slate-800 dark:text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }
            `}
          >
            All Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          Loading alerts list...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-3xl border border-gray-200/50 bg-white p-12 text-center dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No warnings logged</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All departments are performing above the satisfaction index of 3.0 stars!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotifications.map((alert) => (
            <div 
              key={alert._id}
              className={`
                rounded-3xl border p-6 bg-white dark:bg-slate-900/60 transition-all duration-200 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between
                ${alert.resolved 
                  ? 'border-gray-200/60 dark:border-slate-800/60 opacity-70' 
                  : 'border-red-200 dark:border-red-900/30 shadow-sm shadow-red-500/[0.01]'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5
                  ${alert.resolved 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                    : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                  }
                `}>
                  {alert.resolved ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {alert.department} Department Warning
                    </h3>
                    <span className={`
                      rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider
                      ${alert.resolved 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      }
                    `}>
                      {alert.resolved ? 'Resolved' : 'Active Warning'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {alert.message}
                  </p>
                  
                  {/* Alert Date logs */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Triggered: {new Date(alert.createdAt).toLocaleString()}</span>
                    </span>
                    {alert.resolved && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Dismissed by: {alert.resolvedBy} on {new Date(alert.resolvedAt).toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!alert.resolved && (
                <button
                  onClick={() => handleResolve(alert._id)}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Resolve & Dismiss</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
