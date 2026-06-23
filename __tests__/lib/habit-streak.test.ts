import { describe, it, expect } from "vitest";
import { calculateStreak, formatDateKey } from "@/lib/utils/habit-streak";
import { addDays } from "date-fns";

describe("calculateStreak", () => {
  it("counts three consecutive days ending today", () => {
    const today = new Date(2026, 5, 23); // June 23, 2026
    const completions: Record<string, boolean> = {
      [formatDateKey(today)]: true,
      [formatDateKey(addDays(today, -1))]: true,
      [formatDateKey(addDays(today, -2))]: true,
    };
    const { current, best } = calculateStreak(completions, today);
    expect(current).toBeGreaterThanOrEqual(3);
    expect(best).toBeGreaterThanOrEqual(3);
  });

  it("handles a gap, breaking the current streak", () => {
    const today = new Date(2026, 5, 23);
    const completions: Record<string, boolean> = {
      // Older run of 3 consecutive days (the best streak).
      [formatDateKey(addDays(today, -6))]: true,
      [formatDateKey(addDays(today, -5))]: true,
      [formatDateKey(addDays(today, -4))]: true,
      // Gap on -3, -2.
      // Only today is completed -> current streak of 1.
      [formatDateKey(today)]: true,
    };
    const { current, best } = calculateStreak(completions, today);
    expect(current).toBe(1);
    expect(best).toBe(3);
  });

  it("returns zero when nothing is completed", () => {
    const today = new Date(2026, 5, 23);
    expect(calculateStreak({}, today)).toEqual({ current: 0, best: 0 });
  });
});
