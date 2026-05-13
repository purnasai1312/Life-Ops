import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Theme';
import type { WorkoutStep } from '@/utils/suggestions';
import { Typo } from './typography';
import { StepTimer } from './step-timer';
import { SuggestionVisualPlaceholder } from './suggestion-visual-placeholder';

type Props = {
  steps: WorkoutStep[];
  checkedIds: string[];
  onToggle: (stepId: string) => void;
};

export function WorkoutStepChecklist({ steps, checkedIds, onToggle }: Props) {
  return (
    <View style={{ gap: 12 }}>
      {steps.map((step, index) => {
        const checked = checkedIds.includes(step.id);
        const seconds = step.durationSeconds ?? step.restSeconds;
        return (
          <View
            key={step.id}
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: Colors.bgElevated,
              borderRadius: 20,
              padding: 14,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => onToggle(step.id)}
                hitSlop={8}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  borderWidth: 1.5,
                  borderColor: checked ? Colors.forest : Colors.border,
                  backgroundColor: checked ? Colors.forest : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                {checked ? <Ionicons name="checkmark" size={18} color={Colors.bgElevated} /> : null}
              </Pressable>
              <View style={{ flex: 1, gap: 5 }}>
                <Typo variant="caption" color={Colors.inkMuted}>
                  Step {index + 1}
                </Typo>
                <Typo variant="bodyEmphasis">{step.name}</Typo>
                <Typo variant="body">{step.instruction}</Typo>
                <Typo variant="caption" color={Colors.inkMuted}>
                  {formatStepPrescription(step)}
                </Typo>
                {seconds ? <StepTimer seconds={seconds} /> : null}
              </View>
            </View>
            <SuggestionVisualPlaceholder label="Instruction preview" icon={iconForStep(step)} />
          </View>
        );
      })}
    </View>
  );
}

function formatStepPrescription(step: WorkoutStep) {
  if (step.type === 'reps') return `${step.sets ?? 1} sets · ${step.reps ?? 1} reps`;
  if (step.type === 'rest') return `${step.restSeconds ?? step.durationSeconds ?? 30} sec rest`;
  if (step.type === 'hold') return `${step.durationSeconds ?? 30} sec hold`;
  return `${Math.round((step.durationSeconds ?? 60) / 60)} min`;
}

function iconForStep(step: WorkoutStep): keyof typeof Ionicons.glyphMap {
  if (step.type === 'rest') return 'pause-circle-outline';
  if (step.type === 'hold') return 'body-outline';
  if (step.type === 'duration') return 'timer-outline';
  return 'barbell-outline';
}
