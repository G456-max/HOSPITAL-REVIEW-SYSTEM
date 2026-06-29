import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  UserRound,
  Brain,
  Bell,
  History,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  HeartPulse,
  Users
} from 'lucide-react';
import api from '../services/api';

const Layout = ({ children }) => {
  const { user, logout, isHospitalAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [alertCount, setAlertCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Dark Mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch unresolved notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await api.get('/review/alerts/all');
        const unresolved = notifications.filter(n => !n.resolved);
        setAlertCount(unresolved.length);
      } catch (err) {
        console.error('Failed to load notifications count:', err);
      }
    };
    
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin'] },
    { name: 'Patients', path: '/admin/patients', icon: Users, roles: ['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin'] },
    { name: 'Departments', path: '/admin/departments', icon: Building2, roles: ['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin'] },
    { name: 'Doctors', path: '/admin/doctors', icon: UserRound, roles: ['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin'] },
    { name: 'AI Insights', path: '/admin/ai', icon: Brain, roles: ['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin'] },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: alertCount, roles: ['SuperAdmin', 'HospitalAdmin', 'DepartmentAdmin'] },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History, roles: ['SuperAdmin', 'HospitalAdmin'] }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col
        border-r border-gray-200/50 bg-white/80 dark:border-slate-800/50 dark:bg-slate-900/80 backdrop-blur-md
        transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6 dark:border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hospital-600 text-white shadow-md shadow-hospital-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-950 dark:text-white">
                Visakha Steel
              </h1>
              <p className="text-xs font-medium text-hospital-600">General Hospital</p>
            </div>
          </Link>
          <button 
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-hospital-600 text-white shadow-lg shadow-hospital-600/15' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    rounded-full px-2 py-0.5 text-xs font-bold
                    ${isActive ? 'bg-white text-hospital-700' : 'bg-red-500 text-white animate-pulse'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hospital-100 text-hospital-700 dark:bg-hospital-950/80 dark:text-hospital-300 font-bold">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.username}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user?.role === 'DepartmentAdmin' ? `${user?.department} Admin` : user?.role}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200/50 bg-white/70 px-6 dark:border-slate-800/50 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="hidden text-xl font-bold tracking-tight text-slate-800 dark:text-white sm:block">
              {location.pathname === '/admin/dashboard' && 'Dashboard Overview'}
              {location.pathname === '/admin/patients' && 'Patient Stay Registry'}
              {location.pathname === '/admin/departments' && 'Department Analytics'}
              {location.pathname === '/admin/doctors' && 'Doctor Performance'}
              {location.pathname === '/admin/ai' && 'AI Feedback Insights'}
              {location.pathname === '/admin/notifications' && 'Satisfaction Alerts & Warnings'}
              {location.pathname === '/admin/audit-logs' && 'System Audit Logs'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
