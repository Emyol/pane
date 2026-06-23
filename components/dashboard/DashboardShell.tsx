"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { GridCanvas } from "@/components/dashboard/GridCanvas";
import { WidgetPicker } from "@/components/dashboard/WidgetPicker";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { WorkspaceMenu } from "@/components/dashboard/WorkspaceMenu";
import { KeyboardShortcuts } from "@/components/dashboard/KeyboardShortcuts";

export function DashboardShell() {
  const router = useRouter();

  const name = useWorkspaceStore((s) => s.workspace.name);
  const layoutCount = useWorkspaceStore((s) => s.workspace.layout.length);
  const editMode = useWorkspaceStore((s) => s.workspace.settings.editMode);
  const setWorkspaceName = useWorkspaceStore((s) => s.setWorkspaceName);
  const toggleEditMode = useWorkspaceStore((s) => s.toggleEditMode);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  function commitName() {
    const next = nameDraft.trim();
    if (next && next !== name) {
      setWorkspaceName(next);
    } else {
      setNameDraft(name);
    }
    setEditingName(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-dvh bg-[var(--color-background)]">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-[var(--color-surface)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-base font-semibold">Pane</span>
          <span className="text-muted-foreground">/</span>
          {editingName ? (
            <Input
              ref={nameInputRef}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitName();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setNameDraft(name);
                  setEditingName(false);
                }
              }}
              className="h-8 w-48 text-sm"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setNameDraft(name);
                setEditingName(true);
              }}
              className="truncate rounded px-1 text-sm font-medium hover:bg-[var(--color-muted)]"
              title="Click to rename workspace"
            >
              {name}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={toggleEditMode}>
            {editMode ? "Done" : "Edit"}
          </Button>
          <ThemeToggle />
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="size-4" />
            Widget
          </Button>
          <WorkspaceMenu />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {editMode && (
        <div
          className={cn(
            "border-b bg-[var(--color-muted)] px-4 py-1.5 text-center text-xs text-muted-foreground"
          )}
        >
          Editing layout — drag widgets by their header, resize from the corner.
        </div>
      )}

      <main className="p-4">
        {layoutCount === 0 ? (
          <EmptyState onAddWidget={() => setPickerOpen(true)} />
        ) : (
          <GridCanvas />
        )}
      </main>

      <KeyboardShortcuts onOpenPicker={() => setPickerOpen(true)} />
      <WidgetPicker open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
}
