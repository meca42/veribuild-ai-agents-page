import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '../supabase/client';
import { useAuth } from '../auth';
import { USE_MOCK_API } from '../env';

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
    if (USE_MOCK_API) {
      setSession(null);
      return;
    }

    const supabase = createBrowserClient();
    if (!supabase) {
      setSession(null);
      return;
    }
    
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
