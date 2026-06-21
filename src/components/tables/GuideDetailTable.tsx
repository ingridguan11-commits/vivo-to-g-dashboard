import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import type { GuidePerformance, SortDirection } from "../../types/dashboard";
import { formatCurrency, formatNumber } from "../../utils/format";

type SortKey =
  | "guide_name"
  | "region"
  | "agency_name"
  | "star_level"
  | "travel_days"
  | "uploaded_photos"
  | "content_posts"
  | "social_engagement_total"
  | "praise_count"
  | "rental_amount"
  | "phone_units"
  | "community_interactions"
  | "last_active_date";

type GuideDetailTableProps = {
  rows: GuidePerformance[];
};

const columns: Array<{ key: SortKey; label: string; align?: "left" | "right" | "center"; title?: string }> = [
  { key: "guide_name", label: "导游姓名", align: "left" },
  { key: "region", label: "区域", align: "left" },
  { key: "agency_name", label: "合作旅行社", align: "left" },
  { key: "star_level", label: "星级", align: "center", title: "4-5星定义为优质导游" },
  { key: "travel_days", label: "出团天数", align: "right" },
  { key: "uploaded_photos", label: "上传照片数", align: "right" },
  { key: "content_posts", label: "内容发布量", align: "right" },
  { key: "social_engagement_total", label: "社媒赞收量", align: "right" },
  { key: "praise_count", label: "团友好评数", align: "right" },
  { key: "rental_amount", label: "租机成交额", align: "right" },
  { key: "phone_units", label: "售机台数", align: "right" },
  { key: "community_interactions", label: "社群互动", align: "right" },
  { key: "last_active_date", label: "最近活跃", align: "right" }
];

function valueOf(row: GuidePerformance, key: SortKey): string | number {
  return row[key] ?? "";
}

function renderCell(row: GuidePerformance, key: SortKey) {
  if (key === "star_level") {
    return (
      <span className={row.star_level >= 4 ? "font-semibold text-emerald-700" : "text-slate-600"}>
        {row.star_level}星
      </span>
    );
  }
  if (key === "rental_amount") return formatCurrency(row.rental_amount);
  if (typeof valueOf(row, key) === "number") return formatNumber(Number(valueOf(row, key)));
  return valueOf(row, key);
}

export function GuideDetailTable({ rows }: GuideDetailTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("social_engagement_total");
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
    if (key === sortKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1180px] divide-y divide-slate-200 text-sm">
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
            <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold text-slate-500">
              状态
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sortedRows.map((row) => (
            <tr key={row.guide_id} className="hover:bg-vivo-50/40">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`whitespace-nowrap px-3 py-3 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  } ${column.key === "guide_name" ? "font-semibold text-ink-950" : "text-slate-600"}`}
                >
                  {renderCell(row, column.key)}
                </td>
              ))}
              <td className="whitespace-nowrap px-3 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {row.is_active ? "活跃" : "未活跃"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.is_premium ? "bg-vivo-50 text-vivo-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {row.is_premium ? "优质" : "普通"}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
