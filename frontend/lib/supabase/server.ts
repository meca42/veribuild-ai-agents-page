import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const createServerClient = (cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: any) => void;
  remove: (name: string, options?: any) => void;
}) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return createSupabaseServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookies.get(name);
      },
      set(name: string, value: string, options: any) {
        cookies.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookies.remove(name, options);
      },
    },
  });
};
