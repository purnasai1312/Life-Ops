import { Tabs } from 'expo-router';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Radii } from '@/constants/Theme';
import { Typo } from '@/components/typography';

const TABS: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'index', label: 'Today', icon: 'sunny-outline', iconActive: 'sunny' },
  { name: 'meals', label: 'Meals', icon: 'restaurant-outline', iconActive: 'restaurant' },
  { name: 'workouts', label: 'Workouts', icon: 'barbell-outline', iconActive: 'barbell' },
  { name: 'activity', label: 'Activity', icon: 'pulse-outline', iconActive: 'pulse' },
  { name: 'goals', label: 'Goals', icon: 'telescope-outline', iconActive: 'telescope' },
  { name: 'reflect', label: 'Reflect', icon: 'moon-outline', iconActive: 'moon' },
  { name: 'profile', label: 'Profile', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={({ state, navigation }) => (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 10,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.ink,
              borderRadius: Radii.pill,
              paddingHorizontal: 6,
              paddingVertical: 6,
              gap: 2,
              width: '100%',
              maxWidth: 420,
              justifyContent: 'space-between',
              boxShadow: '0 14px 34px rgba(20,19,17,0.22)',
              borderCurve: 'continuous',
            }}
          >
            {state.routes.map((route, i) => {
              const tab = TABS.find((t) => t.name === route.name);
              if (!tab) return null;
              const isFocused = state.index === i;
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
                if (Platform.OS === 'ios') {
                  Haptics.selectionAsync().catch(() => {});
                }
              };
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel={tab.label}
                  style={({ pressed }) => ({
                    minHeight: 48,
                    minWidth: isFocused ? 52 : 42,
                    paddingHorizontal: isFocused ? 10 : 6,
                    paddingVertical: 10,
                    borderRadius: Radii.pill,
                    backgroundColor: isFocused ? Colors.bgElevated : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Ionicons
                    name={isFocused ? tab.iconActive : tab.icon}
                      size={17}
                    color={isFocused ? Colors.ink : Colors.inkFaint}
                  />
                  {isFocused ? (
                    <Typo
                      variant="bodyEmphasis"
                      color={Colors.ink}
                      style={{ fontSize: 11, letterSpacing: 0 }}
                    >
                      {tab.label}
                    </Typo>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
      <Tabs.Screen name="habits" options={{ href: null }} />
    </Tabs>
  );
}
