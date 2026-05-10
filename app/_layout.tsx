import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { FontMap } from '@/constants/Typography';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { AuthProvider } from '@/lib/auth';
import { Colors } from '@/constants/Theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts(FontMap);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: Colors.bg }}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="auth/callback" />
              <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="modals/add-task"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="modals/add-habit"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="modals/add-goal"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack>
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
