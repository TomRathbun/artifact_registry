/**
 * Wire JWT auth into every HTTP path the UI uses:
 * - OpenAPI generated client (TOKEN resolver)
 * - axios defaults/interceptor (diagrams, images, legacy calls)
 * - window.fetch for /api/* (documents, comments, utility, etc.)
 *
 * Without this, security-hardened endpoints return 401 and lists appear empty.
 */
import axios from 'axios';
import { OpenAPI } from './client';

function getToken(): string | undefined {
  try {
    return localStorage.getItem('token') || undefined;
  } catch {
    return undefined;
  }
}

/** Keep OpenAPI.TOKEN always in sync with localStorage (not a one-time snapshot). */
OpenAPI.TOKEN = async () => getToken() || '';
OpenAPI.BASE = '';

// axios: attach Bearer on every request
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// fetch: attach Bearer for API routes (skip /token login form)
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (typeof Request !== 'undefined' && input instanceof Request) {
    url = input.url;
  }

  const isApi =
    url.includes('/api/') ||
    url.startsWith('/api') ||
    // relative absolute paths used by the app
    (url.startsWith('/') && url.startsWith('/api'));

  // Login must stay unauthenticated
  if (isApi && !url.includes('/token')) {
    const token = getToken();
    if (token) {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }
  }

  return originalFetch(input, init);
};

export {};
