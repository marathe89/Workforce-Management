import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  BellIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
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

function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={clsx(
        'flex flex-col bg-ink-900 border-r border-ink-700 transition-all duration-200',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-ink-700">
        <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold">
          C
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold leading-tight truncate">COFORGE</p>
            <p className="text-brand-400 text-[10px] font-semibold tracking-wider leading-tight truncate">
              WORKFORCE INTELLIGENCE
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto shrink-0 text-gray-500 hover:text-gray-300 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeftIcon className={clsx('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:bg-ink-700 hover:text-gray-100'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[10px] font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-ink-700 px-3 py-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-ink-700 hover:text-gray-100 transition">
          <span className="relative shrink-0">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              7
            </span>
          </span>
          {!collapsed && <span>Notifications</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-ink-700 hover:text-gray-100 transition">
          <QuestionMarkCircleIcon className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Help</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-ink-700 hover:text-gray-100 transition">
          <Cog6ToothIcon className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-ink-700">
          <div className="w-8 h-8 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
            {initials(user?.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {user?.role?.replace('_', ' ') || ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
