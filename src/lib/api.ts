const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  get: async (url: string, options?: RequestInit) => {
    const res = await fetch(`${API_BASE}${url}`, { ...options, credentials: 'include' });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },
  post: async (url: string, body: unknown) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return res.json();
  },
  // patch, delete, etc.
};