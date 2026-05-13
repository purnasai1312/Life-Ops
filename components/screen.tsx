import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Theme';

interface ScreenProps extends ScrollViewProps {
  withTabBar?: boolean;
  topPadding?: number;
  bottomPadding?: number;
  horizontalPadding?: number;
}

export function Screen({
  children,
  contentContainerStyle,
  withTabBar = true,
  topPadding = 8,
  bottomPadding,
  horizontalPadding = 20,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomExtra = bottomPadding ?? (withTabBar ? 84 : 36);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: Colors.bg }}
    >
      <ScrollView
        {...rest}
        style={[{ flex: 1, backgroundColor: Colors.bg }, rest.style]}
        alwaysBounceVertical
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingTop: insets.top + topPadding,
            paddingBottom: insets.bottom + bottomExtra,
            paddingHorizontal: horizontalPadding,
            gap: 20,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
