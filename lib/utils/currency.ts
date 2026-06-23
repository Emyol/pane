export const CURRENCY_OPTIONS = ["$", "₱", "€", "£", "¥", "₹"] as const;

export function formatCurrency(amount: number, symbol = "$"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = Math.abs(safe).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${safe < 0 ? "-" : ""}${symbol}${formatted}`;
}

export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}
