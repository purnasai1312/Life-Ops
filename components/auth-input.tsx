import { View, TextInput, TextInputProps, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Typo } from './typography';
import { AuthColors, AuthRadii } from '@/constants/AuthTheme';
import { Fonts } from '@/constants/Typography';

interface AuthInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({
  label,
  icon,
  error,
  isPassword,
  style,
  ...rest
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? AuthColors.error
    : focused
      ? AuthColors.borderFocus
      : AuthColors.border;

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Typo
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 14,
            color: AuthColors.text,
          }}
        >
          {label}
        </Typo>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          borderRadius: AuthRadii.input,
          backgroundColor: AuthColors.card,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: 16,
          gap: 12,
          borderCurve: 'continuous',
        }}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={AuthColors.textFaint}
          />
        ) : null}
        <TextInput
          {...rest}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={AuthColors.textFaint}
          style={[
            {
              flex: 1,
              fontFamily: Fonts.regular,
              fontSize: 15,
              color: AuthColors.text,
              paddingVertical: 14,
            },
            style,
          ]}
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AuthColors.textFaint}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Typo style={{ fontFamily: Fonts.regular, fontSize: 12, color: AuthColors.error }}>
          {error}
        </Typo>
      ) : null}
    </View>
  );
}
