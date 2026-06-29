import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Brain, AlertTriangle, ShieldAlert, Sparkles, Lightbulb, 
  ChevronRight, Calendar, ArrowRight, MessageCircle 
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AiAnalytics = () => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAiAnalytics = async () => {
    try {
      const data = await api.get('/dashboard/analytics');
      setAiData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiAnalytics();
  }, []);

  // Trends Line Chart Config
  const trendLabels = aiData?.monthlyTrends?.map(t => t.label) || [];
  const trendRatingData = aiData?.monthlyTrends?.map(t => t.avgRating) || [];
  const trendCountData = aiData?.monthlyTrends?.map(t => t.count) || [];

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Average In-Patient Rating',
        data: trendRatingData,
        borderColor: '#0e91eb',
        backgroundColor: 'rgba(14, 145, 235, 0.1)',
        fill: true,
        tension: 0.3,
        yAxisID: 'y'
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569',
          font: { family: 'Outfit', weight: 'bold' }
        }
      }
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="rounded-3xl border border-hospital-100 bg-gradient-to-r from-hospital-500 to-hospital-600 p-6 md:p-8 text-white shadow-lg shadow-hospital-600/15 relative overflow-hidden dark:border-none">
        {/* Abstract design elements */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>
        <div className="absolute bottom-0 right-10 h-28 w-28 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Operations Board</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
              Google Gemini Clinical Diagnostics
            </h1>
            <p className="text-white/80 text-xs font-medium mt-1 leading-relaxed">
              Real-time sentiment index, positiveness indicators, and critical department warnings analyzed by Gemini AI to automate corrective actions.
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md">
            <Brain className="h-10 w-10 animate-pulse" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          Analyzing inpatient data with AI...
        </div>
      ) : !aiData ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
          No feedback data registered for AI analysis yet.
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top Row: Urgency Levels and Trends */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Urgency Level Widget */}
            <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">Patient Stay Urgency Indexes</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3 dark:border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">High Urgency Actions</span>
                  </div>
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    {aiData.urgency?.high || 0} reviews
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-50 pb-3 dark:border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Medium Attention</span>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    {aiData.urgency?.medium || 0} reviews
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Low Urgency (Routine)</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {aiData.urgency?.low || 0} reviews
                  </span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800/60 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  High Urgency reviews represent cases where overall rating is &le; 2.0 or AI detected critical patient service complaints.
                </p>
              </div>
            </div>

            {/* Trends Line Chart */}
            <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">Monthly Satisfaction Rating Trends</h3>
              <div className="h-60">
                {trendLabels.length > 0 ? (
                  <Line data={trendChartData} options={trendChartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No monthly trends data available.</div>
                )}
              </div>
            </div>
          </div>

          {/* Second Row: Top Issues & Top Actionable Suggestions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Top 5 Issues */}
            <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Service Areas flagged by Patients</h3>
              </div>

              <div className="space-y-4">
                {aiData.topIssues?.map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-[11px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{issue.issue}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {issue.count} complaints
                    </span>
                  </div>
                ))}
                {(!aiData.topIssues || aiData.topIssues.length === 0) && (
                  <p className="text-center py-6 text-xs text-slate-400">No specific issues flagged yet.</p>
                )}
              </div>
            </div>

            {/* Actionable AI Suggestions */}
            <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Recommended Action Plans</h3>
              </div>

              <div className="space-y-4">
                {aiData.topSuggestions?.map((sug, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0 dark:border-slate-800/40">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-50 text-[10px] font-bold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                        {sug.suggestion}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        Detected in {sug.count} surveys
                      </p>
                    </div>
                  </div>
                ))}
                {(!aiData.topSuggestions || aiData.topSuggestions.length === 0) && (
                  <p className="text-center py-6 text-xs text-slate-400">No suggestions recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Third Row: Verbatim Patient Insights generated by AI */}
          <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="h-5 w-5 text-hospital-600 dark:text-hospital-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Critical Patient Stay Insights Summary</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiData.recentInsights?.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/30 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed italic"
                >
                  "{insight}"
                </div>
              ))}
              {(!aiData.recentInsights || aiData.recentInsights.length === 0) && (
                <p className="col-span-full text-center py-6 text-xs text-slate-400">No recent insights collected.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AiAnalytics;
