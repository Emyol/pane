import type { Workspace } from "@/lib/types/workspace";

export interface StorageAdapter {
  load(): Promise<Workspace>;
  save(workspace: Workspace): Promise<void>;
}
