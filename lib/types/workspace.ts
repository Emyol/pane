export type WidgetType = "todo" | "timer" | "notes" | "habit-grid";

export type ThemeSetting = "light" | "dark" | "system";
export type AccentPreset =
  | "blue"
  | "teal"
  | "purple"
  | "orange"
  | "rose"
  | "gray";

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  order: number;
  createdAt: string;
}

export interface TodoWidgetData {
  items: TodoItem[];
  showCompleted: boolean;
}

export interface TimerWidgetData {
  mode: "pomodoro" | "stopwatch";
  pomodoro: {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    phase: "work" | "shortBreak" | "longBreak";
    remainingMs?: number;
    running: boolean;
    startedAt?: string;
  };
  stopwatch: {
    elapsedMs: number;
    running: boolean;
    startedAt?: string;
  };
  soundEnabled: boolean;
}

export interface NotesWidgetData {
  content: string;
  lastEditedAt: string;
}

export interface HabitGridWidgetData {
  habitName: string;
  completions: Record<string, boolean>;
}

export type WidgetData =
  | TodoWidgetData
  | TimerWidgetData
  | NotesWidgetData
  | HabitGridWidgetData;

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  data: WidgetData;
}

export interface WorkspaceSettings {
  theme: ThemeSetting;
  accent: AccentPreset;
  editMode: boolean;
}

export interface Workspace {
  version: 1;
  id: string;
  name: string;
  settings: WorkspaceSettings;
  layout: LayoutItem[];
  widgets: Record<string, WidgetInstance>;
}
