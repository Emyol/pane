"use client";

import { useMemo } from "react";
import {
  Responsive,
  WidthProvider,
  type Layout,
} from "react-grid-layout";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { LayoutItem } from "@/lib/types/workspace";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";

const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

export function GridCanvas() {
  const layout = useWorkspaceStore((s) => s.workspace.layout);
  const widgets = useWorkspaceStore((s) => s.workspace.widgets);
  const editMode = useWorkspaceStore((s) => s.workspace.settings.editMode);
  const updateLayout = useWorkspaceStore((s) => s.updateLayout);

  const layouts = useMemo(() => ({ lg: layout as Layout[] }), [layout]);

  function handleLayoutChange(current: Layout[]) {
    if (!editMode) return;
    const next: LayoutItem[] = current.map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW,
      minH: item.minH,
    }));
    updateLayout(next);
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={64}
      margin={[16, 16]}
      isDraggable={editMode}
      isResizable={editMode}
      draggableHandle=".widget-drag-handle"
      compactType="vertical"
      useCSSTransforms
      onLayoutChange={handleLayoutChange}
    >
      {layout.map((item) => {
        const widget = widgets[item.i];
        if (!widget) return null;
        return (
          <div key={item.i}>
            <WidgetChrome widget={widget} />
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
