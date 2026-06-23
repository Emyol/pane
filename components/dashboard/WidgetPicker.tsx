"use client";

import { useMemo, useState } from "react";
import { WIDGET_REGISTRY, WIDGET_TYPES } from "@/lib/widgets/registry";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WidgetPicker({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addWidget = useWorkspaceStore((s) => s.addWidget);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WIDGET_TYPES;
    return WIDGET_TYPES.filter((type) => {
      const meta = WIDGET_REGISTRY[type];
      return (
        meta.label.toLowerCase().includes(q) ||
        meta.description.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a widget</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search widgets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex max-h-80 flex-col gap-1 overflow-auto">
          {results.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              No widgets found.
            </p>
          ) : (
            results.map((type) => {
              const meta = WIDGET_REGISTRY[type];
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    addWidget(type);
                    onOpenChange(false);
                    setQuery("");
                  }}
                  className="flex items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-[var(--color-muted)] focus-visible:bg-[var(--color-muted)] focus-visible:outline-none"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-muted)]">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {meta.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {meta.description}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
