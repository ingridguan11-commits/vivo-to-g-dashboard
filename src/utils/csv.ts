import type { ScoredRegionMetric } from "../types/dashboard";
import { formatPercent } from "./format";

function escapeCsv(value: string | number): string {
  const raw = String(value);
  if (raw.includes(",") || raw.includes("\n") || raw.includes("\"")) {
    return `"${raw.replace(/"/g, "\"\"")}"`;
  }
  return raw;
}

export function buildRegionCompareCsv(rows: ScoredRegionMetric[]): string {
  const headers = [
    "排名",
    "区域",
    "区域推进得分",
    "导游建设得分",
    "运营执行得分",
    "社群活跃得分",
    "传播口碑得分",
    "商业转化得分",
    "合作导游数量",
    "优质导游数量",
    "优质导游占比",
    "出团天数",
    "社媒赞收量",
    "团友好评数",
    "租机成交额",
    "售机台数",
    "环比变化"
  ];

  const body = rows.map((row) => [
    row.rank,
    row.region,
    row.region_score,
    row.module_scores.guide,
    row.module_scores.execution,
    row.module_scores.community,
    row.module_scores.reputation,
    row.module_scores.conversion,
    row.cooperative_guides,
    row.premium_guides,
    formatPercent(row.premium_guide_rate),
    row.travel_days,
    row.social_engagement_total,
    row.praise_count,
    row.rental_amount,
    row.phone_units,
    formatPercent(row.mom_region_score)
  ]);

  return [headers, ...body].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
