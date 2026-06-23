"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseStorageAdapter } from "@/lib/storage/supabase-storage";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ACCENT_HEX } from "@/components/dashboard/accent-map";
import { Button } from "@/components/ui/button";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const setAdapter = useWorkspaceStore((s) => s.setAdapter);
  const hydrate = useWorkspaceStore((s) => s.hydrate);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const supabase = createClient();
        const adapter = createSupabaseStorageAdapter(supabase);
        setAdapter(adapter);
        const workspace = await adapter.load();
        if (cancelled) return;
        hydrate(workspace);
        document.documentElement.style.setProperty(
          "--color-primary",
          ACCENT_HEX[workspace.settings.accent]
        );
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load your workspace."
        );
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [setAdapter, hydrate]);

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-background)] p-4">
        <div className="w-full max-w-sm space-y-4 rounded-lg border bg-[var(--color-surface)] p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
