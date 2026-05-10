import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Theme';

export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    const completeCallback = async () => {
      if (url) {
        await supabase.auth.exchangeCodeForSession(url).catch(() => {});
      }
      router.replace('/onboarding');
    };

    completeCallback();
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
