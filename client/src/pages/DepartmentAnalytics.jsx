import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Building2, AlertTriangle, CheckCircle, ChevronDown, 
  ChevronUp, Star, TrendingUp, Info
} from 'lucide-react';

const DepartmentAnalytics = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDept, setExpandedDept] = useState(null);

  const fetchDepartments = async () => {
    try {
      const data = await api.get('/dashboard/departments');
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch department aggregation stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const toggleExpand = (deptName) => {
    if (expandedDept === deptName) {
      setExpandedDept(null);
    } else {
      setExpandedDept(deptName);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Departmental Analytics</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Detailed metrics and warnings for all service areas of Visakha Steel General Hospital.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          Aggregating department logs...
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          No feedback data registered for departments yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {departments.map((dept) => {
            const isExpanded = expandedDept === dept.departmentName;
            return (
              <div 
                key={dept.departmentName}
                className={`
                  rounded-3xl border bg-white shadow-sm dark:bg-slate-900/60 transition-all duration-300
                  ${dept.activeWarning 
                    ? 'border-red-200 dark:border-red-900/30 ring-1 ring-red-100 dark:ring-red-900/10' 
                    : 'border-gray-200/60 dark:border-slate-800/60'
                  }
                `}
              >
                {/* Department Main Row */}
                <div 
                  onClick={() => toggleExpand(dept.departmentName)}
                  className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-50/30 dark:hover:bg-slate-900/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm
                      ${dept.activeWarning 
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                        : 'bg-hospital-50 text-hospital-700 dark:bg-hospital-950/80 dark:text-hospital-300'
                      }
                    `}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {dept.departmentName}
                        </h2>
                        {dept.activeWarning && (
                          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200/30">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Warning Alert</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                        {dept.totalReviews} total inpatient reviews
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Average Stars */}
                    <div className="text-center sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Satisfaction</p>
                      <div className="mt-1 flex items-center justify-end gap-1.5">
                        <span className={`text-base font-extrabold ${dept.averageRating < 3 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                          {dept.averageRating}
                        </span>
                        <Star className={`h-4 w-4 fill-amber-500 text-amber-500`} />
                      </div>
                    </div>

                    {/* Sentiment Progress Bar */}
                    <div className="w-36 text-xs font-semibold">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>Pos: {dept.positivePercent}%</span>
                        <span>Neg: {dept.negativePercent}%</span>
                      </div>
                      <div className="flex h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${dept.positivePercent}%` }} 
                        />
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${dept.negativePercent}%` }} 
                        />
                      </div>
                    </div>

                    {/* Expand Trigger Button */}
                    <button className="rounded-xl border border-gray-100 bg-white p-2.5 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Checkpoint Details Grid */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-slate-50/20 p-6 dark:border-slate-800/80 dark:bg-slate-900/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      <Info className="h-4 w-4" />
                      <span>Ratings Breakdown by Service Area</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(dept.categoryAverages || {}).map(([key, val]) => (
                        <div 
                          key={key} 
                          className="rounded-2xl border border-gray-200/50 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-950/20"
                        >
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                            {key} Services
                          </span>
                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-base font-extrabold text-slate-900 dark:text-white">
                              <span>{val}</span>
                              <span className="text-[11px] font-normal text-slate-400">/5.0</span>
                            </div>
                            <span className={`
                              rounded px-1.5 py-0.5 text-[10px] font-bold
                              ${val >= 4.0 && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'}
                              ${val >= 3.0 && val < 4.0 && 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'}
                              ${val < 3.0 && 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'}
                            `}>
                              {val >= 4.0 ? 'High' : val >= 3.0 ? 'Medium' : 'Needs Intervention'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentAnalytics;
