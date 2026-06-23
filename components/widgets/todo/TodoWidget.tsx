"use client";

import * as React from "react";
import { nanoid } from "nanoid";
import { Trash2, Eye, EyeOff, CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { WidgetProps } from "@/lib/widgets/registry";
import type { TodoItem, TodoWidgetData } from "@/lib/types/workspace";

export function TodoWidget({ widget }: WidgetProps) {
  const data = widget.data as TodoWidgetData;
  const updateWidgetData = useWorkspaceStore((s) => s.updateWidgetData);

  const [draft, setDraft] = React.useState("");

  const items = data.items ?? [];
  const showCompleted = data.showCompleted ?? true;

  const remaining = items.filter((item) => !item.completed).length;
  const completedCount = items.length - remaining;

  const persist = React.useCallback(
    (nextItems: TodoItem[], nextShowCompleted = showCompleted) => {
      updateWidgetData(widget.id, {
        items: nextItems,
        showCompleted: nextShowCompleted,
      } satisfies TodoWidgetData);
    },
    [updateWidgetData, widget.id, showCompleted]
  );

  const addItem = () => {
    const text = draft.trim();
    if (!text) return;
    const newItem: TodoItem = {
      id: nanoid(),
      text,
      completed: false,
      order: items.length,
      createdAt: new Date().toISOString(),
    };
    persist([...items, newItem]);
    setDraft("");
  };

  const toggleItem = (id: string) => {
    persist(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    persist(items.filter((item) => item.id !== id));
  };

  const setDueDate = (id: string, value: string) => {
    persist(
      items.map((item) =>
        item.id === id
          ? { ...item, dueDate: value ? value : undefined }
          : item
      )
    );
  };

  const clearCompleted = () => {
    persist(items.filter((item) => !item.completed));
  };

  const toggleShowCompleted = () => {
    persist(items, !showCompleted);
  };

  const visibleItems = items
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((item) => (showCompleted ? true : !item.completed));

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {remaining} {remaining === 1 ? "task" : "tasks"} remaining
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleShowCompleted}
          aria-label={
            showCompleted ? "Hide completed tasks" : "Show completed tasks"
          }
          aria-pressed={!showCompleted}
          className="gap-1.5"
        >
          {showCompleted ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
          <span className="text-xs">
            {showCompleted ? "Hide done" : "Show done"}
          </span>
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task and press Enter"
          aria-label="New task"
        />
      </form>

      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {visibleItems.length === 0 ? (
          <li className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground">
            No tasks yet — add one above
          </li>
        ) : (
          visibleItems.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                aria-label={
                  item.completed
                    ? `Mark "${item.text}" as not done`
                    : `Mark "${item.text}" as done`
                }
                className="size-5"
              />
              <span
                className={cn(
                  "flex-1 truncate text-sm",
                  item.completed && "text-muted-foreground line-through"
                )}
              >
                {item.text}
              </span>

              <label className="relative inline-flex items-center">
                <span className="sr-only">Due date for {item.text}</span>
                <CalendarDays
                  className={cn(
                    "pointer-events-none size-4",
                    item.dueDate
                      ? "text-foreground"
                      : "text-muted-foreground/60"
                  )}
                  aria-hidden="true"
                />
                <input
                  type="date"
                  value={item.dueDate ? item.dueDate.slice(0, 10) : ""}
                  onChange={(e) => setDueDate(item.id, e.target.value)}
                  aria-label={`Set due date for ${item.text}`}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>

              {item.dueDate ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.dueDate.slice(5, 10)}
                </span>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.id)}
                aria-label={`Delete task "${item.text}"`}
                className="size-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))
        )}
      </ul>

      {completedCount > 0 ? (
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-xs text-muted-foreground">
            {completedCount} completed
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCompleted}
            className="text-xs"
          >
            Clear completed
          </Button>
        </div>
      ) : null}
    </div>
  );
}
