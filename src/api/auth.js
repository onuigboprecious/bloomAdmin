import { fetchClient, BASE_URL } from './client';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'onuigboprecious47@gmail.com').toLowerCase().trim();

export const authApi = {
  // Login: POST /api/auth/login (integrates directly with infarbloom backend)
  async login(email, password) {
    const inputEmail = email?.toLowerCase().trim();

    // 1. Send authentication request to infarbloom backend
    let res;
    try {
      res = await fetchClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      // Fallback endpoint check for /api/login
      if (err.status === 404) {
        res = await fetchClient('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      } else {
        throw err;
      }
    }

    if (res) {
      const authData = res.data || res;
      const authenticatedEmail = (authData.email || authData.user?.email || inputEmail)?.toLowerCase().trim();

      // Enforce strict email permission check: ONLY onuigboprecious47@gmail.com
      if (authenticatedEmail === ADMIN_EMAIL) {
        return {
          success: true,
          data: {
            id: authData.id || authData.user?.id || 'ADM-002',
            name: authData.name || authData.user?.name || 'Precious Onuigbo',
            email: ADMIN_EMAIL,
            role: 'admin',
          },
        };
      } else {
        throw new Error(
          `Access Denied: Account '${authenticatedEmail}' does not have Administrator privileges. Only ${ADMIN_EMAIL} is permitted.`
        );
      }
    }

    throw new Error(`Unable to connect to authentication server. Please verify the backend API server is running on ${BASE_URL}.`);
  },

  // Session Check: GET /api/auth/me
  async me() {
    try {
      const res = await fetchClient('/api/auth/me', { method: 'GET' });
      if (res && (res.success || res.email || res.data)) {
        const authData = res.data || res;
        const authenticatedEmail = (authData.email || authData.user?.email)?.toLowerCase().trim();

        if (authenticatedEmail === ADMIN_EMAIL) {
          return {
            success: true,
            data: {
              id: authData.id || authData.user?.id || 'ADM-002',
              name: authData.name || authData.user?.name || 'Precious Onuigbo',
              email: ADMIN_EMAIL,
              role: 'admin',
            },
          };
        }
      }
    } catch (err) {
      // Session invalid or unauthenticated
    }
    return { success: false, user: null };
  },

  // Logout: POST /api/auth/logout
  async logout() {
    try {
      await fetchClient('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore logout session clear errors
    }
    return { success: true, message: 'Logged out successfully' };
  },
};
