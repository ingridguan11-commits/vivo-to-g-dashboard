import type { DashboardFilter, ModuleScores, ScoredRegionMetric } from "../types/dashboard";
import { calculateGrowth, moduleLabel, weakestModule } from "./score";
import { formatCurrency, formatNumber, formatPercent, formatRateAsPercent } from "./format";
import { getPeriodLabel } from "./period";

export type ReportTotals = {
  averageScore: number;
  cooperativeGuides: number;
  premiumGuides: number;
  premiumGuideRate: number;
  communityActiveRate: number;
  socialEngagementTotal: number;
  praiseCount: number;
  rentalAmount: number;
  phoneUnits: number;
  travelDays: number;
};

export function summarizeRegions(rows: ScoredRegionMetric[]): ReportTotals {
  const cooperativeGuides = rows.reduce((sum, row) => sum + row.cooperative_guides, 0);
  const premiumGuides = rows.reduce((sum, row) => sum + row.premium_guides, 0);
  const communityTotal = rows.reduce((sum, row) => sum + row.community_total_guides, 0);
  const communityActive = rows.reduce((sum, row) => sum + row.community_active_guides, 0);
  return {
    averageScore:
      rows.length === 0
        ? 0
        : rows.reduce((sum, row) => sum + row.region_score, 0) / rows.length,
    cooperativeGuides,
    premiumGuides,
    premiumGuideRate: cooperativeGuides === 0 ? 0 : premiumGuides / cooperativeGuides,
    communityActiveRate: communityTotal === 0 ? 0 : communityActive / communityTotal,
    socialEngagementTotal: rows.reduce((sum, row) => sum + row.social_engagement_total, 0),
    praiseCount: rows.reduce((sum, row) => sum + row.praise_count, 0),
    rentalAmount: rows.reduce((sum, row) => sum + row.rental_amount, 0),
    phoneUnits: rows.reduce((sum, row) => sum + row.phone_units, 0),
    travelDays: rows.reduce((sum, row) => sum + row.travel_days, 0)
  };
}

function strongestModules(rows: ScoredRegionMetric[]): string {
  if (rows.length === 0) return "导游建设";
  const moduleTotals = rows.reduce(
    (acc, row) => {
      Object.entries(row.module_scores).forEach(([key, value]) => {
        acc[key as keyof ModuleScores] += value;
      });
      return acc;
    },
    { guide: 0, execution: 0, community: 0, reputation: 0, conversion: 0 }
  );
  return (Object.entries(moduleTotals) as Array<[keyof ModuleScores, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => moduleLabel(key))
    .join("、");
}

function weakModules(rows: ScoredRegionMetric[]): string {
  if (rows.length === 0) return "导游建设";
  const weakList = rows.map((row) => moduleLabel(weakestModule(row)));
  return [...new Set(weakList)].slice(0, 2).join("、");
}

function growthSentence(rows: ScoredRegionMetric[]): string {
  const valid = rows.filter((row) => row.mom_region_score !== null);
  if (valid.length === 0) {
    return "环比暂无可比数据。";
  }
  const improving = valid.filter((row) => Number(row.mom_region_score) > 0);
  const declining = valid.filter((row) => Number(row.mom_region_score) < 0);
  if (improving.length >= declining.length) {
    return `环比看，${improving
      .slice(0, 3)
      .map((row) => row.region)
      .join("、")}推进得分提升较明显。`;
  }
  return `环比看，${declining
    .slice(0, 3)
    .map((row) => row.region)
    .join("、")}推进得分有所回落，建议优先复盘执行和转化链路。`;
}

export function generateMonthlySummary(
  rows: ScoredRegionMetric[],
  filter: DashboardFilter
): string {
  const sorted = [...rows].sort((a, b) => b.region_score - a.region_score);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();
  const totals = summarizeRegions(rows);
  const previousAverage =
    rows
      .filter((row) => row.mom_region_score !== null)
      .map((row) => row.region_score / (1 + Number(row.mom_region_score)))
      .reduce((sum, value) => sum + value, 0) /
    Math.max(rows.filter((row) => row.mom_region_score !== null).length, 1);
  const averageGrowth = calculateGrowth(totals.averageScore, previousAverage);

  return `${getPeriodLabel(filter)} vivo To G 旅拍项目整体推进${
    averageGrowth === null
      ? "平稳"
      : averageGrowth >= 0
        ? "稳中有升"
        : "有所承压"
  }，当前区域平均推进得分为${formatNumber(totals.averageScore, 1)}分。十个区域中，${top3
    .map((row) => row.region)
    .join("、")}综合得分排名靠前，主要优势集中在${strongestModules(top3)}。${bottom3
    .map((row) => row.region)
    .join("、")}当前在${weakModules(bottom3)}表现较弱，建议下期重点跟进总部活动执行、导游社群互动与优质导游培育。本期合作导游共${formatNumber(
    totals.cooperativeGuides
  )}人，其中4-5星优质导游${formatNumber(
    totals.premiumGuides
  )}人，优质导游占比为${formatRateAsPercent(
    totals.premiumGuideRate
  )}，社群活跃率为${formatRateAsPercent(
    totals.communityActiveRate
  )}。项目获得社媒赞收${formatNumber(
    totals.socialEngagementTotal
  )}，团友好评${formatNumber(totals.praiseCount)}，租机成交额${formatCurrency(
    totals.rentalAmount
  )}，售机${formatNumber(totals.phoneUnits)}台。${growthSentence(rows)}`;
}

export function buildReportSections(rows: ScoredRegionMetric[]) {
  const sorted = [...rows].sort((a, b) => b.region_score - a.region_score);
  return {
    top3: sorted.slice(0, 3),
    bottom3: sorted.slice(-3).reverse(),
    totals: summarizeRegions(rows)
  };
}
