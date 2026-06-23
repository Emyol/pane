"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { WidgetProps } from "@/lib/widgets/registry";
import type { NotesWidgetData } from "@/lib/types/workspace";

const SAVE_DELAY_MS = 500;

export function NotesWidget({ widget }: WidgetProps) {
  const data = widget.data as NotesWidgetData;
  const updateWidgetData = useWorkspaceStore((s) => s.updateWidgetData);

  const [content, setContent] = React.useState(data.content ?? "");
  const [saved, setSaved] = React.useState(true);

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const widgetIdRef = React.useRef(widget.id);
  widgetIdRef.current = widget.id;

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const next = e.target.value;
    setContent(next);
    setSaved(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateWidgetData(widgetIdRef.current, {
        content: next,
        lastEditedAt: new Date().toISOString(),
      } satisfies NotesWidgetData);
      setSaved(true);
    }, SAVE_DELAY_MS);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing…"
        spellCheck
        aria-label={`Notes for ${widget.title}`}
        className="min-h-0 flex-1 w-full resize-none rounded-md border border-input bg-transparent p-3 text-sm leading-relaxed shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {content.length} {content.length === 1 ? "character" : "characters"}
        </span>
        <span className="inline-flex items-center gap-1" aria-live="polite">
          {saved ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              Saved
            </>
          ) : (
            <>
              <Loader2
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
              Saving…
            </>
          )}
        </span>
      </div>
    </div>
  );
}
