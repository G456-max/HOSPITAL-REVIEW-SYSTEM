import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UserRound, Star, Award, ShieldAlert, Heart, Activity 
} from 'lucide-react';

const DoctorAnalytics = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    try {
      const data = await api.get('/dashboard/doctors');
      setDoctors(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctor satisfaction index data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Doctor Performance Analytics</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review satisfaction ratings and sentiment breakdown for all inpatient consultants.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          Compiling doctor records...
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          No feedback data registered for doctors yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => {
            const isHighPerformer = doc.averageRating >= 4.2;
            const isCriticalPerformer = doc.averageRating < 3.0;

            return (
              <div 
                key={`${doc.doctorName}-${doc.department}`}
                className={`
                  rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-900/60 transition-all duration-300 relative overflow-hidden
                  ${isHighPerformer ? 'border-emerald-100 dark:border-emerald-950/30 shadow-emerald-500/[0.02]' : 'border-gray-200/60 dark:border-slate-800/60'}
                  ${isCriticalPerformer ? 'border-red-200 dark:border-red-900/30 ring-1 ring-red-100/30 dark:ring-red-900/10' : ''}
                `}
              >
                {/* Visual badge top right corner */}
                {isHighPerformer && (
                  <div className="absolute top-0 right-0 rounded-bl-2xl bg-emerald-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-l border-b border-emerald-100 dark:border-emerald-900/25 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    <span>Top Rated</span>
                  </div>
                )}
                {isCriticalPerformer && (
                  <div className="absolute top-0 right-0 rounded-bl-2xl bg-red-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-red-500 dark:bg-red-950/60 dark:text-red-400 border-l border-b border-red-100 dark:border-red-900/25 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    <span>Needs Attention</span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-2xl
                    ${isHighPerformer && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}
                    ${isCriticalPerformer && 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'}
                    ${!isHighPerformer && !isCriticalPerformer && 'bg-hospital-50 text-hospital-700 dark:bg-hospital-950/80 dark:text-hospital-300'}
                  `}>
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">
                      {doc.doctorName}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {doc.department}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-50 pt-5 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Average Rating</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-base font-extrabold ${isCriticalPerformer ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {doc.averageRating}
                      </span>
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Feedback stays</span>
                    <p className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                      {doc.totalReviews}
                    </p>
                  </div>
                </div>

                {/* Sentiment Distribution progress line */}
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                    <span>Positive: {doc.positivePercent}%</span>
                    <span>Negative: {doc.negativePercent}%</span>
                  </div>
                  <div className="flex h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${doc.positivePercent}%` }} 
                    />
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${doc.negativePercent}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAnalytics;
