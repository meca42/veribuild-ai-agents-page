const m = (typeof import.meta !== 'undefined' ? import.meta.env : undefined) as any;
const p = (typeof process !== 'undefined' ? process.env : undefined) as any;

// Fallback hardcoded values (for Leap environment where .env files may not load)
const FALLBACK_SUPABASE_URL = 'https://lalmleaetmmqsyzvvdzi.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbG1sZWFldG1tcXN5enZ2ZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODcyOTgsImV4cCI6MjA3NTI2MzI5OH0.s6vQGV8H7KNfmQxR6cRp6WoYOPHSri4FLsNkns7WCIw';
const FALLBACK_USE_MOCK_API = 'false';

export const USE_MOCK_API =
  (m?.VITE_USE_MOCK_API ?? p?.VITE_USE_MOCK_API ?? m?.USE_MOCK_API ?? p?.USE_MOCK_API ?? FALLBACK_USE_MOCK_API).toString() === 'true';

export const SUPABASE_URL =
  (m?.VITE_SUPABASE_URL ?? p?.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL).trim();

export const SUPABASE_ANON_KEY =
  (m?.VITE_SUPABASE_ANON_KEY ?? p?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_SUPABASE_ANON_KEY).trim();

export const SUPABASE_SERVICE_ROLE_KEY =
  (p?.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

if (typeof window !== 'undefined') {
  console.log('[ENV] USE_MOCK_API:', USE_MOCK_API);
  console.log('[ENV] SUPABASE_URL:', SUPABASE_URL ? `${SUPABASE_URL.slice(0, 30)}...` : '(empty)');
  console.log('[ENV] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'configured' : '(empty)');
}
