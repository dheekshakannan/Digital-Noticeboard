import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, Eye, FileText, Trash2, Edit3, 
  Layers, BarChart2, CheckCircle2, XCircle, Search, AlertCircle 
} from 'lucide-react';

interface IDashboardStats {
  totalNotices: number;
  activeNotices: number;
  expiredNotices: number;
  totalViews: number;
  categoryStats: Record<string, number>;
  popularNotices: Array<{
    _id: string;
    title: string;
    category: string;
    views: number;
    createdAt: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // Fetch all stats & notices
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, noticesRes] = await Promise.all([
        api.get('/notices/stats/dashboard'),
        api.get('/notices?all=true')
      ]);

      if (statsRes.data.success && noticesRes.data.success) {
        setStats(statsRes.data.stats);
        setNotices(noticesRes.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to fetch notice board statistics. Check your server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Handle notice deletion
  const handleDeleteNotice = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the notice:\n"${title}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/notices/${id}`);
      if (response.data.success) {
        // Refresh local lists
        alert('Notice deleted successfully.');
        loadDashboardData();
      }
    } catch (err: any) {
      console.error('Error deleting notice:', err);
      alert('Failed to delete notice. Please try again.');
    }
  };

  // Protected route evaluation
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-400">Loading user session...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Filter notices matching search queries inside the table
  const filteredNotices = notices.filter(notice => 
    notice.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
    notice.category.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const getStatusBadge = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    
    if (expiry.getTime() < today.getTime()) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xxs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 border border-rose-200/50 dark:border-rose-900/30">
          <XCircle className="h-3 w-3" />
          <span>Expired</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xxs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-455 border border-emerald-200/50 dark:border-emerald-900/30">
        <CheckCircle2 className="h-3 w-3" />
        <span>Active</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
            Admin Management Console
          </h1>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Welcome back, <span className="text-brand-500 dark:text-brand-400 font-bold">{user.username}</span>. Post, update, and manage official bulletins.
          </p>
        </div>

        <Link
          to="/admin/create"
          className="flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/10 cursor-pointer hover:scale-102 active:scale-98 transition-transform"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Post New Notice</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 flex items-center space-x-3 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* 2. Statistical Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* Card: Total Notices */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Notices</span>
              <span className="block text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{stats.totalNotices}</span>
            </div>
            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 text-brand-500 dark:text-brand-455 rounded-xl">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          {/* Card: Active Notices */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Active Board</span>
              <span className="block text-2xl font-extrabold text-slate-800 dark:text-white mt-1 text-emerald-600 dark:text-emerald-400">{stats.activeNotices}</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-455 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Card: Expired Notices */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Expired Bulletins</span>
              <span className="block text-2xl font-extrabold text-slate-800 dark:text-white mt-1 text-rose-500">{stats.expiredNotices}</span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-xl">
              <XCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Card: Total Views */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-sm flex items-center justify-between">
            <div>
              <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Views</span>
              <span className="block text-2xl font-extrabold text-slate-800 dark:text-white mt-1 text-indigo-500">{stats.totalViews}</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-550 dark:text-indigo-400 rounded-xl">
              <Eye className="h-6 w-6" />
            </div>
          </div>

        </div>
      )}

      {/* 3. Analytics Chart Block & Popular items */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Custom CSS Bar Chart for Notice Volume per Category */}
          <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white">
              <BarChart2 className="h-5 w-5 text-brand-500" />
              <h3 className="text-sm font-bold tracking-wide uppercase">Notice Volume by Category</h3>
            </div>
            
            <div className="pt-2 space-y-3.5">
              {Object.entries(stats.categoryStats).map(([cat, count]) => {
                const percentage = stats.totalNotices > 0 ? (count / stats.totalNotices) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>{cat}</span>
                      <span className="text-slate-400">{count} {count === 1 ? 'notice' : 'notices'}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-850">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Notices Sidebar */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white">
              <Eye className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-bold tracking-wide uppercase">Most Visited Notices</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {stats.popularNotices.length > 0 ? (
                stats.popularNotices.map((pop) => (
                  <div key={pop._id} className="py-2.5 flex justify-between items-start first:pt-0 last:pb-0 gap-2">
                    <div className="truncate">
                      <Link 
                        to={`/notice/${pop._id}`} 
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors block truncate"
                      >
                        {pop.title}
                      </Link>
                      <span className="text-xxs text-slate-400">{pop.category}</span>
                    </div>
                    <span className="text-xxs font-bold text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-full shrink-0 flex items-center">
                      {pop.views} views
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  No view statistics collected yet.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 4. Table Management Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-md rounded-3xl overflow-hidden">
        
        {/* Table Search Header */}
        <div className="p-5 sm:px-6 border-b border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-white">
            <FileText className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase">All Board Bulletins</h3>
          </div>
          
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search table notices..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white interactive-transition"
            />
          </div>
        </div>

        {/* Notices Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Retrieving notice items...</p>
            </div>
          ) : filteredNotices.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-xxs font-extrabold text-slate-450 dark:text-slate-500 border-b border-slate-150 dark:border-slate-850 uppercase tracking-widest">
                  <th className="py-3 px-6">Notice Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredNotices.map((notice) => (
                  <tr key={notice._id} className="text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors">
                    
                    {/* Title */}
                    <td className="py-4 px-6 font-bold max-w-[280px] truncate">
                      <Link to={`/notice/${notice._id}`} className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors" title={notice.title}>
                        {notice.title}
                      </Link>
                      <span className="block text-xxs font-normal text-slate-400 mt-1">
                        Posted {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">
                      {notice.category}
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 font-semibold">
                      {notice.views}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(notice.expiryDate).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {getStatusBadge(notice.expiryDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2.5">
                      <Link
                        to={`/admin/edit/${notice._id}`}
                        className="inline-flex p-2 rounded-lg bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-950 dark:hover:bg-brand-600 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                        title="Edit Notice"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteNotice(notice._id, notice.title)}
                        className="inline-flex p-2 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-slate-950 dark:hover:bg-red-600 text-slate-500 dark:text-red-400 transition-colors cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400 font-medium">
              No notices on record. Create a new notice above!
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
