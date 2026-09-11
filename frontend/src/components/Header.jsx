import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BellIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import navigation from '../config/navigation';
import useAuthStore from '../stores/authStore';
import useThemeStore from '../stores/themeStore';
import { searchPortal } from '../data/searchIndex';
import NotificationsPanel, { INITIAL_NOTIFICATIONS } from './NotificationsPanel';
import useFilterStore from '../stores/filterStore';
import { BUSINESS_UNITS } from '../data/businessUnits';
import useProfileStore, { useActiveProfile } from '../stores/profileStore';

const TYPE_COLOR = {
  Page: 'var(--w-text-tertiary, #94a3b8)',
  Employee: '#3b7ef8',
  Skill: '#8b5cf6',
  Project: '#22c55e',
  Report: '#f59e0b',
};

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const profile = useActiveProfile();
  const roles = useProfileStore((s) => s.roles);
  const switchProfile = useProfileStore((s) => s.switchProfile);
  const { theme, toggleTheme } = useThemeStore();
  const businessUnit = useFilterStore((s) => s.draft.businessUnit);
  const setBusinessUnitNow = useFilterStore((s) => s.setBusinessUnitNow);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const current = navigation.find((item) => item.path === location.pathname);
  const pageTitle = current?.label || 'Not Found';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const results = searchPortal(query);

  const goTo = (item) => {
    // Pages navigate as-is; everything else (employees, skills, reports,
    // projects) carries its search term as `?q=` so the destination page
    // can filter down to just the matching data instead of landing on an
    // unfiltered list.
    const url = item.type === 'Page' ? item.path : `${item.path}?q=${encodeURIComponent(item.title)}`;
    navigate(url);
    setQuery('');
    setSearchOpen(false);
  };

  // Close the results dropdown on outside click.
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [searchOpen]);

  // Close the notifications panel on Escape.
  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [notificationsOpen]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && results.length > 0) {
      goTo(results[0]);
    }
  };

  return (
    <header className="bg-ink-900 border-b border-ink-700 px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3 lg:gap-4">
      {/* Breadcrumb — the one flexible element in this row. Everything
          else has a fixed width per breakpoint, so this is what absorbs
          the slack: it truncates with an ellipsis instead of the row
          overflowing or (worse) a fixed-width sibling being squeezed
          toward zero and overlapping its neighbors. */}
      <div className="flex-1 min-w-0 text-sm truncate">
        <span className="hidden lg:inline text-gray-500">Workforce Intelligence</span>
        <span className="hidden lg:inline text-gray-600 mx-2">/</span>
        <span className="text-gray-100 font-medium">{pageTitle}</span>
      </div>

      {/* Search — hidden below md (no room next to everything else);
          fixed width per breakpoint rather than flex-growing, so it can
          never be squeezed into overlapping its own icon/shortcut badge. */}
      <div className="hidden md:block w-40 lg:w-56 xl:w-72 shrink-0" ref={searchRef}>
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search..."
            className="w-full bg-ink-800 border border-ink-600 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {searchOpen && query.trim() && (
            <div className="absolute left-0 top-full mt-2 w-72 lg:w-80 bg-ink-800 border border-ink-600 rounded-lg shadow-xl py-1.5 z-30 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-3 py-3 text-sm text-gray-500">No results for "{query}"</p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={`${r.type}-${r.title}-${i}`}
                    onClick={() => goTo(r)}
                    className="w-full text-left px-3 py-2 hover:bg-ink-700 transition flex items-start justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-gray-100 truncate">{r.title}</span>
                      <span className="block text-xs text-gray-500 truncate">{r.subtitle}</span>
                    </span>
                    <span
                      className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{ color: TYPE_COLOR[r.type], background: 'rgba(148, 163, 184, 0.12)' }}
                    >
                      {r.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {/* Compact stand-in for the search box below md. */}
      <button className="md:hidden shrink-0 text-gray-400 hover:text-gray-200 transition" aria-label="Search">
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>

      {/* Filters — supplementary, only shown once there's real room.
          Business Unit is the one global, always-on filter (commits
          immediately, no Apply button of its own) — see filterStore.js. */}
      <select
        value={businessUnit}
        onChange={(e) => setBusinessUnitNow(e.target.value)}
        className="hidden xl:block shrink-0 bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {BUSINESS_UNITS.map((bu) => (
          <option key={bu}>{bu}</option>
        ))}
      </select>
      <select className="hidden xl:block shrink-0 bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
        <option>August 2026</option>
      </select>

      {/* Theme toggle — shows the mode clicking it switches TO (🌙 Dark
          while in light mode, ☀️ Light while in dark mode), i.e. it reads
          as the action, not the current state. Icon-only below lg,
          matching AI Advisor's own disclosure point, so it doesn't
          reintroduce the overflow the rest of this header was carefully
          tuned to avoid. */}
      <button
        onClick={toggleTheme}
        className="shrink-0 flex items-center gap-1.5 border border-ink-600 rounded-lg px-2.5 lg:px-3 py-1.5 text-sm text-gray-300 hover:bg-ink-700 transition"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span>{theme === 'light' ? '🌙' : '☀️'}</span>
        <span className="hidden lg:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
      </button>

      {/* Notifications */}
      <button
        onClick={() => setNotificationsOpen(true)}
        className="relative shrink-0 text-gray-400 hover:text-gray-200 transition"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
      </button>
      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkTabRead={(tab) => setNotifications((prev) => (tab === 'all' ? [] : prev.filter((n) => n.severity !== tab)))}
      />

      {/* AI Advisor — icon-only until lg, where its label fits. */}
      <button
        onClick={() => navigate('/ai-advisor')}
        className="shrink-0 flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-2.5 lg:px-3 py-2 rounded-lg transition whitespace-nowrap"
        aria-label="AI Advisor"
      >
        <SparklesIcon className="w-4 h-4" />
        <span className="hidden lg:inline">AI Advisor</span>
      </button>

      {/* User avatar — shows the active persona (profileStore), not the
          real backend login identity. The dropdown doubles as a profile
          switcher: picking a different one of the 5 named profiles below
          updates the avatar/name/role everywhere they're shown (this
          menu, the sidebar footer) without touching the underlying
          auth session. */}
      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-9 h-9 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold"
          aria-label="Account menu"
        >
          {profile.initials}
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-11 z-20 w-64 bg-ink-800 border border-ink-600 rounded-lg shadow-xl py-1">
              <div className="px-3 py-2 border-b border-ink-600">
                <p className="text-sm font-medium text-gray-100 truncate">{profile.name || profile.role}</p>
                {profile.name && <p className="text-xs text-gray-500 truncate">{profile.role}</p>}
              </div>
              <div className="px-3 pt-2 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Switch Profile</p>
              </div>
              <div className="py-1">
                {roles.map((p) => {
                  const active = p.id === profile.id;
                  const display = p.name || p.role;
                  return (
                    <button
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className={`w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm transition ${
                        active ? 'bg-brand-500/15 text-brand-300' : 'text-gray-300 hover:bg-ink-700'
                      }`}
                    >
                      <span className="w-6 h-6 shrink-0 rounded-full bg-ink-600 flex items-center justify-center text-[10px] font-bold text-gray-200">
                        {display.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{display}</span>
                        {p.name && <span className="block text-[11px] text-gray-500 truncate">{p.role}</span>}
                      </span>
                      {active && <span className="shrink-0 text-brand-400">✓</span>}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-ink-700 transition border-t border-ink-600"
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
