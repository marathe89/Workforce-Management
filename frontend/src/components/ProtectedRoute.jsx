import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ token, component: Component }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
}

export default ProtectedRoute;
