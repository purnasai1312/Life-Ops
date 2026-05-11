import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ProgressBar } from '@/components/progress-bar';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { Typo } from '@/components/typography';
import { Colors } from '@/constants/Theme';
import * as healthSync from '@/healthSync';
import type { HealthAvailability } from '@/healthSync/types';
import { getTodayISO, useAppStore } from '@/store/useAppStore';

type RangeMode = 'today' | '7' | '30';

const numberInput = {
  keyboardType: 'numeric' as const,
  returnKeyType: 'done' as const,
};

const kmToMeters = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 1000) : 0;
};

const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

const formatSyncTime = (value?: string) => {
  if (!value) return 'Not synced yet';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function ActivityScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const dailyActivity = useAppStore((state) => state.dailyActivity);
  const loadDailyActivity = useAppStore((state) => state.loadDailyActivity);
  const saveDailyActivity = useAppStore((state) => state.saveDailyActivity);
  const syncDailyActivity = useAppStore((state) => state.syncDailyActivity);
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [range, setRange] = useState<RangeMode>('today');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [manual, setManual] = useState({
    steps: '',
    caloriesBurned: '',
    activeMinutes: '',
    exerciseMinutes: '',
    distanceKm: '',
    workoutsCount: '',
  });

  const today = getTodayISO();
  const movementGoal = Math.max(1, Number(preferences.movementGoal) || 8000);

  useEffect(() => {
    let mounted = true;
    healthSync.isHealthSyncAvailable().then((next) => {
      if (mounted) setAvailability(next);
    });
    loadDailyActivity().catch(() => {});
    return () => {
      mounted = false;
    };
  }, [loadDailyActivity]);

  const todayActivity = useMemo(
    () => dailyActivity.find((item) => item.date === today),
    [dailyActivity, today]
  );

  const visibleActivity = useMemo(() => {
    if (range === 'today') return dailyActivity.filter((item) => item.date === today);
    const days = range === '7' ? 6 : 29;
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startISO = start.toISOString().slice(0, 10);
    return dailyActivity.filter((item) => item.date >= startISO);
  }, [dailyActivity, range, today]);

  const totals = useMemo(
    () =>
      visibleActivity.reduce(
        (sum, item) => ({
          steps: sum.steps + item.steps,
          caloriesBurned: sum.caloriesBurned + item.caloriesBurned,
          activeMinutes: sum.activeMinutes + item.activeMinutes,
          exerciseMinutes: sum.exerciseMinutes + item.exerciseMinutes,
          distanceMeters: sum.distanceMeters + item.distanceMeters,
          workoutsCount: sum.workoutsCount + item.workoutsCount,
        }),
        {
          steps: 0,
          caloriesBurned: 0,
          activeMinutes: 0,
          exerciseMinutes: 0,
          distanceMeters: 0,
          workoutsCount: 0,
        }
      ),
    [visibleActivity]
  );

  const requestPermissions = async () => {
    setLoading(true);
    setMessage(undefined);
    try {
      const result = await healthSync.requestHealthPermissions();
      setAvailability(result);
      setMessage(result.message);
    } finally {
      setLoading(false);
    }
  };

  const syncToday = async () => {
    setLoading(true);
    setMessage(undefined);
    try {
      const currentAvailability = availability ?? (await healthSync.isHealthSyncAvailable());
      if (!currentAvailability.available) {
        setAvailability(currentAvailability);
        setMessage('Native sync is unavailable in this build. Add today manually below.');
        return;
      }
      await syncDailyActivity(today);
      await loadDailyActivity();
      setMessage('Activity refreshed for today.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveManual = async () => {
    setLoading(true);
    setMessage(undefined);
    try {
      await saveDailyActivity({
        date: today,
        source: 'manual',
        steps: Number(manual.steps) || 0,
        caloriesBurned: Number(manual.caloriesBurned) || 0,
        activeMinutes: Number(manual.activeMinutes) || 0,
        exerciseMinutes: Number(manual.exerciseMinutes) || 0,
        distanceMeters: kmToMeters(manual.distanceKm),
        workoutsCount: Number(manual.workoutsCount) || 0,
        syncedAt: new Date().toISOString(),
      });
      setManual({
        steps: '',
        caloriesBurned: '',
        activeMinutes: '',
        exerciseMinutes: '',
        distanceKm: '',
        workoutsCount: '',
      });
      setMessage('Manual activity saved.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen topPadding={10}>
      <View style={{ gap: 10 }}>
        <Typo variant="eyebrow" color={Colors.accent}>
          Health Sync
        </Typo>
        <Typo variant="display">
          Activity, <Typo variant="display" color={Colors.accent}>connected.</Typo>
        </Typo>
        <Typo variant="body">
          Sync steps, calories burned, distance, workouts, heart rate, and sleep when health access is available.
        </Typo>
      </View>

      <Card padding={18} style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.bgElevated,
            }}
          >
            <Ionicons name="pulse-outline" size={22} color={Colors.inkSoft} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Typo variant="subheading">Health data</Typo>
          <Typo variant="caption">
              {availability?.available ? 'Health sync available' : 'Manual activity logging available'}
            </Typo>
          </View>
          <Typo variant="label" color={Colors.inkMuted}>
            {availability?.status ?? 'checking'}
          </Typo>
        </View>
        {availability?.message ? <Typo variant="caption">{availability.message}</Typo> : null}
        {message ? <Typo variant="caption" color={Colors.accent}>{message}</Typo> : null}
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button
            title="Connect"
            icon="link-outline"
            variant="secondary"
            size="sm"
            loading={loading}
            onPress={requestPermissions}
          />
          <Button
            title="Sync today"
            icon="sync-outline"
            size="sm"
            loading={loading}
            onPress={syncToday}
          />
        </View>
      </Card>

      <Card padding={20} style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Typo variant="eyebrow">Today</Typo>
            <Typo variant="title">Movement</Typo>
          </View>
          <Typo variant="heading">{Math.round(((todayActivity?.steps ?? 0) / movementGoal) * 100)}%</Typo>
        </View>
        <ProgressBar progress={((todayActivity?.steps ?? 0) / movementGoal) * 100} color={Colors.forest} height={9} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Metric label="Steps" value={`${todayActivity?.steps ?? 0}`} />
          <Metric label="Goal" value={`${movementGoal}`} />
          <Metric label="Burned" value={`${todayActivity?.caloriesBurned ?? 0} cal`} />
          <Metric label="Active" value={`${todayActivity?.activeMinutes ?? 0} min`} />
          <Metric label="Distance" value={formatDistance(todayActivity?.distanceMeters ?? 0)} />
          <Metric label="Workouts" value={`${todayActivity?.workoutsCount ?? 0}`} />
        </View>
        <Typo variant="caption">Last synced: {formatSyncTime(todayActivity?.syncedAt)}</Typo>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['today', '7', '30'] as RangeMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setRange(mode)}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: range === mode ? Colors.ink : Colors.surface,
              borderWidth: 1,
              borderColor: range === mode ? Colors.ink : Colors.border,
            }}
          >
            <Typo variant="bodyEmphasis" color={range === mode ? Colors.bgElevated : Colors.ink}>
              {mode === 'today' ? 'Today' : `${mode} days`}
            </Typo>
          </Pressable>
        ))}
      </View>

      <Card padding={18} style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Typo variant="subheading">{range === 'today' ? 'Today summary' : `${range}-day summary`}</Typo>
          <Typo variant="caption">{visibleActivity.length} entries</Typo>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Metric label="Steps" value={`${totals.steps}`} />
          <Metric label="Burned" value={`${totals.caloriesBurned} cal`} />
          <Metric label="Active" value={`${totals.activeMinutes} min`} />
          <Metric label="Exercise" value={`${totals.exerciseMinutes} min`} />
          <Metric label="Distance" value={formatDistance(totals.distanceMeters)} />
          <Metric label="Workouts" value={`${totals.workoutsCount}`} />
        </View>
        {visibleActivity.length === 0 ? (
          <Typo variant="body">No activity logged yet. Connect health data or add a manual entry for today.</Typo>
        ) : (
          visibleActivity.map((item) => (
            <View
              key={`${item.date}-${item.source}`}
              style={{
                borderTopWidth: 1,
                borderTopColor: Colors.borderSoft,
                paddingTop: 12,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Typo variant="bodyEmphasis">{item.date}</Typo>
                <Typo variant="caption">{item.source.replace('_', ' ')}</Typo>
              </View>
              <Typo variant="caption">
                {item.steps} steps · {item.caloriesBurned} cal · {item.activeMinutes} active min · {formatDistance(item.distanceMeters)}
              </Typo>
            </View>
          ))
        )}
      </Card>

      <Card padding={18} style={{ gap: 14 }}>
        <View style={{ gap: 4 }}>
          <Typo variant="subheading">Manual activity</Typo>
          <Typo variant="caption">Use this when health sync is unavailable or permissions are denied.</Typo>
        </View>
        <TextField label="Steps" value={manual.steps} onChangeText={(steps) => setManual((s) => ({ ...s, steps }))} {...numberInput} />
        <TextField label="Calories burned" value={manual.caloriesBurned} onChangeText={(caloriesBurned) => setManual((s) => ({ ...s, caloriesBurned }))} {...numberInput} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextField label="Active min" value={manual.activeMinutes} onChangeText={(activeMinutes) => setManual((s) => ({ ...s, activeMinutes }))} {...numberInput} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Exercise min" value={manual.exerciseMinutes} onChangeText={(exerciseMinutes) => setManual((s) => ({ ...s, exerciseMinutes }))} {...numberInput} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextField label="Distance km" value={manual.distanceKm} onChangeText={(distanceKm) => setManual((s) => ({ ...s, distanceKm }))} {...numberInput} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Workouts" value={manual.workoutsCount} onChangeText={(workoutsCount) => setManual((s) => ({ ...s, workoutsCount }))} {...numberInput} />
          </View>
        </View>
        <Button title="Save manual activity" icon="checkmark-circle-outline" onPress={saveManual} loading={loading} fullWidth />
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        minWidth: '30%',
        flexGrow: 1,
        borderRadius: 16,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.borderSoft,
        padding: 12,
        gap: 2,
      }}
    >
      <Typo variant="caption">{label}</Typo>
      <Typo variant="bodyEmphasis">{value}</Typo>
    </View>
  );
}
