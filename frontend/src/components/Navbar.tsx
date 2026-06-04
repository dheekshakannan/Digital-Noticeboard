import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, KeyRound, Megaphone } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-brand-500 text-white p-2 rounded-xl transition-all duration-300 group-hover:scale-115 group-hover:rotate-6">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white transition-colors duration-200">
                Notice<span className="text-brand-500">Board</span>
              </span>
              <span className="block text-xxs text-slate-400 font-medium tracking-widest uppercase">
                Digital Board
              </span>
            </div>
          </Link>

          {/* Controls & Nav Links */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle Theme Mode"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Admin Controls */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-all duration-200 shadow-md shadow-brand-500/10 hover:scale-103 active:scale-97"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-850 bg-transparent hover:bg-red-500 hover:text-white dark:hover:bg-red-600/90 dark:hover:text-white transition-all duration-250 hover:border-red-500"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-103 active:scale-97"
              >
                <KeyRound className="h-4 w-4 text-brand-500" />
                <span>Admin Login</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};
