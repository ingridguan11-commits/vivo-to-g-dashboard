import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatSignedPercent } from "../../utils/format";

type TrendBadgeProps = {
  value: number | null;
  label: string;
};

export function TrendBadge({ value, label }: TrendBadgeProps) {
  const isUp = value !== null && value > 0;
  const isDown = value !== null && value < 0;
  const tone = isUp
    ? "bg-emerald-50 text-emerald-700"
    : isDown
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-100 text-slate-500";
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {label} {formatSignedPercent(value)}
    </span>
  );
}
