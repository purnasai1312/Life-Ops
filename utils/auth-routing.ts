export type AuthRouteDecisionInput = {
  hasSession: boolean;
  hasUser: boolean;
  onboardingComplete: boolean;
};

export const decidePostAuthRoute = ({
  hasSession,
  hasUser,
  onboardingComplete,
}: AuthRouteDecisionInput) => {
  if (!hasSession || !hasUser) return '/(auth)/login';
  return onboardingComplete ? '/(tabs)' : '/onboarding';
};
