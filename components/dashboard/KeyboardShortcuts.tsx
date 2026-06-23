"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: "/", description: "Add a widget" },
  { keys: "E", description: "Toggle edit mode" },
  { keys: "Esc", description: "Exit edit mode" },
  { keys: "?", description: "Show this help" },
];

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function KeyboardShortcuts({
  onOpenPicker,
}: {
  onOpenPicker: () => void;
}) {
  const toggleEditMode = useWorkspaceStore((s) => s.toggleEditMode);
  const setEditMode = useWorkspaceStore((s) => s.setEditMode);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        onOpenPicker();
      } else if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
      } else if (event.key === "Escape") {
        setEditMode(false);
      } else if (event.key === "e" || event.key === "E") {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        event.preventDefault();
        toggleEditMode();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenPicker, toggleEditMode, setEditMode]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these shortcuts.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.keys}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="rounded border bg-[var(--color-muted)] px-2 py-0.5 font-mono text-xs">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
