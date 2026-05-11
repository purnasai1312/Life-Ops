import * as AuthSession from 'expo-auth-session';
import { useAppStore } from '@/store/useAppStore';

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
  try {
    await useAppStore.getState().loadProfile();
    const preferences = useAppStore.getState().preferences;
    const complete =
      preferences.hasCompletedOnboarding &&
      Boolean(preferences.name?.trim()) &&
      Boolean(preferences.goal) &&
      Boolean(preferences.workoutPreferences?.length || preferences.workoutPreference) &&
      Boolean(preferences.experienceLevel) &&
      Boolean(preferences.calorieTarget) &&
      Boolean(preferences.proteinTarget);

    return complete ? '/(tabs)' : '/onboarding';
  } catch {
    return '/onboarding';
  }
};
