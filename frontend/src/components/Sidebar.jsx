import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import navigation from '../config/navigation';
import { useActiveProfile } from '../stores/profileStore';
import useAccessStore from '../stores/accessStore';

function Sidebar() {
  const location = useLocation();
  const profile = useActiveProfile();
  const hasAccess = useAccessStore((s) => s.hasAccess);
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
            <p className="text-gray-100 font-bold leading-tight truncate">COFORGE</p>
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

      {/* Nav — items the active persona's feature-access matrix
          (accessStore.js, editable from Administration → Role
          Management) doesn't permit render locked and non-navigable
          instead of disappearing entirely, so switching persona doesn't
          look like the sidebar broke; AccessGuard.jsx backs this up for
          direct URL navigation / header search too. */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          const allowed = hasAccess(profile.id, item.path);
          if (!allowed) {
            return (
              <div
                key={item.path}
                title={`${item.label} — not available to ${profile.role}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 cursor-not-allowed"
              >
                <Icon className="w-5 h-5 shrink-0 opacity-40" />
                {!collapsed && <span className="truncate opacity-40">{item.label}</span>}
                {!collapsed && <LockClosedIcon className="w-3.5 h-3.5 shrink-0 ml-auto opacity-50" />}
              </div>
            );
          }
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
          <QuestionMarkCircleIcon className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Help</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-ink-700 hover:text-gray-100 transition">
          <Cog6ToothIcon className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* Shows the active persona (profileStore) — switch it from the
            header's avatar menu (top right), which lists every role
            (add/edit/delete them from Administration → Role Management). */}
        <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-ink-700">
          <div className="w-8 h-8 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
            {profile.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{profile.name || profile.role}</p>
              {profile.name && <p className="text-xs text-gray-500 truncate">{profile.role}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
