import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminGuard = ({ children }) => {
  const { isAuthenticated, isInitializing, triggerAccessDenied } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      triggerAccessDenied('Please log in to access the Bloom Admin portal.');
    }
  }, [isInitializing, isAuthenticated, triggerAccessDenied]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-200 border-t-[#00BCFF] rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500 font-semibold tracking-wide">
            Verifying Admin Authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
