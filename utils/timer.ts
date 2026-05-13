export type TimerState = {
  remainingSeconds: number;
  isRunning: boolean;
  initialSeconds: number;
};

export type TimerAction =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'tick' };

export const createTimerState = (seconds: number): TimerState => ({
  remainingSeconds: Math.max(0, Math.round(seconds)),
  initialSeconds: Math.max(0, Math.round(seconds)),
  isRunning: false,
});

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'start':
      return state.remainingSeconds > 0 ? { ...state, isRunning: true } : state;
    case 'pause':
      return { ...state, isRunning: false };
    case 'reset':
      return { ...state, remainingSeconds: state.initialSeconds, isRunning: false };
    case 'tick': {
      if (!state.isRunning) return state;
      const remainingSeconds = Math.max(0, state.remainingSeconds - 1);
      return { ...state, remainingSeconds, isRunning: remainingSeconds > 0 };
    }
    default:
      return state;
  }
}

export function formatTimer(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}
