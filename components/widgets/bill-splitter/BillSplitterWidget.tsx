"use client";

import * as React from "react";
import { nanoid } from "nanoid";
import { Trash2, UserPlus, Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { WidgetProps } from "@/lib/widgets/registry";
import type {
  BillParticipant,
  BillSplitterWidgetData,
} from "@/lib/types/workspace";
import {
  CURRENCY_OPTIONS,
  formatCurrency,
  parseAmount,
} from "@/lib/utils/currency";

export function BillSplitterWidget({ widget }: WidgetProps) {
  const data = widget.data as BillSplitterWidgetData;
  const updateWidgetData = useWorkspaceStore((s) => s.updateWidgetData);

  const currency = data.currency ?? "$";
  const billName = data.billName ?? "";
  const billAmount = data.billAmount ?? 0;
  const tipPercent = data.tipPercent ?? 0;
  const taxPercent = data.taxPercent ?? 0;
  const participants = React.useMemo(
    () => data.participants ?? [],
    [data.participants]
  );

  const [nameDraft, setNameDraft] = React.useState("");

  const grandTotal = React.useMemo(() => {
    const multiplier = 1 + (tipPercent + taxPercent) / 100;
    return billAmount * multiplier;
  }, [billAmount, tipPercent, taxPercent]);

  const perPerson =
    participants.length > 0 ? grandTotal / participants.length : 0;
  const collected = participants.filter((p) => p.paid).length * perPerson;
  const remaining = Math.max(0, grandTotal - collected);

  const persist = React.useCallback(
    (next: Partial<BillSplitterWidgetData>) => {
      updateWidgetData(widget.id, {
        currency,
        billName,
        billAmount,
        tipPercent,
        taxPercent,
        participants,
        ...next,
      } satisfies BillSplitterWidgetData);
    },
    [
      updateWidgetData,
      widget.id,
      currency,
      billName,
      billAmount,
      tipPercent,
      taxPercent,
      participants,
    ]
  );

  const addParticipant = () => {
    const name = nameDraft.trim();
    if (!name) return;
    const next: BillParticipant = { id: nanoid(), name, paid: false };
    persist({ participants: [...participants, next] });
    setNameDraft("");
  };

  const removeParticipant = (id: string) => {
    persist({ participants: participants.filter((p) => p.id !== id) });
  };

  const togglePaid = (id: string) => {
    persist({
      participants: participants.map((p) =>
        p.id === id ? { ...p, paid: !p.paid } : p
      ),
    });
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          value={billName}
          onChange={(e) => persist({ billName: e.target.value })}
          placeholder="Bill name (e.g. Dinner)"
          aria-label="Bill name"
          className="flex-1"
        />
        <select
          value={currency}
          onChange={(e) => persist({ currency: e.target.value })}
          aria-label="Currency symbol"
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {CURRENCY_OPTIONS.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          Amount
          <Input
            inputMode="decimal"
            value={billAmount === 0 ? "" : billAmount}
            onChange={(e) => persist({ billAmount: parseAmount(e.target.value) })}
            placeholder="0.00"
            aria-label="Bill amount"
            className="h-8"
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          Tip %
          <Input
            inputMode="decimal"
            value={tipPercent === 0 ? "" : tipPercent}
            onChange={(e) => persist({ tipPercent: parseAmount(e.target.value) })}
            placeholder="0"
            aria-label="Tip percentage"
            className="h-8"
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          Tax %
          <Input
            inputMode="decimal"
            value={taxPercent === 0 ? "" : taxPercent}
            onChange={(e) => persist({ taxPercent: parseAmount(e.target.value) })}
            placeholder="0"
            aria-label="Tax percentage"
            className="h-8"
          />
        </label>
      </div>

      <div className="rounded-md bg-accent/40 p-3 text-center">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Each person pays
        </p>
        <p className="text-2xl font-semibold tabular-nums">
          {formatCurrency(perPerson, currency)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Total {formatCurrency(grandTotal, currency)} ·{" "}
          {participants.length}{" "}
          {participants.length === 1 ? "person" : "people"}
          {collected > 0
            ? ` · ${formatCurrency(remaining, currency)} left`
            : ""}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addParticipant();
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          placeholder="Add a person"
          aria-label="Participant name"
          className="flex-1"
        />
        <Button type="submit" size="sm" className="gap-1.5">
          <UserPlus className="size-4" />
          Add
        </Button>
      </form>

      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {participants.length === 0 ? (
          <li className="flex flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground">
            Add people to split the bill
          </li>
        ) : (
          participants.map((person) => (
            <li
              key={person.id}
              className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent/50"
            >
              <button
                type="button"
                onClick={() => togglePaid(person.id)}
                aria-pressed={person.paid}
                aria-label={
                  person.paid
                    ? `Mark ${person.name} as unpaid`
                    : `Mark ${person.name} as paid`
                }
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  person.paid
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-input text-transparent hover:border-[var(--color-accent)]"
                )}
              >
                <Check className="size-4" />
              </button>
              <span
                className={cn(
                  "flex-1 truncate text-sm",
                  person.paid && "text-muted-foreground line-through"
                )}
              >
                {person.name}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {formatCurrency(perPerson, currency)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeParticipant(person.id)}
                aria-label={`Remove ${person.name}`}
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
