import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BellIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import navigation from '../config/navigation';
import useAuthStore from '../stores/authStore';

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const current = navigation.find((item) => item.path === location.pathname);
  const pageTitle = current?.label || 'Not Found';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-ink-900 border-b border-ink-700 px-6 py-3 flex items-center gap-4">
      {/* Breadcrumb */}
      <div className="text-sm whitespace-nowrap">
        <span className="text-gray-500">Workforce Intelligence</span>
        <span className="text-gray-600 mx-2">/</span>
        <span className="text-gray-100 font-medium">{pageTitle}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, skill, project, client..."
            className="w-full bg-ink-800 border border-ink-600 rounded-lg pl-9 pr-12 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 border border-ink-600 rounded px-1.5 py-0.5">
            ⌘K
          </span>
        </div>
      </div>

      {/* Filters */}
      <select className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
        <option>All Business Units</option>
      </select>
      <select className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
        <option>August 2026</option>
      </select>

      {/* Notifications */}
      <button className="relative text-gray-400 hover:text-gray-200 transition" aria-label="Notifications">
        <BellIcon className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
      </button>

      {/* AI Advisor */}
      <button
        onClick={() => navigate('/ai-advisor')}
        className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition whitespace-nowrap"
      >
        <SparklesIcon className="w-4 h-4" />
        AI Advisor
      </button>

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-9 h-9 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold"
        >
          {initials(user?.name)}
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-11 z-20 w-48 bg-ink-800 border border-ink-600 rounded-lg shadow-xl py-1">
              <div className="px-3 py-2 border-b border-ink-600">
                <p className="text-sm font-medium text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-ink-700 transition"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
