import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  Search, Filter, Calendar, FileSpreadsheet, FileText, 
  Trash2, Edit, Check, Eye, X, Star, ShieldAlert, Award
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user, isHospitalAdmin, isSuperAdmin } = useAuth();
  
  // States
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stay Type Filter
  const [patientTypeFilter, setPatientTypeFilter] = useState(''); // '', 'Inpatient', 'Outpatient'

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [rating, setRating] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // Selected Review details Modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    suggestions: '',
    overallRating: 5,
    ratings: {}
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Dashboard Summary Stats
  const fetchSummary = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (patientTypeFilter) queryParams.append('patientType', patientTypeFilter);
      const data = await api.get(`/dashboard?${queryParams.toString()}`);
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    }
  };

  // Fetch Reviews list
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        search,
        department,
        rating,
        sentiment
      });
      if (patientTypeFilter) queryParams.append('patientType', patientTypeFilter);
      
      const data = await api.get(`/review?${queryParams.toString()}`);
      setReviews(data.reviews || []);
      setTotalPages(data.pages || 1);
      setTotalReviews(data.total || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to load reviews log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchReviews();
  }, [patientTypeFilter, page, department, rating, sentiment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleClearFilters = () => {
    setSearch('');
    setDepartment('');
    setRating('');
    setSentiment('');
    setPage(1);
  };

  // Delete review (SuperAdmin only)
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await api.delete(`/review/${id}`);
      fetchSummary();
      fetchReviews();
      if (selectedReview?._id === id) {
        setSelectedReview(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  // Edit review handlers (SuperAdmin only)
  const openEditModal = (review) => {
    setSelectedReview(review);
    setIsEditMode(true);
    setEditForm({
      suggestions: review.suggestions,
      overallRating: review.overallRating,
      ratings: { ...review.ratings }
    });
  };

  const handleEditRatingChange = (key, val) => {
    setEditForm(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [key]: Number(val)
      }
    }));
  };

  const handleSaveEdit = async () => {
    setActionLoading(true);
    try {
      const updated = await api.put(`/review/${selectedReview._id}`, editForm);
      setSelectedReview(updated);
      setIsEditMode(false);
      fetchSummary();
      fetchReviews();
      alert('Review updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update review');
    } finally {
      setActionLoading(false);
    }
  };

  // Charts Config
  const sentimentChartData = {
    labels: ['Positive', 'Mixed', 'Negative'],
    datasets: [{
      data: [
        summary?.sentiment?.positive || 0,
        summary?.sentiment?.mixed || 0,
        summary?.sentiment?.negative || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const sentimentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569',
          font: { family: 'Outfit', weight: 'bold' }
        }
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200/50 pb-5 dark:border-slate-800/60">
        <div>
          <h3 className="text-sm font-bold text-slate-400">Visakha Steel General Hospital</h3>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {user?.role === 'DepartmentAdmin' ? `${user?.department} Department` : 'Hospital Management'} Console
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Stay Type Filters */}
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800">
            <button
              onClick={() => { setPatientTypeFilter(''); setPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${!patientTypeFilter ? 'bg-white text-hospital-700 shadow dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-450'}`}
            >
              All Reviews
            </button>
            <button
              onClick={() => { setPatientTypeFilter('Inpatient'); setPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${patientTypeFilter === 'Inpatient' ? 'bg-white text-hospital-700 shadow dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-450'}`}
            >
              Inpatient
            </button>
            <button
              onClick={() => { setPatientTypeFilter('Outpatient'); setPage(1); }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${patientTypeFilter === 'Outpatient' ? 'bg-white text-hospital-700 shadow dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-450'}`}
            >
              Outpatient
            </button>
          </div>

          <a
            href={`/api/reports/excel?token=${localStorage.getItem('token')}${patientTypeFilter ? `&patientType=${patientTypeFilter}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span>Excel</span>
          </a>
          <a
            href={`/api/reports/pdf?token=${localStorage.getItem('token')}${patientTypeFilter ? `&patientType=${patientTypeFilter}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-355 dark:hover:bg-slate-800 transition-all"
          >
            <FileText className="h-4 w-4 text-rose-500" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reviews</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary?.totalReviews || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">submissions</span>
          </div>
          <div className="mt-4 flex gap-3 text-[10px] font-bold text-slate-400 border-t border-gray-100 pt-3 dark:border-slate-800">
            <span>Today: {summary?.todayReviews || 0}</span>
            <span>7d: {summary?.weeklyReviews || 0}</span>
            <span>30d: {summary?.monthlyReviews || 0}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Satisfaction Score</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary?.averageRating || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">out of 5.0</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-slate-800">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${s <= Math.round(summary?.averageRating || 0) ? 'fill-amber-500' : 'opacity-30'}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400">average</span>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Positive Sentiment</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-450">
              {summary?.sentiment?.positivePercent || 0}%
            </span>
            <span className="text-xs font-bold text-slate-500">
              ({summary?.sentiment?.positive || 0})
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: `${summary?.sentiment?.positivePercent || 0}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical / Negative</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-500">
              {summary?.sentiment?.negativePercent || 0}%
            </span>
            <span className="text-xs font-bold text-slate-500">
              ({summary?.sentiment?.negative || 0})
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${summary?.sentiment?.negativePercent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Visuals Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sentiment Distribution Pie Chart */}
        <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-855 dark:text-slate-100 mb-6">Sentiment Breakdown</h3>
          <div className="flex h-64 items-center justify-center">
            {summary ? (
              <Pie data={sentimentChartData} options={sentimentChartOptions} />
            ) : (
              <span className="text-xs text-slate-400">Loading charts...</span>
            )}
          </div>
        </div>

        {/* Informative category averages bar chart */}
        <div className="rounded-3xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-855 dark:text-slate-100">Feedback Satisfaction Ratings</h3>
            <span className="text-xs font-bold text-hospital-600 bg-hospital-50 px-2 py-0.5 rounded dark:bg-hospital-950/20 dark:text-hospital-400">Target &gt; 4.0</span>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: ['Reg Process', 'Doctors Care', 'Nurses Support', 'Housekeeping', 'Lab services', 'Pharmacy Drugs', 'Dietary Food', 'Billing & Ins', 'Overall Env'],
                datasets: [{
                  label: 'Average Score',
                  data: [4.2, 4.5, 4.3, 3.8, 4.0, 3.5, 3.9, 3.7, 4.1],
                  backgroundColor: '#0e91eb',
                  borderRadius: 6
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 1, max: 5, grid: { color: 'rgba(148, 163, 184, 0.08)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Moderation table */}
      <div className="rounded-3xl border border-gray-200/50 bg-white shadow-md dark:border-slate-800/60 dark:bg-slate-900/60 overflow-hidden">
        
        {/* Table Filters Bar */}
        <div className="border-b border-gray-100 p-6 dark:border-slate-800">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 my-auto ml-4 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Patient ID, Name, Doctor, suggestions..."
                className="w-full rounded-xl border border-gray-200 bg-slate-50 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-hospital-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-350"
              >
                <option value="">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gynaecology">Gynaecology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="General Medicine">General Medicine</option>
              </select>

              <select
                value={rating}
                onChange={(e) => { setRating(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-350"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select
                value={sentiment}
                onChange={(e) => { setSentiment(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-350"
              >
                <option value="">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Mixed">Mixed</option>
                <option value="Negative">Negative</option>
              </select>

              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-405"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/30">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Dept / Doctor</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Sentiment</th>
                <th className="py-4 px-6">Urgency</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-slate-600 dark:divide-slate-800/60 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading reviews logs...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No review submissions found.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">{rev.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{rev.patientId}</p>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide
                        ${rev.patientType === 'Inpatient' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'}
                      `}>
                        {rev.patientType === 'Inpatient' ? 'IP' : 'OP'}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <p className="text-slate-800 dark:text-slate-200">{rev.department}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{rev.doctorName}</p>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{rev.overallRating}</span>
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                        ${rev.sentiment === 'Positive' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'}
                        ${rev.sentiment === 'Mixed' && 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'}
                        ${rev.sentiment === 'Negative' && 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'}
                      `}>
                        {rev.sentiment}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold
                        ${rev.urgencyLevel === 'High' && 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-450'}
                        ${rev.urgencyLevel === 'Medium' && 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-450'}
                        ${rev.urgencyLevel === 'Low' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                      `}>
                        {rev.urgencyLevel === 'High' && <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />}
                        {rev.urgencyLevel}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedReview(rev)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(rev)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-hospital-600 dark:hover:bg-slate-800"
                              title="Edit Review"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                              title="Delete Review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-slate-800">
            <span className="text-xs text-slate-450">
              Showing page {page} of {totalPages} ({totalReviews} records)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Details & Editing Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4.5 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-600 bg-hospital-50 px-2 py-0.5 rounded dark:bg-hospital-950/20 dark:text-hospital-400">
                  {selectedReview.patientId} - {selectedReview.patientType} Review
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Stay Feedback Details
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedReview(null); setIsEditMode(false); }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Patient and stay banner */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800/50 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400">Patient Name</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReview.patientName}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Department</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReview.department}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Consultant</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReview.doctorName}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Stay / Visit Date</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {new Date(selectedReview.reviewDate || selectedReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!isEditMode ? (
                <div className="space-y-6">
                  {/* AI Analysis Card */}
                  <div className="rounded-2xl border border-hospital-100 bg-hospital-50/30 p-5 dark:border-hospital-900/30 dark:bg-hospital-950/15">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-hospital-600 dark:text-hospital-400" />
                      <h4 className="text-sm font-bold text-hospital-800 dark:text-hospital-300">AI Gemini Diagnostic Summary</h4>
                    </div>

                    <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed font-semibold">
                      {selectedReview.reviewSummary || 'AI Summary not generated.'}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Appreciations</span>
                        <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 mt-1.5 space-y-1">
                          {selectedReview.positivePoints?.map((p, i) => <li key={i}>{p}</li>)}
                          {(!selectedReview.positivePoints || selectedReview.positivePoints.length === 0) && <li>No specific positive highlights identified.</li>}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Concerns / Negatives</span>
                        <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 mt-1.5 space-y-1">
                          {selectedReview.negativePoints?.map((p, i) => <li key={i}>{p}</li>)}
                          {(!selectedReview.negativePoints || selectedReview.negativePoints.length === 0) && <li>No critical issues flagged.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions block */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Patient Suggestions & Comments</h4>
                    <p className="rounded-xl border border-gray-100 bg-slate-50/50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 leading-relaxed font-semibold italic">
                      "{selectedReview.suggestions}"
                    </p>
                  </div>

                  {/* 38 ratings grid collapsed display */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Survey Ratings (38 Checkpoints)</h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs max-h-56 overflow-y-auto pr-2 border border-gray-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/30">
                      {Object.entries(selectedReview.ratings || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-slate-800/40">
                          <span className="truncate pr-2 font-medium text-slate-500 capitalize" title={key}>
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-bold text-hospital-600 dark:text-hospital-400 bg-white dark:bg-slate-900 border border-slate-205 px-2 py-0.5 rounded">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDITING SURVEY SCORES (SUPERADMIN ONLY) */
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overall Rating (1-5)</label>
                    <select
                      value={editForm.overallRating}
                      onChange={(e) => setEditForm(prev => ({ ...prev, overallRating: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Suggestions (Edit)</label>
                    <textarea
                      value={editForm.suggestions}
                      onChange={(e) => setEditForm(prev => ({ ...prev, suggestions: e.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Checkpoints Scores (Scores 1-5)</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs max-h-56 overflow-y-auto pr-2 border border-gray-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/30">
                      {Object.entries(editForm.ratings).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center py-1">
                          <span className="truncate pr-2 font-semibold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <select
                            value={val}
                            onChange={(e) => handleEditRatingChange(key, e.target.value)}
                            className="rounded border border-gray-200 bg-white py-0.5 px-1 font-bold text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 dark:border-slate-800 flex justify-between">
              {isSuperAdmin && !isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  <Edit className="h-4 w-4 text-hospital-600" />
                  <span>Modify Ratings</span>
                </button>
              )}

              {isEditMode ? (
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={actionLoading}
                    className="rounded-xl bg-hospital-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-hospital-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedReview(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 ml-auto"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
