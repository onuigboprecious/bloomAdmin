import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { useIdleTimer } from '../hooks/useIdleTimer';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authAlert, setAuthAlert] = useState(null);

  useEffect(() => {
    // Session check on load
    authApi.me()
      .then((res) => {
        if (res && res.success && res.data) {
          setUser({
            ...res.data,
            role: res.data.role || 'admin',
          });
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const logout = useCallback(async (reason) => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout session clear error:', err);
    }
    setUser(null);
    if (reason) {
      setAuthAlert(reason);
    }
  }, []);

  const handleInactivityTimeout = useCallback(() => {
    logout('You have been automatically logged out due to inactivity.');
  }, [logout]);

  const { isWarning, remainingSeconds, resetIdleTimer } = useIdleTimer({
    timeoutMs: 15 * 60 * 1000,       // 15 minutes
    warningDurationMs: 60 * 1000,    // 60 seconds warning
    onTimeout: handleInactivityTimeout,
    enabled: !!user,
  });

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res && res.success) {
        setUser({
          id: res.data.id || 'ADM-001',
          name: res.data.name || email.split('@')[0] || 'Admin Operator',
          email: res.data.email || email,
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        });
        setAuthAlert(null);
        resetIdleTimer();
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Invalid admin credentials' };
    }
    return { success: false, message: 'Invalid admin credentials' };
  };

  const triggerAccessDenied = (msg = 'Access Denied: Admin privileges required.') => {
    setAuthAlert(msg);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        isAuthenticated: !!user && (user.role === 'admin' || !user.role),
        login,
        logout,
        authAlert,
        setAuthAlert,
        triggerAccessDenied,
        isIdleWarning: isWarning,
        idleRemainingSeconds: remainingSeconds,
        extendSession: resetIdleTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
