"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { computeElapsedMs, formatDuration } from "@/lib/utils/timer";
import type { WidgetProps } from "@/lib/widgets/registry";
import type { TimerWidgetData } from "@/lib/types/workspace";

type Phase = "work" | "shortBreak" | "longBreak";

const PHASE_LABELS: Record<Phase, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function withDefaults(data: TimerWidgetData): TimerWidgetData {
  const pomodoro = data?.pomodoro ?? {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    phase: "work" as Phase,
    running: false,
  };
  const stopwatch = data?.stopwatch ?? { elapsedMs: 0, running: false };
  return {
    mode: data?.mode ?? "pomodoro",
    pomodoro: {
      workMinutes: pomodoro.workMinutes ?? 25,
      shortBreakMinutes: pomodoro.shortBreakMinutes ?? 5,
      longBreakMinutes: pomodoro.longBreakMinutes ?? 15,
      phase: pomodoro.phase ?? "work",
      remainingMs: pomodoro.remainingMs,
      running: pomodoro.running ?? false,
      startedAt: pomodoro.startedAt,
    },
    stopwatch: {
      elapsedMs: stopwatch.elapsedMs ?? 0,
      running: stopwatch.running ?? false,
      startedAt: stopwatch.startedAt,
    },
    soundEnabled: data?.soundEnabled ?? false,
  };
}

function phaseDurationMs(
  pomodoro: TimerWidgetData["pomodoro"],
  phase: Phase
): number {
  const minutes =
    phase === "work"
      ? pomodoro.workMinutes
      : phase === "shortBreak"
        ? pomodoro.shortBreakMinutes
        : pomodoro.longBreakMinutes;
  return Math.max(0, (minutes ?? 0) * 60 * 1000);
}

function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
    oscillator.onended = () => {
      try {
        ctx.close();
      } catch {
        /* noop */
      }
    };
  } catch {
    /* audio not available */
  }
}

