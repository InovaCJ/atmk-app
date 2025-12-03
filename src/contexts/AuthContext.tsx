import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from '@posthog/react'

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const posthog = usePostHog();


  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Handle navigation after auth state changes
        if (session?.user) {
          posthog?.identify(session.user.email, {
            email: session.user.email,
          });
          posthog?.capture('User Logged In');
          // User is logged in
          const currentPath = window.location.pathname;

          // If user is on auth page, redirect to dashboard
          if (currentPath === '/auth') {
            navigate('/');
          }
        } else {
          // User is logged out - only redirect if not on allowed public pages
          const currentPath = window.location.pathname;
          const allowedPaths = ['/auth'];
          posthog?.reset();

          if (!allowedPaths.includes(currentPath)) {
            navigate('/auth');
          }
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // If no session, redirect to auth
        if (!session) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/auth') {
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      posthog?.reset();
      posthog?.capture('User Signed Out');
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};