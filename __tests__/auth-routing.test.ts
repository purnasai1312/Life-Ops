import { decidePostAuthRoute } from '@/utils/auth-routing';
import { safeLogoutFlow } from '@/utils/lifeops-logic';

describe('auth route decisions', () => {
  it('routes missing sessions to login', () => {
    expect(
      decidePostAuthRoute({
        hasSession: false,
        hasUser: false,
        onboardingComplete: false,
      })
    ).toBe('/(auth)/login');
  });

  it('routes incomplete authenticated users to onboarding', () => {
    expect(
      decidePostAuthRoute({
        hasSession: true,
        hasUser: true,
        onboardingComplete: false,
      })
    ).toBe('/onboarding');
  });

  it('routes completed authenticated users to tabs', () => {
    expect(
      decidePostAuthRoute({
        hasSession: true,
        hasUser: true,
        onboardingComplete: true,
      })
    ).toBe('/(tabs)');
  });

  it('routes missing profiles to onboarding for authenticated users', () => {
    expect(
      decidePostAuthRoute({
        hasSession: true,
        hasUser: true,
        onboardingComplete: false,
      })
    ).toBe('/onboarding');
  });

  it('treats expired or missing sessions during logout as successful cleanup', async () => {
    const clearLocal = jest.fn(() => Promise.resolve());
    await expect(
      safeLogoutFlow({
        getSession: () =>
          Promise.resolve({
            data: { session: null },
            error: { name: 'AuthSessionMissingError', message: 'Auth session missing' },
          }),
        signOut: jest.fn(),
        clearLocal,
      })
    ).resolves.toEqual({ session: null });
    expect(clearLocal).toHaveBeenCalledTimes(1);
  });
});
