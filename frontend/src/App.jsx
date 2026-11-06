import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
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

function App() {
  const { token } = useAuthStore();

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
