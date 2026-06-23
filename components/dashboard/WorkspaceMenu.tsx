"use client";

import { useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { Download, Settings, Upload } from "lucide-react";
import { toast } from "sonner";
import type { AccentPreset, Workspace } from "@/lib/types/workspace";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { parseWorkspace } from "@/lib/storage/workspace-schema";
import { ACCENT_HEX, ACCENT_PRESETS } from "@/components/dashboard/accent-map";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

const ACCENT_LABELS: Record<AccentPreset, string> = {
  blue: "Blue",
  teal: "Teal",
  purple: "Purple",
  orange: "Orange",
  rose: "Rose",
  gray: "Gray",
};

export function WorkspaceMenu() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const activeAccent = useWorkspaceStore((s) => s.workspace.settings.accent);
  const setAccent = useWorkspaceStore((s) => s.setAccent);
  const importWorkspace = useWorkspaceStore((s) => s.importWorkspace);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Workspace | null>(null);

  function handleExport() {
    const json = JSON.stringify(workspace, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "workspace-backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseWorkspace(JSON.parse(text));
      setPendingImport(parsed);
    } catch {
      toast.error("Invalid backup file. Could not import workspace.");
    }
  }

  function applyAccent(accent: AccentPreset) {
    setAccent(accent);
    document.documentElement.style.setProperty(
      "--color-primary",
      ACCENT_HEX[accent]
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Workspace menu">
            <Settings className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={handleExport}>
            <Download className="size-4" />
            Export backup
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <Upload className="size-4" />
            Import backup
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Accent</DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1 p-1">
            {ACCENT_PRESETS.map((accent) => (
              <button
                key={accent}
                type="button"
                aria-label={ACCENT_LABELS[accent]}
                title={ACCENT_LABELS[accent]}
                onClick={() => applyAccent(accent)}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md border transition-all",
                  activeAccent === accent
                    ? "ring-2 ring-offset-1 ring-offset-[var(--color-surface)]"
                    : "hover:scale-105"
                )}
                style={
                  {
                    backgroundColor: ACCENT_HEX[accent],
                    ["--tw-ring-color" as string]: ACCENT_HEX[accent],
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import workspace?</DialogTitle>
            <DialogDescription>
              This will replace your current workspace with the contents of the
              backup file. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingImport(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingImport) {
                  importWorkspace(pendingImport);
                  document.documentElement.style.setProperty(
                    "--color-primary",
                    ACCENT_HEX[pendingImport.settings.accent]
                  );
                  toast.success("Workspace imported.");
                }
                setPendingImport(null);
              }}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
