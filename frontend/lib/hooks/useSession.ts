import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '../supabase/client';
import { useAuth } from '../auth';

export interface SessionData {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  currentOrgId: string | null;
}

export const useSession = (): SessionData => {
  const { user, currentOrgId, isLoading } = useAuth();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!isSupabaseConfigured) {
      setSession(null);
      return;
    }

    const supabase = createBrowserClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isLoading,
    currentOrgId,
  };
};
