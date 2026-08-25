import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'ADM-001',
    name: 'Chief Admin',
    email: 'admin@bloom.ng',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });

  const [authAlert, setAuthAlert] = useState(null);

  useEffect(() => {
    // Session check on load
    authApi.me()
      .then((res) => {
        if (res && res.success && res.data) {
          setUser((prev) => ({
            ...prev,
            ...res.data,
            role: res.data.role || 'admin',
          }));
        }
      })
      .catch(() => {
        // Keep active demo user session
      });
  }, []);

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
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Invalid admin credentials' };
    }
    return { success: false, message: 'Invalid admin credentials' };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout session clear error:', err);
    }
    setUser(null);
  };

  const triggerAccessDenied = (msg = 'Access Denied: Admin privileges required.') => {
    setAuthAlert(msg);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && (user.role === 'admin' || !user.role),
        login,
        logout,
        authAlert,
        setAuthAlert,
        triggerAccessDenied,
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
