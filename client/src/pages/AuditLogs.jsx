import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  History, Search, Clock, User, FileText, RefreshCw 
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get('/auth/audit-logs');
      setLogs(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.performedBy?.toLowerCase().includes(term) ||
      log.details?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Audit Logs</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Security audit logs tracking administrator actions, feedback entries, and resolution states.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
          {error}
        </div>
      )}

      {/* Search Filter bar */}
      <div className="relative max-w-md">
        <Search className="absolute inset-y-0 left-0 my-auto ml-4 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by action, username, or details..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-xs font-semibold text-slate-850 placeholder-slate-400 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-gray-200/50 bg-white shadow-md dark:border-slate-800/60 dark:bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/30">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Action / Event</th>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-slate-600 dark:divide-slate-800/60 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">Loading audit trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">No matching activities found in audit log.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="py-4 px-6 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{new Date(log.timestamp || log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`
                        inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                        ${log.action === 'Admin Login' && 'bg-hospital-50 text-hospital-700 dark:bg-hospital-950/20 dark:text-hospital-450'}
                        ${log.action === 'Submit Feedback' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'}
                        ${log.action === 'Resolve Warning Alert' && 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-450'}
                        ${log.action === 'Delete Review' && 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-450'}
                        ${log.action === 'Edit Review' && 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'}
                      `}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-900 dark:text-slate-200">
                      <div className="flex items-center gap-1.5 font-bold">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{log.performedBy}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 max-w-sm break-words leading-relaxed font-semibold">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
