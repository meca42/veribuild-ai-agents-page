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
      console.log('[Auth] Starting org_members query...');
      
      // Add timeout wrapper
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );
      
      // First get org_members
      const membersPromise = supabase
        .from('org_members')
        .select('id, org_id, role')
        .eq('user_id', userId);
      
      const { data: members, error: membersError } = await Promise.race([
        membersPromise,
        timeout
      ]) as any;

      console.log('[Auth] org_members query completed. Data:', members, 'Error:', membersError);

      if (membersError) {
        console.error('[Auth] Error loading org members:', membersError);
        return;
      }

      if (!members || members.length === 0) {
        console.log('[Auth] No org memberships found');
        setOrganizations([]);
        return;
      }

      // Then get the org details
      const orgIds = members.map((m: any) => m.org_id);
      console.log('[Auth] Fetching orgs:', orgIds);
      
      const orgsPromise = supabase
        .from('orgs')
        .select('id, name')
        .in('id', orgIds);
      
      const timeout2 = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Orgs query timeout')), 5000)
      );
      
      const { data: orgs, error: orgsError } = await Promise.race([
        orgsPromise,
        timeout2
      ]) as any;

      console.log('[Auth] orgs query completed. Data:', orgs, 'Error:', orgsError);

      if (orgsError) {
        console.error('[Auth] Error loading orgs:', orgsError);
        return;
      }

      // Combine the data
      const formattedOrgs = members.map((member: any) => {
        const org = orgs?.find((o: any) => o.id === member.org_id);
        return {
          id: member.id,
          org_id: member.org_id,
          role: member.role,
          org: org || { id: member.org_id, name: 'Unknown' }
        };
      });
      
      console.log('[Auth] Formatted orgs:', formattedOrgs);
      setOrganizations(formattedOrgs as OrgMember[]);
      
      const savedOrgId = localStorage.getItem('currentOrgId');
      if (savedOrgId && formattedOrgs.some((m: any) => m.org_id === savedOrgId)) {
        setCurrentOrgId(savedOrgId);
      } else if (formattedOrgs.length > 0) {
        setCurrentOrgId(formattedOrgs[0].org_id);
      }
      
      console.log('[Auth] Orgs loaded successfully:', formattedOrgs.length);
    } catch (error) {
      console.error('[Auth] Exception loading orgs:', error);
      // Don't let this block the app - set empty orgs
      setOrganizations([]);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      console.log('[Auth] Loading user profile for:', userId);
      console.log('[Auth] Starting users query...');
      
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 5000)
      );
      
      const profilePromise = supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([
        profilePromise,
        timeout
      ]) as any;

      console.log('[Auth] Profile query completed. Data:', data, 'Error:', error);

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
      // Don't let this block the app
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.log('[Auth] No Supabase client, setting isLoading to false');
      setIsLoading(false);
      return;
    }
    
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('[Auth] User session found:', session.user.id);
          setUser(session.user);
          
          // Wait for both to complete before setting isLoading to false
          await Promise.all([
            loadUserOrgs(session.user.id),
            loadUserProfile(session.user.id)
          ]);
        } else {
          console.log('[Auth] No active session');
        }
        
        setIsLoading(false);
        console.log('[Auth] Initialization complete');
      } catch (error) {
        console.error('[Auth] Error during initialization:', error);
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
