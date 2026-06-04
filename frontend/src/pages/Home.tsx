import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { NoticeCard } from '../components/NoticeCard';
import type { INotice } from '../components/NoticeCard';
import { Search, Sparkles, Filter, Megaphone, RotateCcw, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  'Academic',
  'Examination',
  'Placement',
  'Events',
  'Sports',
  'Circulars',
  'General Announcements'
];

export const Home: React.FC = () => {
  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [smart, setSmart] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(0);

  // Fetch notices from Express API
  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      setError('');
      try {
        const params: any = {};
        if (category) params.category = category;
        if (search.trim()) params.search = search.trim();
        if (smart) params.smart = true;

        const response = await api.get('/notices', { params });
        if (response.data.success) {
          setNotices(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching notices:', err);
        setError('Unable to load notices. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [category, smart, triggerSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerSearch(prev => prev + 1);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setSmart(false);
    setTriggerSearch(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* 1. Hero / Header Banner */}
      <div className="text-center py-10 px-4 sm:px-6 mb-8 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-700 dark:from-brand-950 dark:to-indigo-900/60 text-white shadow-xl shadow-brand-500/10 relative overflow-hidden">
        
        {/* Subtle background graphics */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-500/30 blur-2xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
            <Megaphone className="h-4 w-4 text-amber-300" />
            <span>Campus Digital Bulletin</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Digital Notice Board
          </h1>
          
          <p className="mt-3.5 text-sm sm:text-base text-indigo-100 font-light leading-relaxed">
            Stay updated with official academic circulars, exam rosters, placement drives, sports notifications, and events in real-time.
          </p>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Panel */}
      <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={smart ? "Ask AI, e.g., 'placement drives for final years'..." : "Search notices by keywords..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white interactive-transition"
              />
            </div>

            {/* Smart Search & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Gemini Smart Search Toggle */}
              <button
                type="button"
                onClick={() => setSmart(!smart)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold border interactive-transition ${
                  smart 
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-900/60 shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
                title="Use Gemini AI semantic mapping to parse notice meanings instead of matching letters"
              >
                <Sparkles className={`h-4 w-4 ${smart ? 'text-amber-500 animate-spin-slow' : 'text-slate-400'}`} />
                <span>Smart AI Search</span>
              </button>

              <button
                type="submit"
                className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 hover:scale-102 active:scale-98 transition-all duration-200 shadow-md shadow-brand-500/10 cursor-pointer"
              >
                Search
              </button>

              {(search || category || smart) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-805 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 interactive-transition"
                  title="Clear all filters"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                </button>
              )}

            </div>

          </div>

          {/* Quick Categories Filter Badges */}
          <div className="pt-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
              <Filter className="h-3.5 w-3.5" />
              <span>FILTER BY CATEGORY</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all duration-250 ${
                  category === ''
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-950 border-slate-800 dark:border-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                All Notices
              </button>
              
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all duration-250 ${
                    category === cat
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

        </form>
      </div>

      {/* 3. Notices Display Section */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200/50 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 flex items-center space-x-3 mb-8">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        // Grid of skeletons loading state
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse p-5 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 h-52 flex flex-col justify-between">
              <div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 pt-4"></div>
            </div>
          ))}
        </div>
      ) : notices.length > 0 ? (
        // Render Active Notices
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} />
          ))}
        </div>
      ) : (
        // Empty State View
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl max-w-xl mx-auto shadow-sm">
          <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 mb-4">
            <Megaphone className="h-10 w-10" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-850 dark:text-white">
            No Active Notices
          </h3>
          
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
            {search || category
              ? "We couldn't find anything matching your search filters. Try clearing inputs or toggling standard search mode."
              : "Check back later! Fresh academic briefings, circulars, and campus events will show up here as administrators post them."}
          </p>

          {(search || category || smart) && (
            <button
              onClick={resetFilters}
              className="mt-5 px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-300 transition-all duration-200"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      )}

    </div>
  );
};
