import { describe, it, expect } from "vitest";
import { computeElapsedMs } from "@/lib/utils/timer";

describe("computeElapsedMs", () => {
  it("adds delta from startedAt when running", () => {
    const startedAt = new Date(Date.now() - 5000).toISOString();
    const result = computeElapsedMs(1000, true, startedAt);
    expect(result).toBeGreaterThanOrEqual(6000);
  });
  it("returns base when not running", () => {
    expect(computeElapsedMs(1000, false)).toBe(1000);
  });
});
