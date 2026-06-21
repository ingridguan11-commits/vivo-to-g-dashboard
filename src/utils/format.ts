export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function formatScore(value: number): string {
  return `${formatNumber(value, 1)}分`;
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }
  return `${formatNumber(value * 100, digits)}%`;
}

export function formatRateAsPercent(rate: number, digits = 1): string {
  return `${formatNumber(rate * 100, digits)}%`;
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 10000) {
    return `${formatNumber(value / 10000, 1)}万`;
  }
  return formatNumber(value, 0);
}

export function formatSignedPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercent(value)}`;
}

export function scoreTone(score: number): "good" | "warn" | "bad" {
  if (score >= 80) return "good";
  if (score >= 65) return "warn";
  return "bad";
}
