import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useActiveProfile } from '../stores/profileStore';
import useAccessStore, { FEATURES } from '../stores/accessStore';

// Backs up Sidebar.jsx's locked/greyed-out nav items: that only stops
// clicks from the sidebar itself, not a typed URL, a header search
// result, a stale bookmark, or the browser back button. This runs on
// every route change and redirects to /access-denied if the active
// persona's feature-access matrix (accessStore.js) doesn't permit the
// current path — the actual enforcement point, not just a visual cue.
//
// A page like /data-entry/employees/42/edit isn't itself a FEATURES
// entry — only its parent /data-entry is — so this resolves to the
// longest FEATURES path that's a prefix of the current URL (falling
// back to an exact match) and checks access for THAT, rather than
// failing every sub-route of a feature that has any.
function owningFeatureId(pathname) {
  const candidates = FEATURES.filter((f) => pathname === f.id || pathname.startsWith(`${f.id === '/' ? '' : f.id}/`));
  if (candidates.length === 0) return pathname;
  return candidates.reduce((longest, f) => (f.id.length > longest.id.length ? f : longest)).id;
}

function AccessGuard() {
  const location = useLocation();
  const profile = useActiveProfile();
  const hasAccess = useAccessStore((s) => s.hasAccess);
  const featureId = owningFeatureId(location.pathname);

  if (!hasAccess(profile.id, featureId)) {
    return <Navigate to="/access-denied" replace state={{ from: featureId }} />;
  }

  return <Outlet />;
}

export default AccessGuard;
