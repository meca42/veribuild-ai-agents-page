import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from "./supabase/client";
import { signIn, signUp, signOut, signInWithGoogle, getCurrentUser } from "./supabase/auth";

interface OrgMember {
  id: string;
  org_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  org: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: { name?: string; avatar_url?: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentOrgId: string | null;
  currentOrgRole: string | null;
  organizations: OrgMember[];
  setCurrentOrgId: (orgId: string) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  refreshOrgs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; avatar_url?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrgMember[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = isSupabaseConfigured ? createBrowserClient() : null;

  const loadUserOrgs = async (userId: string) => {
    if (!supabase) return;
    
    const { data, error } = await supabase
      .from('org_members')
      .select(`
        id,
        org_id,
        role,
        org:orgs!inner (
          id,
          name,
          avatar_url
        )
      `)
      .eq('user_id', userId);

    if (!error && data) {
      const formattedOrgs = data.map((item: any) => ({
        id: item.id,
        org_id: item.org_id,
        role: item.role,
        org: Array.isArray(item.org) ? item.org[0] : item.org
      }));
      
      setOrganizations(formattedOrgs as OrgMember[]);
      
      const savedOrgId = localStorage.getItem('currentOrgId');
      if (savedOrgId && formattedOrgs.some((m: any) => m.org_id === savedOrgId)) {
        setCurrentOrgId(savedOrgId);
      } else if (formattedOrgs.length > 0) {
        setCurrentOrgId(formattedOrgs[0].org_id);
      }
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return;
    
    const { data } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', userId)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await Promise.all([
          loadUserOrgs(session.user.id),
          loadUserProfile(session.user.id)
        ]);
      }
      
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await Promise.all([
          loadUserOrgs(session.user.id),
          loadUserProfile(session.user.id)
        ]);
      } else {
        setUser(null);
        setUserProfile(null);
        setOrganizations([]);
        setCurrentOrgId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentOrgId) {
      localStorage.setItem('currentOrgId', currentOrgId);
    }
  }, [currentOrgId]);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await signIn(email, password);
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await signInWithGoogle();
    if (error) throw error;
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem('currentOrgId');
  };

  const signup = async (name: string, email: string, password: string) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await signUp(email, password, { name });
    if (error) throw error;
  };

  const refreshOrgs = async () => {
    if (user) {
      await loadUserOrgs(user.id);
    }
  };

  const currentOrgMember = organizations.find((m) => m.org_id === currentOrgId);
  const currentOrgRole = currentOrgMember?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated: !!user,
        isLoading,
        currentOrgId,
        currentOrgRole,
        organizations,
        setCurrentOrgId,
        login,
        loginWithGoogle,
        logout,
        signup,
        refreshOrgs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
