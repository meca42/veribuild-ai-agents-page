const m = (typeof import.meta !== 'undefined' ? import.meta.env : undefined) as any;
const p = (typeof process !== 'undefined' ? process.env : undefined) as any;

export const USE_MOCK_API =
  (m?.VITE_USE_MOCK_API ?? p?.VITE_USE_MOCK_API ?? m?.USE_MOCK_API ?? p?.USE_MOCK_API ?? 'true').toString() === 'true';

export const SUPABASE_URL =
  (m?.VITE_SUPABASE_URL ?? p?.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();

export const SUPABASE_ANON_KEY =
  (m?.VITE_SUPABASE_ANON_KEY ?? p?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

export const SUPABASE_SERVICE_ROLE_KEY =
  (p?.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

if (typeof window !== 'undefined') {
  if (!USE_MOCK_API && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
    console.warn('[ENV] Missing SUPABASE_URL or SUPABASE_ANON_KEY in browser. Check .env and prefixes (VITE_/NEXT_PUBLIC_).');
    console.warn('[ENV] SUPABASE_URL:', SUPABASE_URL ? `${SUPABASE_URL.slice(0, 20)}...` : '(empty)');
    console.warn('[ENV] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.slice(0, 20)}...` : '(empty)');
  }
  console.log('[ENV] USE_MOCK_API:', USE_MOCK_API);
} else {
  if (!SUPABASE_URL) console.warn('[ENV] Missing SUPABASE_URL on server.');
}
