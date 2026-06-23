import { describe, it, expect, beforeEach } from "vitest";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { createDefaultWorkspace } from "@/lib/storage/create-default-workspace";

describe("workspace store", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      workspace: createDefaultWorkspace(),
      hydrated: true,
      adapter: null,
    });
  });

  it("addWidget appends layout item and widget instance", () => {
    useWorkspaceStore.getState().addWidget("todo");
    const { workspace } = useWorkspaceStore.getState();
    expect(workspace.layout).toHaveLength(1);
    expect(Object.keys(workspace.widgets)).toHaveLength(1);
    expect(workspace.widgets[workspace.layout[0].i].type).toBe("todo");
  });

  it("removeWidget removes from layout and widgets", () => {
    useWorkspaceStore.getState().addWidget("notes");
    const id = useWorkspaceStore.getState().workspace.layout[0].i;
    useWorkspaceStore.getState().removeWidget(id);
    expect(useWorkspaceStore.getState().workspace.layout).toHaveLength(0);
    expect(useWorkspaceStore.getState().workspace.widgets[id]).toBeUndefined();
  });

  it("toggleEditMode flips editMode", () => {
    expect(useWorkspaceStore.getState().workspace.settings.editMode).toBe(false);
    useWorkspaceStore.getState().toggleEditMode();
    expect(useWorkspaceStore.getState().workspace.settings.editMode).toBe(true);
  });
});
