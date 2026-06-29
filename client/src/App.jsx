import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';

// Pages
import Lookup from './pages/Lookup';
import ReviewSubmission from './pages/ReviewSubmission';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DepartmentAnalytics from './pages/DepartmentAnalytics';
import DoctorAnalytics from './pages/DoctorAnalytics';
import AiAnalytics from './pages/AiAnalytics';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import Patients from './pages/Patients';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-hospital-200 border-t-hospital-600"></div>
  </div>
);

// Protected Admin Route wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Patient Stay Routes */}
          <Route path="/" element={<ReviewSubmission />} />
          
          {/* Public Admin authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Administrative routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/patients" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin']}>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/departments" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin']}>
                <DepartmentAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/doctors" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin']}>
                <DoctorAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/ai" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin']}>
                <AiAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/notifications" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin']}>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'HospitalAdmin']}>
                <AuditLogs />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
