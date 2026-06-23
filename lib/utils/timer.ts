export function computeElapsedMs(
  baseMs: number,
  running: boolean,
  startedAt?: string
): number {
  const safeBase = Number.isFinite(baseMs) ? baseMs : 0;
  if (running && startedAt) {
    const started = new Date(startedAt).getTime();
    if (!Number.isFinite(started)) return safeBase;
    return safeBase + (Date.now() - started);
  }
  return safeBase;
}

export function formatDuration(ms: number): string {
  const clamped = Math.max(0, Number.isFinite(ms) ? ms : 0);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}
