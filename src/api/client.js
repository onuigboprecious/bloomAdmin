// Base API HTTP Client Configuration
export const BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : 'https://bloombe.onrender.com';

export async function fetchClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    credentials: 'include', // Always send HTTP-only session cookies
    headers: defaultHeaders,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { text };
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { success: true, data, status: response.status };
  } catch (err) {
    if (err.status) {
      throw err; // Re-throw server responses like 409 Conflict
    }
    console.warn(`[Bloom API Client] Request to ${url} encountered network limit/timeout. Utilizing local store fallback.`, err);
    return null; // Signals fallback to use mock store
  }
}
