import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import type { AuthError, Provider, Session, User } from '@supabase/supabase-js';
import { getOAuthRedirectUri } from './auth-routing';
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
  developerResetSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isAuthSessionMissingError = (error: unknown) => {
  const name = (error as { name?: string } | null)?.name ?? '';
  const message = (error as { message?: string } | null)?.message ?? '';
  return name === 'AuthSessionMissingError' || /auth session missing/i.test(message);
};

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
      const redirectTo = getOAuthRedirectUri();
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
      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Sign in was cancelled.');
      }
      if (result.type !== 'success') {
        throw new Error('Sign in did not complete. Please try again.');
      }

      const fragment = result.url.includes('#') ? result.url.split('#')[1] : '';
      const hashParams = new URLSearchParams(fragment);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) throw setSessionError;
        setSession(sessionData.session);
        return;
      }

      const { data: sessionData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(result.url);
      if (exchangeError) throw exchangeError;
      setSession(sessionData.session);
    });
  };

  const signInWithApple = async () => {
    await runAuth(async () => {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple sign in is available on iOS devices.');
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple sign in is not available on this device.');
      }

      let credential: AppleAuthentication.AppleAuthenticationCredential;
      try {
        credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
      } catch (appleError) {
        if ((appleError as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
          throw new Error('Apple sign in was cancelled.');
        }
        throw new Error('Apple sign in failed. Please try again.');
      }

      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token. Please try again.');
      }

      const { data, error: appleSignInError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (appleSignInError) throw appleSignInError;
      setSession(data.session);

      const userId = data.user?.id;
      if (!userId) return;

      const appleName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      const email = credential.email ?? data.user.email ?? null;

      if (appleName || email) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: userId,
            email,
            name: appleName || data.user.user_metadata?.name || null,
          },
          { onConflict: 'id' }
        );
        if (profileError) {
          if (__DEV__) console.info('[Auth] Unable to save Apple profile details:', profileError.message);
        }
      }
    });
  };

  const resetPassword = async (email: string) => {
    await runAuth(async () => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getOAuthRedirectUri(),
      });
      if (resetError) throw resetError;
      setPendingPasswordReset(true);
    });
  };

  const clearLocalAuthState = async (clearAllStorage: boolean) => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError && !isAuthSessionMissingError(sessionError)) {
      if (__DEV__) console.info('[Auth] getSession before logout failed:', sessionError.message);
    }

    if (data?.session) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError && !isAuthSessionMissingError(signOutError)) {
        throw signOutError;
      }
      if (__DEV__ && signOutError) {
        console.info('[Auth] signOut treated as successful:', signOutError.message);
      }
    } else if (__DEV__) {
      console.info('[Auth] logout skipped remote signOut because session is already missing.');
    }

    if (clearAllStorage) {
      await AsyncStorage.clear();
    }
    setSession(null);
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await clearLocalAuthState(false);
    } catch (authError) {
      if (isAuthSessionMissingError(authError)) {
        if (__DEV__) console.info('[Auth] missing session during logout treated as success.');
        setSession(null);
        return;
      }
      setError(authError as AuthError | Error);
      if (__DEV__) console.info('[Auth] logout failed:', (authError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const developerResetSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await clearLocalAuthState(true);
    } catch (authError) {
      if (isAuthSessionMissingError(authError)) {
        if (__DEV__) console.info('[Auth] missing session during developer reset treated as success.');
        await AsyncStorage.clear();
        setSession(null);
        return;
      }
      setError(authError as AuthError | Error);
      if (__DEV__) console.info('[Auth] developer reset failed:', (authError as Error).message);
    } finally {
      setIsLoading(false);
    }
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
      signInWithApple,
      resetPassword,
      signOut,
      developerResetSession,
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
