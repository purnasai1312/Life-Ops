import { View } from 'react-native';
import { Colors } from '@/constants/Theme';
import { Typo } from './typography';

type Props = {
  title: string;
  items: string[];
};

export function RecipeInstructionList({ title, items }: Props) {
  return (
    <View style={{ gap: 10 }}>
      <Typo variant="eyebrow" color={Colors.inkMuted}>
        {title}
      </Typo>
      <View style={{ gap: 8 }}>
        {items.map((item, index) => (
          <View key={`${title}-${index}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Typo variant="caption" color={Colors.inkMuted}>
                {index + 1}
              </Typo>
            </View>
            <Typo variant="body" style={{ flex: 1 }}>
              {item}
            </Typo>
          </View>
        ))}
      </View>
    </View>
  );
}
