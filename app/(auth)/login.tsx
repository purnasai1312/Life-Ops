import { useState } from 'react';
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { getPostAuthRedirect } from '@/lib/auth-routing';

type AuthMethod = 'email' | 'phone';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleEmailLogin = async () => {
    setLocalError('');
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }
    try {
      await signInWithEmail(email.trim(), password);
      router.replace((await getPostAuthRedirect()) as any);
    } catch (e: any) {
      setLocalError(e?.message || 'Sign in failed. Please try again.');
    }
  };

  const handlePhoneLogin = async () => {
    setLocalError('');
    if (!phone.trim()) {
      setLocalError('Please enter your phone number');
      return;
    }
    router.push({ pathname: '/(auth)/otp', params: { phone: phone.trim(), mode: 'login' } });
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    clearError();
    try {
      await signInWithGoogle();
      router.replace((await getPostAuthRedirect()) as any);
    } catch (e: any) {
      setLocalError(e?.message || 'Google sign in failed. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    setLocalError('');
    clearError();
    try {
      await signInWithApple();
      router.replace((await getPostAuthRedirect()) as any);
    } catch (e: any) {
      setLocalError(e?.message || 'Apple sign in failed. Please try again.');
    }
  };

  const displayError = localError || error?.message || '';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: AuthColors.bg }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={{ marginBottom: 36 }}
          >
            <Typo
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: AuthColors.accent,
                marginBottom: 14,
              }}
            >
              WELCOME BACK
            </Typo>
            <Typo
              style={{
                fontFamily: Fonts.bold,
                fontSize: 28,
                lineHeight: 34,
                letterSpacing: -0.4,
                color: AuthColors.text,
              }}
            >
              Sign in to your account
            </Typo>
            <Typo
              style={{
                fontFamily: Fonts.regular,
                fontSize: 15,
                color: AuthColors.textMuted,
                marginTop: 8,
              }}
            >
              Pick up where you left off.
            </Typo>
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={{ gap: 12, marginBottom: 28 }}
          >
            <Pressable
              onPress={handleGoogleLogin}
              disabled={isLoading}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                height: 52,
                borderRadius: AuthRadii.button,
                backgroundColor: AuthColors.card,
                borderWidth: 1,
                borderColor: AuthColors.border,
                opacity: pressed ? 0.8 : isLoading ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              {isLoading ? (
                <ActivityIndicator color={AuthColors.text} />
              ) : (
                <>
                  <Typo style={{ fontFamily: Fonts.bold, fontSize: 16, color: AuthColors.text }}>
                    G
                  </Typo>
                  <Typo style={{ fontFamily: Fonts.medium, fontSize: 15, color: AuthColors.text }}>
                    Continue with Google
                  </Typo>
                </>
              )}
            </Pressable>

            {Platform.OS === 'ios' ? (
              <Pressable
                onPress={handleAppleLogin}
                disabled={isLoading}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  height: 52,
                  borderRadius: AuthRadii.button,
                  backgroundColor: AuthColors.card,
                  borderWidth: 1,
                  borderColor: AuthColors.border,
                  opacity: pressed ? 0.8 : isLoading ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                {isLoading ? (
                  <ActivityIndicator color={AuthColors.text} />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={18} color={AuthColors.text} />
                    <Typo style={{ fontFamily: Fonts.medium, fontSize: 15, color: AuthColors.text }}>
                      Continue with Apple
                    </Typo>
                  </>
                )}
              </Pressable>
            ) : null}
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(180).duration(500)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: AuthColors.divider }} />
            <Typo
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                color: AuthColors.textMuted,
                paddingHorizontal: 18,
              }}
            >
              or
            </Typo>
            <View style={{ flex: 1, height: 1, backgroundColor: AuthColors.divider }} />
          </Animated.View>

          {/* Method Toggle */}
          <Animated.View
            entering={FadeInDown.delay(240).duration(500)}
            style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: 24,
            }}
          >
            <Pressable
              onPress={() => { setMethod('email'); setLocalError(''); }}
              style={{
                flex: 1,
                paddingVertical: 11,
                borderRadius: AuthRadii.toggle,
                backgroundColor: method === 'email' ? AuthColors.card : 'transparent',
                alignItems: 'center',
                borderWidth: method === 'email' ? 1 : 0,
                borderColor: AuthColors.border,
              }}
            >
              <Typo
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 14,
                  color: method === 'email' ? AuthColors.text : AuthColors.textMuted,
                }}
              >
                Email
              </Typo>
            </Pressable>
            <Pressable
              onPress={() => { setMethod('phone'); setLocalError(''); }}
              style={{
                flex: 1,
                paddingVertical: 11,
                borderRadius: AuthRadii.toggle,
                backgroundColor: method === 'phone' ? AuthColors.card : 'transparent',
                alignItems: 'center',
                borderWidth: method === 'phone' ? 1 : 0,
                borderColor: AuthColors.border,
              }}
            >
              <Typo
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 14,
                  color: method === 'phone' ? AuthColors.text : AuthColors.textMuted,
                }}
              >
                Phone
              </Typo>
            </Pressable>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={{ gap: 18 }}
          >
            {method === 'email' ? (
              <>
                <AuthInput
                  label="Email"
                  icon="mail-outline"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />

                <AuthInput
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleEmailLogin}
                />

                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={{ alignSelf: 'flex-end', paddingVertical: 2 }}
                >
                  <Typo
                    style={{
                      fontFamily: Fonts.semiBold,
                      fontSize: 14,
                      color: AuthColors.accent,
                    }}
                  >
                    Forgot password?
                  </Typo>
                </Pressable>
              </>
            ) : (
              <AuthInput
                label="Phone Number"
                icon="call-outline"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                returnKeyType="go"
                onSubmitEditing={handlePhoneLogin}
              />
            )}

            {/* Error Message */}
            {displayError ? (
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
                  {displayError}
                </Typo>
              </Animated.View>
            ) : null}

            {/* Submit Button */}
            <Pressable
              onPress={method === 'email' ? handleEmailLogin : handlePhoneLogin}
              disabled={isLoading}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: AuthRadii.button,
                backgroundColor: AuthColors.button,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
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
                  {method === 'email' ? 'Sign In' : 'Send Code'}
                </Typo>
              )}
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
              <Typo style={{ fontFamily: Fonts.regular, fontSize: 14, color: AuthColors.textMuted }}>
                Don&apos;t have an account?{' '}
                <Typo
                  style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: AuthColors.accent }}
                >
                  Sign Up
                </Typo>
              </Typo>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
