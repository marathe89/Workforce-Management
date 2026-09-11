import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useActiveProfile } from '../stores/profileStore';
import navigation from '../config/navigation';

// Landed on whenever AccessGuard.jsx blocks a route the active persona's
// feature-access matrix doesn't permit (typed URL, header search result,
// stale bookmark/back-button — anything that isn't a Sidebar click,
// which already prevents this by rendering the item locked instead of a
// link). Named for the specific page and persona involved, with a way
// out that doesn't require knowing the URL bar trick back to Overview.
function AccessDenied() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useActiveProfile();
  const blockedPath = location.state?.from;
  const blockedLabel = navigation.find((n) => n.path === blockedPath)?.label || blockedPath;

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 4rem)', padding: '2rem' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'color-mix(in srgb, var(--w-red) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LockClosedIcon style={{ width: '26px', height: '26px', color: 'var(--w-red)' }} />
      </div>
      <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--w-text-primary)', marginTop: '18px' }}>
        Access restricted
      </h1>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-secondary)', marginTop: '8px', maxWidth: '440px', textAlign: 'center' }}>
        {blockedLabel ? <>The <strong style={{ color: 'var(--w-text-primary)' }}>{blockedLabel}</strong> page</> : 'This page'} isn't available to the active persona,{' '}
        <strong style={{ color: 'var(--w-text-primary)' }}>{profile.name || profile.role}</strong>{profile.name ? ` (${profile.role})` : ''}. Switch to a persona with access from the avatar menu, or an Administration → Role Management change can grant it.
      </p>
      <div className="flex gap-2" style={{ marginTop: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '9px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}
        >
          Back to Overview
        </button>
        <button
          onClick={() => navigate('/administration')}
          style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '9px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-secondary)' }}
        >
          Go to Administration
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;
