import { z } from "zod";
import type { Workspace } from "@/lib/types/workspace";

const themeSchema = z.enum(["light", "dark", "system"]);
const accentSchema = z.enum(["blue", "teal", "purple", "orange", "rose", "gray"]);
const widgetTypeSchema = z.enum([
  "todo",
  "timer",
  "notes",
  "habit-grid",
  "budget",
  "bill-splitter",
]);

const layoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
});

const widgetInstanceSchema = z.object({
  id: z.string(),
  type: widgetTypeSchema,
  title: z.string(),
  data: z.any(),
});

export const workspaceSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  name: z.string(),
  settings: z.object({
    theme: themeSchema,
    accent: accentSchema,
    editMode: z.boolean(),
  }),
  layout: z.array(layoutItemSchema),
  widgets: z.record(z.string(), widgetInstanceSchema),
});

export function parseWorkspace(input: unknown): Workspace {
  return workspaceSchema.parse(input) as Workspace;
}
