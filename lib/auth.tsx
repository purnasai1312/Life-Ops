import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { AuthError, Provider, Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

type SignUpResult = {
  emailConfirmationRequired: boolean;
};

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | Error | null;
  pendingPasswordReset: boolean;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<SignUpResult>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | Error | null>(null);
  const [pendingPasswordReset, setPendingPasswordReset] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(sessionError);
      setSession(data.session);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const runAuth = async (action: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await action();
    } catch (authError) {
      setError(authError as AuthError | Error);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await runAuth(async () => {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    });
  };

  const signUpWithEmail = async (email: string, password: string) => {
    let emailConfirmationRequired = false;
    await runAuth(async () => {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      emailConfirmationRequired = !data.session;
    });
    return { emailConfirmationRequired };
  };

  const signInWithOAuth = async (provider: Provider) => {
    await runAuth(async () => {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (oauthError) throw oauthError;
      if (!data.url) throw new Error('Unable to start OAuth sign in.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return;

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        result.url
      );
      if (exchangeError) throw exchangeError;
    });
  };

  const resetPassword = async (email: string) => {
    await runAuth(async () => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Linking.createURL('auth/callback'),
      });
      if (resetError) throw resetError;
      setPendingPasswordReset(true);
    });
  };

  const signOut = async () => {
    await runAuth(async () => {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isLoading,
      error,
      pendingPasswordReset,
      clearError: () => setError(null),
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle: () => signInWithOAuth('google'),
      signInWithApple: () => signInWithOAuth('apple'),
      resetPassword,
      signOut,
    }),
    [error, isLoading, pendingPasswordReset, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
