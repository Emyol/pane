import { nanoid } from "nanoid";
import type { Workspace } from "@/lib/types/workspace";

export function createDefaultWorkspace(): Workspace {
  return {
    version: 1,
    id: nanoid(),
    name: "My Workspace",
    settings: { theme: "light", accent: "blue", editMode: false },
    layout: [],
    widgets: {},
  };
}
