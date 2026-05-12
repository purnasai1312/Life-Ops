import * as AuthSession from 'expo-auth-session';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from './supabase';

export const getOAuthRedirectUri = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    path: 'auth/callback',
  });

  if (!redirectUri || !redirectUri.includes('auth/callback')) {
    throw new Error('OAuth redirect is not configured correctly.');
  }

  if (__DEV__) {
    console.info('[Auth] OAuth redirect URI:', redirectUri);
  }

  return redirectUri;
};

export const getPostAuthRedirect = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    if (__DEV__) {
      console.info('[Auth routing] no valid session', sessionError?.message);
    }
    return '/(auth)/login';
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    if (__DEV__) {
      console.info('[Auth routing] no valid user', userError?.message);
    }
    return '/(auth)/login';
  }

  const userId = userData.user.id;
  if (__DEV__) {
    console.info('[Auth routing] session user id:', userId);
  }

  let onboardingComplete = false;
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id,has_completed_onboarding')
      .eq('id', userId)
      .maybeSingle();
    if (profileError) throw profileError;
    onboardingComplete = !!profile?.has_completed_onboarding;
  } catch (error) {
    if (__DEV__) {
      console.info('[Auth routing] profile onboarding check failed:', (error as Error).message);
    }
  }

  if (!onboardingComplete) {
    try {
      const { data: onboarding, error: onboardingError } = await supabase
        .from('onboarding')
        .select('completed_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (onboardingError) throw onboardingError;
      onboardingComplete = !!onboarding?.completed_at;
    } catch (error) {
      if (__DEV__) {
        console.info('[Auth routing] onboarding table check failed:', (error as Error).message);
      }
    }
  }

  if (__DEV__) {
    console.info('[Auth routing] onboarding_complete value:', onboardingComplete);
  }

  await useAppStore.getState().loadProfile().catch((error) => {
    if (__DEV__) {
      console.info('[Auth routing] local profile refresh failed:', (error as Error).message);
    }
  });

  const route = onboardingComplete ? '/(tabs)' : '/onboarding';
  if (__DEV__) {
    console.info('[Auth routing] final route decision:', route);
  }
  return route;
};
