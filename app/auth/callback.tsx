import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Theme';
import { getPostAuthRedirect } from '@/lib/auth-routing';

export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    let mounted = true;
    const completeCallback = async () => {
      const callbackUrl = url ?? (await Linking.getInitialURL());
      if (!callbackUrl) {
        throw new Error('Missing OAuth callback URL.');
      }
      if (callbackUrl) {
        const fragment = callbackUrl.includes('#') ? callbackUrl.split('#')[1] : '';
        const hashParams = new URLSearchParams(fragment);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else {
          await supabase.auth.exchangeCodeForSession(callbackUrl);
        }
      }
      if (mounted) router.replace((await getPostAuthRedirect()) as any);
    };

    completeCallback().catch(() => {
      if (mounted) router.replace('/(auth)/login');
    });
    return () => {
      mounted = false;
    };
  }, [router, url]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bg,
      }}
    >
      <ActivityIndicator color={Colors.ink} />
    </View>
  );
}
