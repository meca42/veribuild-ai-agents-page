import { createBrowserClient } from './client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthSession {
  user: User;
  session: Session;
}

export const getSession = async (): Promise<AuthSession | null> => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  return {
    user: data.session.user,
    session: data.session,
  };
};

export const requireSession = async (): Promise<AuthSession> => {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
};

export const signIn = async (email: string, password: string) => {
  const supabase = createBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  const supabase = createBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export const signInWithGoogle = async () => {
  const supabase = createBrowserClient();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export const signOut = async () => {
  const supabase = createBrowserClient();
  return supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  const supabase = createBrowserClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const updatePassword = async (newPassword: string) => {
  const supabase = createBrowserClient();
  return supabase.auth.updateUser({ password: newPassword });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
};
