import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, USE_MOCK_API } from '../env';

let _client: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient | null {
  if (USE_MOCK_API) return null;
  
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('[Supabase] Not configured: SUPABASE_URL or SUPABASE_ANON_KEY missing.');
      return null;
    }
    
    console.log('[Supabase] Creating client with URL:', SUPABASE_URL);
    
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'veribuild',
        },
      },
    });
    
    console.log('[Supabase] Client created successfully');
  }
  
  return _client;
}

export function getBrowserSupabase(): SupabaseClient | null {
  return createBrowserClient();
}
