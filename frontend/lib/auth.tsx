import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from "./supabase/client";
import { signIn, signUp, signOut, signInWithGoogle, getCurrentUser } from "./supabase/auth";
import { USE_MOCK_API } from "./env";

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

  const supabase = USE_MOCK_API ? null : createBrowserClient();

  const loadUserOrgs = async (userId: string) => {
    if (!supabase) return;
    
    try {
      console.log('[Auth] Loading user orgs for:', userId);
      
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

      if (error) {
        console.error('[Auth] Error loading orgs:', error);
        return;
      }

      console.log('[Auth] Orgs loaded:', data?.length || 0);

      if (data) {
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
    } catch (error) {
      console.error('[Auth] Exception loading orgs:', error);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      console.log('[Auth] Loading user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error loading profile:', error);
        return;
      }

      console.log('[Auth] Profile loaded');

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('[Auth] Exception loading profile:', error);
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.log('[Auth] No Supabase client, setting isLoading to false');
      setIsLoading(false);
      return;
    }
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('[Auth] Initialization timed out after 10s');
      setIsLoading(false);
    }, 10000);
    
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error);
          clearTimeout(timeout);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('[Auth] User session found:', session.user.id);
          setUser(session.user);
          await Promise.all([
            loadUserOrgs(session.user.id),
            loadUserProfile(session.user.id)
          ]);
        } else {
          console.log('[Auth] No active session');
        }
        
        clearTimeout(timeout);
        setIsLoading(false);
        console.log('[Auth] Initialization complete');
      } catch (error) {
        console.error('[Auth] Error during initialization:', error);
        clearTimeout(timeout);
        setIsLoading(false);
      }
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
    if (USE_MOCK_API) throw new Error('Cannot login in mock mode');
    const { error } = await signIn(email, password);
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    if (USE_MOCK_API) throw new Error('Cannot login in mock mode');
    const { error } = await signInWithGoogle();
    if (error) throw error;
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem('currentOrgId');
  };

  const signup = async (name: string, email: string, password: string) => {
    if (USE_MOCK_API) throw new Error('Cannot signup in mock mode');
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
