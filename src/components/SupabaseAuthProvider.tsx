import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { User } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInAnonymous: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const signInAnonymousInFlightRef = useRef<Promise<void> | null>(null);
  const lastAnonymousAttemptAtRef = useRef<number>(0);

  const formatUnknownError = (err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return fallback;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });

    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });

    if (error) {
      throw error;
    }
  };

  const clearAuthError = () => setAuthError(null);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
          let timeoutId: number | undefined;
          const timeoutPromise = new Promise<T>((_, reject) => {
            timeoutId = window.setTimeout(() => reject(new Error('Timeout obteniendo sesión (posible lock del navegador)')), ms);
          });

          try {
            return await Promise.race([promise, timeoutPromise]);
          } finally {
            if (timeoutId) window.clearTimeout(timeoutId);
          }
        };

        const { data: { session } } = await withTimeout(supabase.auth.getSession(), 7000);
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthError(formatUnknownError(error, 'Error obteniendo sesión inicial'));
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureCompanyForUser = async (userId: string, displayName?: string): Promise<string | undefined> => {
    try {
      const { data: current, error: currentError } = await supabase
        .from('users')
        .select('default_company_id, company, industry')
        .eq('id', userId)
        .single();

      if (currentError && currentError.code !== 'PGRST116') {
        return undefined;
      }

      if (current?.default_company_id) {
        return current.default_company_id as string;
      }

      const companyName = current?.company || displayName || 'Mi empresa';

      const { data: createdCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          industry: current?.industry || null,
          profile_json: {}
        })
        .select('id')
        .single();

      if (companyError || !createdCompany?.id) {
        return undefined;
      }

      const companyId = createdCompany.id as string;

      await supabase.from('company_members').insert({
        company_id: companyId,
        user_id: userId,
        role: 'owner',
        areas: []
      });

      await supabase
        .from('users')
        .update({ default_company_id: companyId })
        .eq('id', userId);

      return companyId;
    } catch {
      // ignore
      return undefined;
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        setAuthError(error.message || 'Error consultando perfil de usuario');
        return;
      }

      if (data) {
        const ensuredCompanyId = await ensureCompanyForUser(data.id, data.display_name);
        setUser(data);
      } else {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          setAuthError(insertError.message || 'Error creando perfil de usuario');
        } else {
          const ensuredCompanyId = await ensureCompanyForUser(userId);
          // Create basic user object for new users
          const newUser = {
            id: userId,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            default_company_id: ensuredCompanyId
          };
          setUser(newUser as any);
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setAuthError(formatUnknownError(error, 'Error cargando perfil de usuario'));
    }
  };

  const signInAnonymous = async () => {
    if (signInAnonymousInFlightRef.current) {
      return signInAnonymousInFlightRef.current;
    }

    const now = Date.now();
    const COOLDOWN_MS = 15_000;
    if (now - lastAnonymousAttemptAtRef.current < COOLDOWN_MS) {
      return;
    }
    lastAnonymousAttemptAtRef.current = now;

    signInAnonymousInFlightRef.current = (async () => {
      try {
        console.log('Starting anonymous sign in...');
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error('Error signing in anonymously:', error);
          setAuthError(error.message || 'Error iniciando sesión anónima');
          return;
        }

        console.log('Anonymous sign in successful:', data);
        setAuthError(null);
      } catch (error) {
        console.error('Error in signInAnonymous:', error);
        setAuthError(formatUnknownError(error, 'Error iniciando sesión anónima'));
      } finally {
        signInAnonymousInFlightRef.current = null;
      }
    })();

    return signInAnonymousInFlightRef.current;
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error signing in with email:', error);
        throw error;
      }

      if (user) {
        await updateUserProfile({ lastLogin: new Date() });
      }
    } catch (error) {
      console.error('Error in signInWithEmail:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error('Error signing up with email:', error);
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email || userData.email,
            display_name: userData.displayName,
            company: userData.company,
            industry: userData.industry,
            interests: userData.interests,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error in signUpWithEmail:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!session?.user) throw new Error('No user logged in');
    
    try {
      const updateData: any = {};
      
      if (data.email) updateData.email = data.email;
      if (data.displayName) updateData.display_name = data.displayName;
      if (data.company) updateData.company = data.company;
      if (data.industry) updateData.industry = data.industry;
      if (data.interests) updateData.interests = data.interests;
      if (data.lastLogin) updateData.last_login = data.lastLogin.toISOString();

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      setAuthError(error instanceof Error ? error.message : 'Error actualizando perfil de usuario');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    authError,
    clearAuthError,
    signInAnonymous,
    signInWithMagicLink,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    signOut: logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
