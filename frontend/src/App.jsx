import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import Login from './pages/Login';
import Overview from './pages/Overview';
import TalentFinder from './pages/TalentFinder';
import Projects from './pages/Projects';
import AIWorkforceAdvisor from './pages/AIWorkforceAdvisor';
import ComingSoon from './pages/ComingSoon';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={<ProtectedRoute token={token} component={Layout} />}
        >
          <Route path="/" element={<Overview />} />
          <Route path="/talent-finder" element={<TalentFinder />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/ai-advisor" element={<AIWorkforceAdvisor />} />

          {/* Not yet built out — see the Coforge Workforce Intelligence Figma file */}
          <Route path="/workforce" element={<ComingSoon />} />
          <Route path="/capacity-utilization" element={<ComingSoon />} />
          <Route path="/demand-forecast" element={<ComingSoon />} />
          <Route path="/skills-intelligence" element={<ComingSoon />} />
          <Route path="/bench-management" element={<ComingSoon />} />
          <Route path="/workforce-planning" element={<ComingSoon />} />
          <Route path="/reports" element={<ComingSoon />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
