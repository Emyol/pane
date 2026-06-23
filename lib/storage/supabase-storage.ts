import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageAdapter } from "./adapter";
import { createDefaultWorkspace } from "./create-default-workspace";
import type { Workspace } from "@/lib/types/workspace";

export function createSupabaseStorageAdapter(
  supabase: SupabaseClient
): StorageAdapter {
  return {
    async load(): Promise<Workspace> {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("workspaces")
        .select("payload, name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const workspace = createDefaultWorkspace();
        const { error: insertError } = await supabase
          .from("workspaces")
          .insert({ user_id: user.id, name: workspace.name, payload: workspace });
        if (insertError) throw insertError;
        return workspace;
      }

      const payload = data.payload as Workspace;
      if (!payload || !payload.version) return createDefaultWorkspace();
      return { ...payload, name: data.name ?? payload.name };
    },

    async save(workspace: Workspace): Promise<void> {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("workspaces")
        .update({
          payload: workspace,
          name: workspace.name,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
  };
}
