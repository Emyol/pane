"use client";

import * as React from "react";
import { nanoid } from "nanoid";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { WidgetProps } from "@/lib/widgets/registry";
import type {
  BudgetEntry,
  BudgetEntryType,
  BudgetWidgetData,
} from "@/lib/types/workspace";
import { CURRENCY_OPTIONS, formatCurrency, parseAmount } from "@/lib/utils/currency";

export function BudgetWidget({ widget }: WidgetProps) {
  const data = widget.data as BudgetWidgetData;
  const updateWidgetData = useWorkspaceStore((s) => s.updateWidgetData);

  const currency = data.currency ?? "$";
  const entries = React.useMemo(() => data.entries ?? [], [data.entries]);
  const monthlyBudget = data.monthlyBudget;

  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [entryType, setEntryType] = React.useState<BudgetEntryType>("expense");

  const totals = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const entry of entries) {
      if (entry.type === "income") income += entry.amount;
      else expense += entry.amount;
    }
    return { income, expense, balance: income - expense };
  }, [entries]);

  const persist = React.useCallback(
    (next: Partial<BudgetWidgetData>) => {
      updateWidgetData(widget.id, {
        currency,
        monthlyBudget,
        entries,
        ...next,
      } satisfies BudgetWidgetData);
    },
    [updateWidgetData, widget.id, currency, monthlyBudget, entries]
  );

  const addEntry = () => {
    const desc = description.trim();
    const value = parseAmount(amount);
    if (!desc || value <= 0) return;
    const newEntry: BudgetEntry = {
      id: nanoid(),
      description: desc,
      amount: value,
      type: entryType,
      category: entryType === "income" ? "Income" : "Expense",
      createdAt: new Date().toISOString(),
    };
    persist({ entries: [newEntry, ...entries] });
    setDescription("");
    setAmount("");
  };

  const deleteEntry = (id: string) => {
    persist({ entries: entries.filter((entry) => entry.id !== id) });
  };

  const setCurrency = (symbol: string) => {
    persist({ currency: symbol });
  };

  const setMonthlyBudget = (value: string) => {
    const parsed = value.trim() === "" ? undefined : parseAmount(value);
    persist({ monthlyBudget: parsed });
  };

  const budgetUsedPct =
    monthlyBudget && monthlyBudget > 0
      ? Math.min(100, (totals.expense / monthlyBudget) * 100)
      : null;
  const overBudget =
    monthlyBudget !== undefined && totals.expense > monthlyBudget;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-accent/40 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Income
          </p>
          <p className="truncate text-sm font-semibold text-[var(--color-accent)] tabular-nums">
            {formatCurrency(totals.income, currency)}
          </p>
        </div>
        <div className="rounded-md bg-accent/40 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Expenses
          </p>
          <p className="truncate text-sm font-semibold text-destructive tabular-nums">
            {formatCurrency(totals.expense, currency)}
          </p>
        </div>
        <div className="rounded-md bg-accent/40 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Balance
          </p>
          <p
            className={cn(
              "truncate text-sm font-semibold tabular-nums",
              totals.balance < 0 ? "text-destructive" : "text-foreground"
            )}
          >
            {formatCurrency(totals.balance, currency)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Budget</span>
          <Input
            inputMode="decimal"
            value={monthlyBudget ?? ""}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            placeholder="None"
            aria-label="Monthly budget limit"
            className="h-8 w-24"
          />
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Currency symbol"
          className="ml-auto h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {CURRENCY_OPTIONS.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      {budgetUsedPct !== null ? (
        <div className="space-y-1">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(budgetUsedPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Budget used"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                overBudget
                  ? "bg-destructive"
                  : "bg-[var(--color-accent)]"
              )}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
          <p
            className={cn(
              "text-[11px]",
              overBudget ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {formatCurrency(totals.expense, currency)} of{" "}
            {formatCurrency(monthlyBudget ?? 0, currency)} spent
            {overBudget ? " — over budget" : ""}
          </p>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addEntry();
        }}
        className="flex flex-col gap-2"
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEntryType("expense")}
            aria-pressed={entryType === "expense"}
            className={cn(
              "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
              entryType === "expense"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-input text-muted-foreground hover:bg-accent/50"
            )}
          >
            <ArrowDownLeft className="size-3.5" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setEntryType("income")}
            aria-pressed={entryType === "income"}
            className={cn(
              "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
              entryType === "income"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-input text-muted-foreground hover:bg-accent/50"
            )}
          >
            <ArrowUpRight className="size-3.5" />
            Income
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            aria-label="Entry description"
            className="flex-1"
          />
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            aria-label="Amount"
            className="w-24"
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </div>
      </form>

      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {entries.length === 0 ? (
          <li className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground">
            No entries yet — add income or an expense above
          </li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  entry.type === "income"
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "bg-destructive/15 text-destructive"
                )}
                aria-hidden="true"
              >
                {entry.type === "income" ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownLeft className="size-4" />
                )}
              </span>
              <span className="flex-1 truncate text-sm">
                {entry.description}
              </span>
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  entry.type === "income"
                    ? "text-[var(--color-accent)]"
                    : "text-destructive"
                )}
              >
                {entry.type === "income" ? "+" : "-"}
                {formatCurrency(entry.amount, currency)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => deleteEntry(entry.id)}
                aria-label={`Delete entry "${entry.description}"`}
                className="size-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
