import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ auth, children }) => {
  const token = localStorage.getItem('token');

  // Redirect to login if not authenticated or no token is found
  if (!auth || !token) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the protected component(s)
  return children;
};

export default ProtectedRoute;
