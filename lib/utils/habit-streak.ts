import { addDays, format, parseISO, differenceInCalendarDays } from "date-fns";

export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function calculateStreak(
  completions: Record<string, boolean>,
  today: Date = new Date()
): { current: number; best: number } {
  const completedKeys = Object.keys(completions ?? {}).filter(
    (key) => completions[key]
  );

  if (completedKeys.length === 0) {
    return { current: 0, best: 0 };
  }

  const completedSet = new Set(completedKeys);

  // Current streak: count back from today while completed. If today is not
  // completed yet, allow the streak to start from yesterday.
  let current = 0;
  let cursor = today;
  if (!completedSet.has(formatDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (completedSet.has(formatDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  // Best streak: longest run of consecutive completed days anywhere.
  const sortedDates = completedKeys
    .map((key) => parseISO(key))
    .sort((a, b) => a.getTime() - b.getTime());

  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const date of sortedDates) {
    if (prev && differenceInCalendarDays(date, prev) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = date;
  }

  return { current, best };
}
