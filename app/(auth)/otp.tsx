import { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typo } from '@/components/typography';
import { AuthInput } from '@/components/auth-input';
import { AuthColors, AuthRadii } from '@/constants/AuthTheme';
import { Fonts } from '@/constants/Typography';
import { supabase } from '@/lib/supabase';

export default function OTPScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string; mode: string }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [hasSent, setHasSent] = useState(false);

  useEffect(() => {
    if (!hasSent) {
      setHasSent(true);
      sendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSent]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendOTP = async () => {
    setSending(true);
    setError('');
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phone || '',
      });
      if (otpError) throw otpError;
      setCountdown(60);
    } catch (e: any) {
      setError(e?.message || 'Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone || '',
        token: otp,
        type: 'sms',
      });
      if (verifyError) throw verifyError;
      router.replace('/onboarding');
    } catch (e: any) {
      setError(e?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: AuthColors.bg }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 24,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(auth)/login');
              }
            }}
            hitSlop={12}
            style={{
              marginBottom: 32,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: AuthColors.card,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: AuthColors.border,
            }}
          >
            <Ionicons name="arrow-back" size={18} color={AuthColors.textSoft} />
          </Pressable>

          <Animated.View entering={FadeIn.duration(500)} style={{ gap: 12, marginBottom: 36 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: AuthColors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={22} color={AuthColors.accent} />
            </View>
            <Typo
              style={{
                fontFamily: Fonts.bold,
                fontSize: 24,
                lineHeight: 30,
                letterSpacing: -0.3,
                color: AuthColors.text,
              }}
            >
              Verify your phone
            </Typo>
            <Typo
              style={{ fontFamily: Fonts.regular, fontSize: 15, color: AuthColors.textMuted }}
            >
              We sent a 6-digit code to{' '}
              <Typo style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: AuthColors.text }}>
                {phone}
              </Typo>
            </Typo>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 22 }}>
            <AuthInput
              label="Verification Code"
              icon="keypad-outline"
              placeholder="000000"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="go"
              onSubmitEditing={verifyOTP}
              style={{ fontSize: 20, letterSpacing: 6, textAlign: 'center' }}
            />

            {/* Error */}
            {error ? (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: AuthColors.errorSoft,
                  borderRadius: AuthRadii.card,
                  borderWidth: 1,
                  borderColor: 'rgba(184, 63, 43, 0.12)',
                }}
              >
                <Ionicons name="alert-circle" size={16} color={AuthColors.error} />
                <Typo
                  style={{ fontFamily: Fonts.regular, fontSize: 13, color: AuthColors.error, flex: 1 }}
                  selectable
                >
                  {error}
                </Typo>
              </Animated.View>
            ) : null}

            {/* Verify Button */}
            <Pressable
              onPress={verifyOTP}
              disabled={loading || sending}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: AuthRadii.button,
                backgroundColor: AuthColors.button,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.88 : (loading || sending) ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              {loading ? (
                <ActivityIndicator color={AuthColors.buttonText} />
              ) : (
                <Typo
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 16,
                    color: AuthColors.buttonText,
                  }}
                >
                  Verify Code
                </Typo>
              )}
            </Pressable>

            {/* Resend */}
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              {countdown > 0 ? (
                <Typo style={{ fontFamily: Fonts.regular, fontSize: 14, color: AuthColors.textMuted }}>
                  Resend code in{' '}
                  <Typo style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: AuthColors.textSoft, fontVariant: ['tabular-nums'] }}>
                    {countdown}s
                  </Typo>
                </Typo>
              ) : (
                <Pressable onPress={sendOTP} disabled={sending} hitSlop={8}>
                  <Typo style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: AuthColors.accent }}>
                    Resend Code
                  </Typo>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
