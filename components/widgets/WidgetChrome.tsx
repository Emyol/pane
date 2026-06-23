"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, MoreHorizontal } from "lucide-react";
import type { WidgetInstance } from "@/lib/types/workspace";
import { WIDGET_REGISTRY } from "@/lib/widgets/registry";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function WidgetChrome({ widget }: { widget: WidgetInstance }) {
  const editMode = useWorkspaceStore((s) => s.workspace.settings.editMode);
  const updateWidgetTitle = useWorkspaceStore((s) => s.updateWidgetTitle);
  const duplicateWidget = useWorkspaceStore((s) => s.duplicateWidget);
  const removeWidget = useWorkspaceStore((s) => s.removeWidget);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(widget.title);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingTitle]);

  const meta = WIDGET_REGISTRY[widget.type];

  function commitTitle() {
    const next = titleDraft.trim();
    if (next && next !== widget.title) {
      updateWidgetTitle(widget.id, next);
    } else {
      setTitleDraft(widget.title);
    }
    setEditingTitle(false);
  }

  const Component = meta?.component;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-[var(--color-surface)]">
      <div
        className={cn(
          "widget-drag-handle flex h-9 shrink-0 items-center gap-1 border-b px-2",
          editMode ? "cursor-move" : "cursor-default"
        )}
      >
        {editMode && (
          <GripVertical className="size-4 shrink-0 text-muted-foreground" />
        )}
        {editingTitle ? (
          <Input
            ref={inputRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTitle();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setTitleDraft(widget.title);
                setEditingTitle(false);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-7 flex-1 text-sm"
          />
        ) : (
          <span
            className="flex-1 truncate text-sm font-medium select-none"
            onDoubleClick={() => {
              setTitleDraft(widget.title);
              setEditingTitle(true);
            }}
            title="Double-click to rename"
          >
            {widget.title}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Widget options"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => duplicateWidget(widget.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmOpen(true)}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {Component ? (
          <Component widget={widget} />
        ) : (
          <p className="text-sm text-muted-foreground">Unknown widget</p>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove widget?</DialogTitle>
            <DialogDescription>
              This will remove “{widget.title}” from your workspace. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeWidget(widget.id);
                setConfirmOpen(false);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
