import { useState } from 'react';
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { Typo } from '@/components/typography';
import { AuthInput } from '@/components/auth-input';
import { AuthColors, AuthRadii } from '@/constants/AuthTheme';
import { Fonts } from '@/constants/Typography';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetPassword, isLoading, pendingPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  const handleReset = async () => {
    setLocalError('');
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }
    try {
      await resetPassword(email.trim());
    } catch (e: any) {
      setLocalError(e?.message || 'Failed to send reset link');
    }
  };

  if (pendingPasswordReset) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: AuthColors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}
      >
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: AuthColors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Ionicons name="mail-open" size={28} color={AuthColors.accent} />
          </View>
          <Typo
            style={{
              fontFamily: Fonts.bold,
              fontSize: 22,
              color: AuthColors.text,
              textAlign: 'center',
            }}
          >
            Check your inbox
          </Typo>
          <Typo
            style={{
              fontFamily: Fonts.regular,
              fontSize: 15,
              color: AuthColors.textMuted,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            We sent password reset instructions to{'\n'}
            <Typo style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: AuthColors.text }}>
              {email}
            </Typo>
          </Typo>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => ({
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: AuthRadii.button,
              backgroundColor: AuthColors.button,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Typo style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: AuthColors.buttonText }}>
              Back to Sign In
            </Typo>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

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
              <Ionicons name="key" size={22} color={AuthColors.accent} />
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
              Reset password
            </Typo>
            <Typo
              style={{ fontFamily: Fonts.regular, fontSize: 15, color: AuthColors.textMuted, lineHeight: 22 }}
            >
              Enter your email and we&apos;ll send you a link to reset your password.
            </Typo>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 22 }}>
            <AuthInput
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={handleReset}
            />

            {/* Error */}
            {localError ? (
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
                  {localError}
                </Typo>
              </Animated.View>
            ) : null}

            {/* Submit */}
            <Pressable
              onPress={handleReset}
              disabled={isLoading}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: AuthRadii.button,
                backgroundColor: AuthColors.button,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.88 : isLoading ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              {isLoading ? (
                <ActivityIndicator color={AuthColors.buttonText} />
              ) : (
                <Typo
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 16,
                    color: AuthColors.buttonText,
                  }}
                >
                  Send Reset Link
                </Typo>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={{ alignSelf: 'center', paddingVertical: 12 }}
              hitSlop={8}
            >
              <Typo style={{ fontFamily: Fonts.regular, fontSize: 14, color: AuthColors.accent }}>
                Back to Sign In
              </Typo>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
