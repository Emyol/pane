import dynamic from "next/dynamic";
import {
  CheckSquare,
  Timer as TimerIcon,
  StickyNote,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";
import type {
  WidgetType,
  WidgetData,
  WidgetInstance,
} from "@/lib/types/workspace";
import type { ComponentType } from "react";

export interface WidgetProps {
  widget: WidgetInstance;
}

export interface WidgetMeta {
  type: WidgetType;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultSize: { x: number; y: number; w: number; h: number };
  minSize: { w: number; h: number };
  createDefaultData: () => WidgetData;
  component: ComponentType<WidgetProps>;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetMeta> = {
  todo: {
    type: "todo",
    label: "Todo",
    description: "Checklists with due dates",
    icon: CheckSquare,
    defaultSize: { x: 0, y: 0, w: 4, h: 5 },
    minSize: { w: 3, h: 3 },
    createDefaultData: () => ({ items: [], showCompleted: true }),
    component: dynamic(() =>
      import("@/components/widgets/todo/TodoWidget").then((m) => m.TodoWidget)
    ),
  },
  timer: {
    type: "timer",
    label: "Timer",
    description: "Pomodoro & stopwatch",
    icon: TimerIcon,
    defaultSize: { x: 0, y: 0, w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    createDefaultData: () => ({
      mode: "pomodoro",
      pomodoro: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        phase: "work",
        remainingMs: 25 * 60 * 1000,
        running: false,
      },
      stopwatch: { elapsedMs: 0, running: false },
      soundEnabled: false,
    }),
    component: dynamic(() =>
      import("@/components/widgets/timer/TimerWidget").then(
        (m) => m.TimerWidget
      )
    ),
  },
  notes: {
    type: "notes",
    label: "Notes",
    description: "Auto-saving text area",
    icon: StickyNote,
    defaultSize: { x: 0, y: 0, w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    createDefaultData: () => ({
      content: "",
      lastEditedAt: new Date().toISOString(),
    }),
    component: dynamic(() =>
      import("@/components/widgets/notes/NotesWidget").then(
        (m) => m.NotesWidget
      )
    ),
  },
  "habit-grid": {
    type: "habit-grid",
    label: "Habit Grid",
    description: "Monthly completion grid",
    icon: Grid3x3,
    defaultSize: { x: 0, y: 0, w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    createDefaultData: () => ({ habitName: "My Habit", completions: {} }),
    component: dynamic(() =>
      import("@/components/widgets/habit-grid/HabitGridWidget").then(
        (m) => m.HabitGridWidget
      )
    ),
  },
};

export const WIDGET_TYPES = Object.keys(WIDGET_REGISTRY) as WidgetType[];
