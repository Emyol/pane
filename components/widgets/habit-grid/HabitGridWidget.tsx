"use client";

import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  format,
  getDay,
  isSameDay,
  isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight, Check, Flame, Trophy } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import {
  calculateStreak,
  formatDateKey,
} from "@/lib/utils/habit-streak";
import type { WidgetProps } from "@/lib/widgets/registry";
import type { HabitGridWidgetData } from "@/lib/types/workspace";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function HabitGridWidget({ widget }: WidgetProps) {
  const data = widget.data as HabitGridWidgetData;
  const updateWidgetData = useWorkspaceStore((s) => s.updateWidgetData);

  const completions = data.completions ?? {};
  const [name, setName] = React.useState(data.habitName ?? "My Habit");
  const [displayMonth, setDisplayMonth] = React.useState(() =>
    startOfMonth(new Date())
  );

  const widgetIdRef = React.useRef(widget.id);
  widgetIdRef.current = widget.id;

  const persist = React.useCallback(
    (next: HabitGridWidgetData) => {
      updateWidgetData(widgetIdRef.current, next);
    },
    [updateWidgetData]
  );

  const commitName = () => {
    const trimmed = name.trim() || "My Habit";
    if (trimmed !== data.habitName) {
      persist({ habitName: trimmed, completions });
    }
  };

  const toggleDay = (day: Date) => {
    const key = formatDateKey(day);
    const next = { ...completions };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = true;
    }
    persist({ habitName: data.habitName ?? name, completions: next });
  };

  const today = new Date();
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = getDay(monthStart);

  const { current, best } = calculateStreak(completions, today);

  return (
    <div className="flex h-full flex-col gap-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        aria-label="Habit name"
        className="h-8 border-transparent px-1 text-base font-semibold shadow-none hover:border-input focus-visible:border-ring"
      />

      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Flame className="size-3.5 text-[var(--color-accent)]" aria-hidden="true" />
          Current: <strong className="text-foreground">{current}</strong>
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Trophy className="size-3.5" aria-hidden="true" />
          Best: <strong className="text-foreground">{best}</strong>
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setDisplayMonth((m) => addMonths(m, -1))}
          aria-label="Previous month"
          className="size-9"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(displayMonth, "MMMM yyyy")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setDisplayMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          className="size-9"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-[0.65rem] font-medium text-muted-foreground"
            aria-hidden="true"
          >
            {wd}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 gap-1 overflow-y-auto">
        {days.map((day) => {
          const key = formatDateKey(day);
          const completed = Boolean(completions[key]);
          const isToday = isSameDay(day, today);
          const isFuture = isAfter(day, today);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={completed}
              aria-label={`${format(day, "MMMM d")}, ${
                completed ? "completed" : "not completed"
              }`}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-md border text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                completed
                  ? "border-transparent bg-[var(--color-accent)] text-white"
                  : "border-input text-muted-foreground hover:bg-accent/50",
                isToday && !completed && "ring-1 ring-[var(--color-accent)]",
                isFuture && "opacity-50"
              )}
            >
              <span className={cn(completed && "sr-only")}>
                {format(day, "d")}
              </span>
              {completed ? (
                <Check className="size-4" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
