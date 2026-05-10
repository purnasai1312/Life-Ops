export const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayISO = (): string => toISO(new Date());

export const formatLongDate = (d: Date = new Date()): string => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
};

export const formatShortDate = (iso: string): string => {
  const [y, m, day] = iso.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const daysUntil = (iso?: string): number | null => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
  return diff;
};

export const lastNDates = (n: number): string[] => {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const copy = new Date(d);
    copy.setDate(d.getDate() - i);
    out.push(toISO(copy));
  }
  return out;
};

export const dayLetter = (iso: string): string => {
  const [y, m, day] = iso.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
};

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 5) return 'Still awake';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Winding down';
};
