import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { TrendBadge } from "./TrendBadge";

type KpiCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  mom?: number | null;
  yoy?: number | null;
  icon?: LucideIcon;
  info?: string;
};

export function KpiCard({ title, value, subtitle, mom, yoy, icon: Icon, info }: KpiCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <span>{title}</span>
            {info ? (
              <span title={info}>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </span>
            ) : null}
          </div>
          <div className="mt-2 truncate text-2xl font-semibold text-ink-950">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-vivo-50 p-2 text-vivo-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <TrendBadge label="环比" value={mom ?? null} />
        <TrendBadge label="同比" value={yoy ?? null} />
      </div>
    </article>
  );
}
