"use client";

import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onAddWidget }: { onAddWidget: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-muted)]">
        <LayoutGrid className="size-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Your workspace is empty.</p>
      <Button onClick={onAddWidget}>Add your first widget</Button>
    </div>
  );
}
