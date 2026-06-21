import { ArrowDownUp } from "lucide-react";
import { useMemo, useState } from "react";
import { FORMULA_TEXT } from "../../config/dashboardConfig";
import type { ScoredRegionMetric, SortDirection } from "../../types/dashboard";
import { formatCurrency, formatNumber, formatPercent, formatRateAsPercent } from "../../utils/format";
import { ScoreBadge } from "../common/ScoreBadge";

type SortKey =
  | "rank"
  | "region"
  | "region_score"
  | "guide"
  | "execution"
  | "community"
  | "reputation"
  | "conversion"
  | "cooperative_guides"
  | "premium_guides"
  | "premium_guide_rate"
  | "travel_days"
  | "social_engagement_total"
  | "praise_count"
  | "rental_amount"
  | "phone_units"
  | "mom_region_score";

type RegionCompareTableProps = {
  rows: ScoredRegionMetric[];
};

const columns: Array<{
  key: SortKey;
  label: string;
  title?: string;
  align?: "left" | "right" | "center";
}> = [
  { key: "rank", label: "排名", align: "center" },
  { key: "region", label: "区域", align: "left" },
  { key: "region_score", label: "区域推进得分", title: FORMULA_TEXT.regionScore, align: "center" },
  { key: "guide", label: "导游建设", title: FORMULA_TEXT.guide, align: "center" },
  { key: "execution", label: "运营执行", title: FORMULA_TEXT.execution, align: "center" },
  { key: "community", label: "社群活跃", title: FORMULA_TEXT.community, align: "center" },
  { key: "reputation", label: "传播口碑", title: FORMULA_TEXT.reputation, align: "center" },
  { key: "conversion", label: "商业转化", title: FORMULA_TEXT.conversion, align: "center" },
  { key: "cooperative_guides", label: "合作导游", align: "right" },
  { key: "premium_guides", label: "优质导游", title: "4-5星导游数量", align: "right" },
  { key: "premium_guide_rate", label: "优质占比", title: "优质导游占比 = 优质导游数量 / 合作导游数量", align: "right" },
  { key: "travel_days", label: "出团天数", title: "业务背景指标，不进入区域推进得分", align: "right" },
  { key: "social_engagement_total", label: "社媒赞收", title: "点赞量 + 收藏量", align: "right" },
  { key: "praise_count", label: "团友好评", align: "right" },
  { key: "rental_amount", label: "租机成交额", align: "right" },
  { key: "phone_units", label: "售机台数", align: "right" },
  { key: "mom_region_score", label: "环比变化", title: "展示用，不进入区域推进得分", align: "right" }
];

function valueOf(row: ScoredRegionMetric, key: SortKey): string | number {
  if (key === "guide") return row.module_scores.guide;
  if (key === "execution") return row.module_scores.execution;
  if (key === "community") return row.module_scores.community;
  if (key === "reputation") return row.module_scores.reputation;
  if (key === "conversion") return row.module_scores.conversion;
  return row[key] ?? "";
}

function renderCell(row: ScoredRegionMetric, key: SortKey) {
  if (key === "region_score") return <ScoreBadge score={row.region_score} title={FORMULA_TEXT.regionScore} />;
  if (key === "guide") return <ScoreBadge score={row.module_scores.guide} title={FORMULA_TEXT.guide} />;
  if (key === "execution") return <ScoreBadge score={row.module_scores.execution} title={FORMULA_TEXT.execution} />;
  if (key === "community") return <ScoreBadge score={row.module_scores.community} title={FORMULA_TEXT.community} />;
  if (key === "reputation") return <ScoreBadge score={row.module_scores.reputation} title={FORMULA_TEXT.reputation} />;
  if (key === "conversion") return <ScoreBadge score={row.module_scores.conversion} title={FORMULA_TEXT.conversion} />;
  if (key === "premium_guide_rate") return formatRateAsPercent(row.premium_guide_rate);
  if (key === "rental_amount") return formatCurrency(row.rental_amount);
  if (key === "mom_region_score") return formatPercent(row.mom_region_score);
  if (key === "social_engagement_total") return formatNumber(row.social_engagement_total);
  const value = valueOf(row, key);
  return typeof value === "number" ? formatNumber(value) : value;
}

export function RegionCompareTable({ rows }: RegionCompareTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("region_score");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = valueOf(a, sortKey);
      const bv = valueOf(b, sortKey);
      if (typeof av === "string" || typeof bv === "string") {
        return direction === "asc"
          ? String(av).localeCompare(String(bv), "zh-CN")
          : String(bv).localeCompare(String(av), "zh-CN");
      }
      return direction === "asc" ? av - Number(bv) : Number(bv) - av;
    });
  }, [direction, rows, sortKey]);

  const updateSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection(key === "region" ? "asc" : "desc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1280px] divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                title={column.title}
                className={`whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-500 ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                <button
                  type="button"
                  onClick={() => updateSort(column.key)}
                  className="inline-flex items-center gap-1 hover:text-vivo-700"
                >
                  {column.label}
                  <ArrowDownUp className="h-3.5 w-3.5" />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sortedRows.map((row) => (
            <tr key={row.region} className="hover:bg-vivo-50/40">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`whitespace-nowrap px-3 py-3 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  } ${column.key === "region" ? "font-semibold text-ink-950" : "text-slate-600"}`}
                >
                  {renderCell(row, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
