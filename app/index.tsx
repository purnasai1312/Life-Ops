import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, DisplayFont } from '@/constants/Theme';
import { Typo } from '@/components/typography';
import { useAuth } from '@/lib/auth';
import { getPostAuthRedirect } from '@/lib/auth-routing';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SplashScreen() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [redirect, setRedirect] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  }, [pulse, rotation]);

  useEffect(() => {
    // Wait for auth to finish loading before deciding route
    if (authLoading) return;

    const t = setTimeout(() => {
      if (!isAuthenticated) {
        // Not logged in → go to login
        setRedirect('/(auth)/login');
      } else {
        getPostAuthRedirect()
          .then((nextRoute) => setRedirect(nextRoute))
          .catch(() => setRedirect('/(auth)/login'));
      }
    }, 1600);
    return () => clearTimeout(t);
  }, [isAuthenticated, authLoading, user?.id]);

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulsingStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.5,
    transform: [{ scale: 1 + pulse.value * 0.1 }],
  }));

  if (redirect) {
    return <Redirect href={redirect as any} />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Animated.View style={[{ position: 'absolute' }, rotatingStyle]}>
        <Svg width={340} height={340} viewBox="0 0 340 340">
          <Circle
            cx={170}
            cy={170}
            r={160}
            stroke={Colors.border}
            strokeWidth={1}
            fill="none"
          />
          <Circle
            cx={170}
            cy={170}
            r={120}
            stroke={Colors.border}
            strokeWidth={1}
            strokeDasharray="2 6"
            fill="none"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * Math.PI) / 6;
            const x1 = 170 + Math.cos(angle) * 150;
            const y1 = 170 + Math.sin(angle) * 150;
            const x2 = 170 + Math.cos(angle) * 160;
            const y2 = 170 + Math.sin(angle) * 160;
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={Colors.divider}
                strokeWidth={1}
              />
            );
          })}
          <AnimatedCircle
            cx={170}
            cy={170}
            r={76}
            stroke={Colors.accent}
            strokeWidth={1.5}
            fill="none"
          />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: Colors.accentSoft,
          },
          pulsingStyle,
        ]}
      />

      <Animated.View
        entering={FadeIn.duration(700)}
        style={{ alignItems: 'center', gap: 8 }}
      >
        <Typo variant="eyebrow" color={Colors.accent}>
          · LifeOps ·
        </Typo>
        <Typo
          style={{
            fontFamily: DisplayFont,
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -1.5,
            color: Colors.ink,
            fontStyle: 'italic',
          }}
        >
          Orient
        </Typo>
        <Typo
          variant="body"
          color={Colors.inkMuted}
          align="center"
          style={{ maxWidth: 260, marginTop: 4 }}
        >
          A quiet companion for the habits, goals, and days that make a life.
        </Typo>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(600).duration(600)}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 48,
          alignItems: 'center',
          gap: 4,
        }}
      >
        <View
          style={{
            width: 36,
            height: 2,
            backgroundColor: Colors.accent,
            marginBottom: 8,
          }}
        />
        <Typo variant="eyebrow" color={Colors.inkMuted}>
          Loading your day
        </Typo>
      </Animated.View>
    </View>
  );
}
