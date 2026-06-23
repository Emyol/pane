import { create } from "zustand";
import { nanoid } from "nanoid";
import { WIDGET_REGISTRY } from "@/lib/widgets/registry";
import { createDefaultWorkspace } from "@/lib/storage/create-default-workspace";
import { debounce } from "@/lib/utils/debounce";
import type { StorageAdapter } from "@/lib/storage/adapter";
import type {
  AccentPreset,
  LayoutItem,
  ThemeSetting,
  WidgetData,
  WidgetType,
  Workspace,
} from "@/lib/types/workspace";

interface WorkspaceState {
  workspace: Workspace;
  hydrated: boolean;
  adapter: StorageAdapter | null;
  setAdapter: (adapter: StorageAdapter) => void;
  hydrate: (workspace: Workspace) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  updateWidgetData: (id: string, data: WidgetData) => void;
  updateWidgetTitle: (id: string, title: string) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
  setWorkspaceName: (name: string) => void;
  setTheme: (theme: ThemeSetting) => void;
  setAccent: (accent: AccentPreset) => void;
  importWorkspace: (workspace: Workspace) => void;
}

const debouncedSave = debounce((adapter: StorageAdapter, workspace: Workspace) => {
  adapter.save(workspace).catch(console.error);
}, 300);

function persist(get: () => WorkspaceState): void {
  const { adapter, workspace } = get();
  if (adapter) {
    debouncedSave(adapter, workspace);
  }
}

function bottomY(layout: LayoutItem[]): number {
  if (layout.length === 0) return 0;
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: createDefaultWorkspace(),
  hydrated: false,
  adapter: null,

  setAdapter: (adapter) => set({ adapter }),

  hydrate: (workspace) => set({ workspace, hydrated: true }),

  addWidget: (type) => {
    const meta = WIDGET_REGISTRY[type];
    const id = nanoid();
    set((state) => {
      const y = bottomY(state.workspace.layout);
      const layoutItem: LayoutItem = {
        i: id,
        x: meta.defaultSize.x,
        y,
        w: meta.defaultSize.w,
        h: meta.defaultSize.h,
        minW: meta.minSize.w,
        minH: meta.minSize.h,
      };
      return {
        workspace: {
          ...state.workspace,
          layout: [...state.workspace.layout, layoutItem],
          widgets: {
            ...state.workspace.widgets,
            [id]: {
              id,
              type,
              title: meta.label,
              data: meta.createDefaultData(),
            },
          },
        },
      };
    });
    persist(get);
  },

  removeWidget: (id) => {
    set((state) => {
      const widgets = { ...state.workspace.widgets };
      delete widgets[id];
      return {
        workspace: {
          ...state.workspace,
          layout: state.workspace.layout.filter((item) => item.i !== id),
          widgets,
        },
      };
    });
    persist(get);
  },

  duplicateWidget: (id) => {
    const { workspace } = get();
    const original = workspace.widgets[id];
    if (!original) return;
    const sourceLayout = workspace.layout.find((item) => item.i === id);
    const newId = nanoid();
    set((state) => {
      const y = bottomY(state.workspace.layout);
      const layoutItem: LayoutItem = {
        i: newId,
        x: sourceLayout?.x ?? WIDGET_REGISTRY[original.type].defaultSize.x,
        y,
        w: sourceLayout?.w ?? WIDGET_REGISTRY[original.type].defaultSize.w,
        h: sourceLayout?.h ?? WIDGET_REGISTRY[original.type].defaultSize.h,
        minW: sourceLayout?.minW ?? WIDGET_REGISTRY[original.type].minSize.w,
        minH: sourceLayout?.minH ?? WIDGET_REGISTRY[original.type].minSize.h,
      };
      const cloned = {
        ...structuredClone(original),
        id: newId,
      };
      return {
        workspace: {
          ...state.workspace,
          layout: [...state.workspace.layout, layoutItem],
          widgets: {
            ...state.workspace.widgets,
            [newId]: cloned,
          },
        },
      };
    });
    persist(get);
  },

  updateWidgetData: (id, data) => {
    set((state) => {
      const widget = state.workspace.widgets[id];
      if (!widget) return state;
      return {
        workspace: {
          ...state.workspace,
          widgets: {
            ...state.workspace.widgets,
            [id]: { ...widget, data },
          },
        },
      };
    });
    persist(get);
  },

  updateWidgetTitle: (id, title) => {
    set((state) => {
      const widget = state.workspace.widgets[id];
      if (!widget) return state;
      return {
        workspace: {
          ...state.workspace,
          widgets: {
            ...state.workspace.widgets,
            [id]: { ...widget, title },
          },
        },
      };
    });
    persist(get);
  },

  updateLayout: (layout) => {
    set((state) => ({
      workspace: { ...state.workspace, layout },
    }));
    persist(get);
  },

  toggleEditMode: () => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        settings: {
          ...state.workspace.settings,
          editMode: !state.workspace.settings.editMode,
        },
      },
    }));
    persist(get);
  },

  setEditMode: (value) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        settings: { ...state.workspace.settings, editMode: value },
      },
    }));
    persist(get);
  },

  setWorkspaceName: (name) => {
    set((state) => ({
      workspace: { ...state.workspace, name },
    }));
    persist(get);
  },

  setTheme: (theme) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        settings: { ...state.workspace.settings, theme },
      },
    }));
    persist(get);
  },

  setAccent: (accent) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        settings: { ...state.workspace.settings, accent },
      },
    }));
    persist(get);
  },

  importWorkspace: (workspace) => {
    set({ workspace, hydrated: true });
    const { adapter } = get();
    if (adapter) {
      adapter.save(workspace).catch(console.error);
    }
  },
}));
