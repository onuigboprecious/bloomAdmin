import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminGuard = ({ children }) => {
  const { isAuthenticated, triggerAccessDenied } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      triggerAccessDenied('Access Denied: Admin privileges required.');
    }
  }, [isAuthenticated, triggerAccessDenied]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
