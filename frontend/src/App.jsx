import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import apiClient from './api/client';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Overview from './pages/Overview';
import TalentFinder from './pages/TalentFinder';
import Projects from './pages/Projects';
import CapacityUtilization from './pages/CapacityUtilization';
import DemandForecast from './pages/DemandForecast';
import SkillsIntelligence from './pages/SkillsIntelligence';
import BenchManagement from './pages/BenchManagement';
import WorkforcePlanning from './pages/WorkforcePlanning';
import AIWorkforceAdvisor from './pages/AIWorkforceAdvisor';
import Workforce from './pages/Workforce';
import ComingSoon from './pages/ComingSoon';
import Reports from './pages/Reports';
import DataEntry from './pages/DataEntry';
import EmployeeFormPage from './pages/EmployeeFormPage';
import ProjectFormPage from './pages/ProjectFormPage';
import Administration from './pages/Administration';
import AccessDenied from './pages/AccessDenied';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AccessGuard from './components/AccessGuard';

// Demo mode: skip the login screen and drop visitors straight on the
// dashboard. The backend /api/auth/login only checks that the email exists
// (no password), so we auto-authenticate as the seeded demo account to get a
// real token — every protected API call keeps working. Set VITE_DEMO_AUTOLOGIN
// to 'false' to restore the normal login screen.
const DEMO_AUTOLOGIN = import.meta.env.VITE_DEMO_AUTOLOGIN !== 'false';
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'manager@company.com';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'password123';

function App() {
  const { token, login } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(DEMO_AUTOLOGIN && !token);

  useEffect(() => {
    if (!DEMO_AUTOLOGIN || token) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.post('/auth/login', {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        if (!cancelled) login(data.user, data.token);
      } catch {
        // Auto-login unavailable (e.g. backend unreachable) — fall back to
        // the normal login screen rather than blocking the app.
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, login]);

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={<ProtectedRoute token={token} component={Layout} />}
        >
          {/* /access-denied and /administration sit outside AccessGuard
              deliberately: AccessGuard redirects HERE when it blocks a
              route, so guarding this route too would loop; Administration
              is the screen that edits the access matrix itself, and
              accessStore.hasAccess() already always allows it regardless
              of persona (see accessStore.js) — nesting it under the
              guard would be redundant, not wrong, but keeping both
              off it makes the "can't lock yourself out" guarantee
              obvious by reading the routes, not just the store code. */}
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/administration" element={<Administration />} />

          <Route element={<AccessGuard />}>
            <Route path="/" element={<Overview />} />
            <Route path="/talent-finder" element={<TalentFinder />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/ai-advisor" element={<AIWorkforceAdvisor />} />

            <Route path="/workforce" element={<Workforce />} />

            {/* Not yet built out — see the Coforge Workforce Intelligence Figma file */}
            <Route path="/capacity-utilization" element={<CapacityUtilization />} />
            <Route path="/demand-forecast" element={<DemandForecast />} />
            <Route path="/skills-intelligence" element={<SkillsIntelligence />} />
            <Route path="/bench-management" element={<BenchManagement />} />
            <Route path="/workforce-planning" element={<WorkforcePlanning />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/data-entry" element={<DataEntry />} />
            <Route path="/data-entry/employees/new" element={<EmployeeFormPage />} />
            <Route path="/data-entry/employees/:id/edit" element={<EmployeeFormPage />} />
            <Route path="/data-entry/projects/new" element={<ProjectFormPage />} />
            <Route path="/data-entry/projects/:id/edit" element={<ProjectFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
