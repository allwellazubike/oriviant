/// <reference types="vite/client" />

// Uses your environment variable, or falls back to your local backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // 1. Force the browser to pull a completely fresh token on every single click (with robust fallback keys)
  const token = 
    localStorage.getItem('oriviant_token') || 
    sessionStorage.getItem('oriviant_token') || 
    localStorage.getItem('token') || 
    sessionStorage.getItem('token') || 
    localStorage.getItem('authToken') || 
    localStorage.getItem('access_token') ||
    localStorage.getItem('jwt');
  
  const headers = new Headers(options.headers);
  
  // 2. Set default JSON content type
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // 3. Attach the Bearer token ONLY if it is a valid string
  if (token && token !== 'undefined' && token !== 'null') {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 4. Fire Request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 5. Parse JSON securely
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data as T;
};