export function TimerWidget({ widget }: WidgetProps) {
  const data = withDefaults(widget.data as TimerWidgetData);
  const updateWidgetData = useWorkspaceStore((s) => s.updateWidgetData);

  const { mode, pomodoro, stopwatch, soundEnabled } = data;

  const [, setTick] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");
  const completionHandledRef = React.useRef(false);

  const widgetIdRef = React.useRef(widget.id);
  widgetIdRef.current = widget.id;

  const persist = React.useCallback(
    (next: TimerWidgetData) => {
      updateWidgetData(widgetIdRef.current, next);
    },
    [updateWidgetData]
  );

  // Re-render loop while anything is running.
  const anyRunning = pomodoro.running || stopwatch.running;
  React.useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 250);
    return () => clearInterval(id);
  }, [anyRunning]);

  // Recompute on tab visibility change.
  React.useEffect(() => {
    const onVisible = () => setTick((t) => (t + 1) % 1_000_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // ----- Pomodoro -----
  const phase = pomodoro.phase;
  const phaseTotal = phaseDurationMs(pomodoro, phase);
  const baseRemaining =
    pomodoro.remainingMs !== undefined ? pomodoro.remainingMs : phaseTotal;
  const elapsedSinceStart =
    pomodoro.running && pomodoro.startedAt
      ? Math.max(0, Date.now() - new Date(pomodoro.startedAt).getTime())
      : 0;
  const pomodoroRemaining = Math.max(0, baseRemaining - elapsedSinceStart);

  const handlePomodoroComplete = React.useCallback(() => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;
    if (soundEnabled) playChime();
    setAnnouncement(`${PHASE_LABELS[phase]} session complete.`);
    persist({
      ...data,
      pomodoro: {
        ...pomodoro,
        running: false,
        startedAt: undefined,
        remainingMs: 0,
      },
    });
  }, [data, pomodoro, phase, soundEnabled, persist]);

  React.useEffect(() => {
    if (mode !== "pomodoro") return;
    if (pomodoro.running && pomodoroRemaining <= 0) {
      handlePomodoroComplete();
    }
  }, [mode, pomodoro.running, pomodoroRemaining, handlePomodoroComplete]);

  const startPomodoro = () => {
    completionHandledRef.current = false;
    const remaining = pomodoroRemaining > 0 ? pomodoroRemaining : phaseTotal;
    setAnnouncement("");
    persist({
      ...data,
      pomodoro: {
        ...pomodoro,
        running: true,
        startedAt: new Date().toISOString(),
        remainingMs: remaining,
      },
    });
  };

  const pausePomodoro = () => {
    persist({
      ...data,
      pomodoro: {
        ...pomodoro,
        running: false,
        startedAt: undefined,
        remainingMs: pomodoroRemaining,
      },
    });
  };

  const resetPomodoro = () => {
    completionHandledRef.current = false;
    setAnnouncement("");
    persist({
      ...data,
      pomodoro: {
        ...pomodoro,
        running: false,
        startedAt: undefined,
        remainingMs: phaseDurationMs(pomodoro, phase),
      },
    });
  };

  const changePhase = (nextPhase: Phase) => {
    completionHandledRef.current = false;
    setAnnouncement("");
    persist({
      ...data,
      pomodoro: {
        ...pomodoro,
        phase: nextPhase,
        running: false,
        startedAt: undefined,
        remainingMs: phaseDurationMs(pomodoro, nextPhase),
      },
    });
  };

  // ----- Stopwatch -----
  const stopwatchElapsed = computeElapsedMs(
    stopwatch.elapsedMs,
    stopwatch.running,
    stopwatch.startedAt
  );

  const startStopwatch = () => {
    persist({
      ...data,
      stopwatch: {
        ...stopwatch,
        running: true,
        startedAt: new Date().toISOString(),
        elapsedMs: stopwatch.elapsedMs,
      },
    });
  };

  const pauseStopwatch = () => {
    persist({
      ...data,
      stopwatch: {
        ...stopwatch,
        running: false,
        startedAt: undefined,
        elapsedMs: stopwatchElapsed,
      },
    });
  };

  const resetStopwatch = () => {
    persist({
      ...data,
      stopwatch: { elapsedMs: 0, running: false, startedAt: undefined },
    });
  };

  const toggleSound = () => {
    persist({ ...data, soundEnabled: !soundEnabled });
  };

  const setMode = (nextMode: string) => {
    if (nextMode !== "pomodoro" && nextMode !== "stopwatch") return;
    persist({ ...data, mode: nextMode });
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={mode} onValueChange={setMode} className="flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="pomodoro" className="flex-1">
              Pomodoro
            </TabsTrigger>
            <TabsTrigger value="stopwatch" className="flex-1">
              Stopwatch
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          aria-label={soundEnabled ? "Disable chime" : "Enable chime"}
          aria-pressed={soundEnabled}
          className="size-9 shrink-0"
        >
          {soundEnabled ? (
            <Volume2 className="size-4" />
          ) : (
            <VolumeX className="size-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {mode === "pomodoro" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
          <div className="flex gap-1.5">
            {(["work", "shortBreak", "longBreak"] as Phase[]).map((p) => (
              <Button
                key={p}
                type="button"
                variant={phase === p ? "secondary" : "ghost"}
                size="sm"
                onClick={() => changePhase(p)}
                className="text-xs"
              >
                {PHASE_LABELS[p]}
              </Button>
            ))}
          </div>

          <div
            className={cn(
              "font-mono text-4xl tabular-nums tracking-tight",
              pomodoroRemaining <= 0 && "text-muted-foreground"
            )}
          >
            {formatDuration(pomodoroRemaining)}
          </div>

          <div className="flex items-center gap-2">
            {pomodoro.running ? (
              <Button
                type="button"
                onClick={pausePomodoro}
                className="gap-1.5"
              >
                <Pause className="size-4" />
                Pause
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startPomodoro}
                className="gap-1.5"
              >
                <Play className="size-4" />
                Start
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={resetPomodoro}
              className="gap-1.5"
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
          <div className="font-mono text-4xl tabular-nums tracking-tight">
            {formatDuration(stopwatchElapsed)}
          </div>

          <div className="flex items-center gap-2">
            {stopwatch.running ? (
              <Button
                type="button"
                onClick={pauseStopwatch}
                className="gap-1.5"
              >
                <Pause className="size-4" />
                Pause
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startStopwatch}
                className="gap-1.5"
              >
                <Play className="size-4" />
                Start
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={resetStopwatch}
              className="gap-1.5"
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
