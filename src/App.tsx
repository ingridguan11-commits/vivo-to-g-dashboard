import { useMemo, useState } from "react";
import { REGIONS, SCORE_MODE, TARGET_CONFIG } from "./config/dashboardConfig";
import { DashboardShell } from "./components/layout/DashboardShell";
import { FilterBar } from "./components/layout/FilterBar";
import { TabNav, type DashboardTab } from "./components/layout/TabNav";
import { OverviewPage } from "./pages/OverviewPage";
import { RegionComparePage } from "./pages/RegionComparePage";
import { GuideCommunityPage, type GuideTrendPoint } from "./pages/GuideCommunityPage";
import { ReportExportPage } from "./pages/ReportExportPage";
import { useDashboardData } from "./hooks/useDashboardData";
import type {
  DashboardFilter,
  GuideMetric,
  GuidePerformance,
  GuideProfile,
  RegionMetric
} from "./types/dashboard";
import {
  getAvailableMonths,
  getAvailableWeeks,
  getAvailableYears,
  getGuideMetricsForFilter,
  getLastYearFilter,
  getPreviousFilter,
  getRegionMetricsForFilter
} from "./utils/period";
import { averageModuleScores, calculateScoredRegions } from "./utils/score";
import type { ScoreTrendPoint } from "./components/charts/ScoreTrendChart";

const DEFAULT_FILTER: DashboardFilter = {
  periodType: "month",
  year: 2026,
  month: 6,
  week: 24,
  selectedRegions: REGIONS,
  basis: "period"
};

function averageScore(rows: ReturnType<typeof calculateScoredRegions>) {
  if (rows.length === 0) return 0;
  return rows.reduce((sum, row) => sum + row.region_score, 0) / rows.length;
}

function buildScoreTrend(regionMetrics: RegionMetric[], filter: DashboardFilter): ScoreTrendPoint[] {
  const points: ScoreTrendPoint[] = [];

  if (filter.periodType === "week") {
    const weeks = getAvailableWeeks(regionMetrics, filter.year).filter((week) => week <= filter.week);
    weeks.forEach((week) => {
      const pointFilter = { ...filter, periodType: "week" as const, week, basis: "period" as const };
      const context = getRegionMetricsForFilter(regionMetrics, pointFilter, false);
      const selected = getRegionMetricsForFilter(regionMetrics, pointFilter, true);
      const scored = calculateScoredRegions(selected, context, {
        scoreMode: SCORE_MODE,
        targetConfig: TARGET_CONFIG
      });
      const modules = averageModuleScores(scored);
      points.push({
        period: `W${week}`,
        score: Number(averageScore(scored).toFixed(1)),
        community: modules.community,
        reputation: modules.reputation,
        conversion: modules.conversion
      });
    });
    return points;
  }

  const months = getAvailableMonths(regionMetrics, filter.year).filter((month) =>
    filter.periodType === "month" ? month <= filter.month : true
  );
  months.forEach((month) => {
    const pointFilter = { ...filter, periodType: "month" as const, month, basis: "period" as const };
    const context = getRegionMetricsForFilter(regionMetrics, pointFilter, false);
    const selected = getRegionMetricsForFilter(regionMetrics, pointFilter, true);
    const scored = calculateScoredRegions(selected, context, {
      scoreMode: SCORE_MODE,
      targetConfig: TARGET_CONFIG
    });
    const modules = averageModuleScores(scored);
    points.push({
      period: `${month}月`,
      score: Number(averageScore(scored).toFixed(1)),
      community: modules.community,
      reputation: modules.reputation,
      conversion: modules.conversion
    });
  });

  return points;
}

function buildGuideTrend(
  guideMetrics: GuideMetric[],
  regionMetrics: RegionMetric[],
  filter: DashboardFilter
): GuideTrendPoint[] {
  if (filter.periodType === "week") {
    return getAvailableWeeks(regionMetrics, filter.year)
      .filter((week) => week <= filter.week)
      .map((week) => {
        const pointFilter = { ...filter, periodType: "week" as const, week, basis: "period" as const };
        const guides = getGuideMetricsForFilter(guideMetrics, pointFilter, true);
        const regions = getRegionMetricsForFilter(regionMetrics, pointFilter, true);
        const cooperative = regions.reduce((sum, row) => sum + row.cooperative_guides, 0);
        const premium = regions.reduce((sum, row) => sum + row.premium_guides, 0);
        return {
          period: `W${week}`,
          interactions: guides.reduce((sum, row) => sum + row.community_interactions, 0),
          premiumRate: cooperative === 0 ? 0 : Number(((premium / cooperative) * 100).toFixed(1))
        };
      });
  }

  return getAvailableMonths(regionMetrics, filter.year)
    .filter((month) => (filter.periodType === "month" ? month <= filter.month : true))
    .map((month) => {
      const pointFilter = { ...filter, periodType: "month" as const, month, basis: "period" as const };
      const guides = getGuideMetricsForFilter(guideMetrics, pointFilter, true);
      const regions = getRegionMetricsForFilter(regionMetrics, pointFilter, true);
      const cooperative = regions.reduce((sum, row) => sum + row.cooperative_guides, 0);
      const premium = regions.reduce((sum, row) => sum + row.premium_guides, 0);
      return {
        period: `${month}月`,
        interactions: guides.reduce((sum, row) => sum + row.community_interactions, 0),
        premiumRate: cooperative === 0 ? 0 : Number(((premium / cooperative) * 100).toFixed(1))
      };
    });
}

function joinGuidePerformance(
  profiles: GuideProfile[],
  metrics: GuideMetric[]
): GuidePerformance[] {
  const profileMap = new Map(profiles.map((profile) => [profile.guide_id, profile]));
  return metrics
    .map((metric) => {
      const profile = profileMap.get(metric.guide_id);
      if (!profile) return null;
      return {
        ...profile,
        ...metric,
        social_engagement_total: metric.social_likes + metric.social_saves
      };
    })
    .filter(Boolean) as GuidePerformance[];
}

function sanitizeFilter(next: DashboardFilter, regionMetrics: RegionMetric[]): DashboardFilter {
  const months = getAvailableMonths(regionMetrics, next.year);
  const weeks = getAvailableWeeks(regionMetrics, next.year);
  return {
    ...next,
    month: months.includes(next.month) ? next.month : months[months.length - 1] ?? next.month,
    week: weeks.includes(next.week) ? next.week : weeks[weeks.length - 1] ?? next.week,
    selectedRegions: next.selectedRegions.length > 0 ? next.selectedRegions : REGIONS
  };
}

export default function App() {
  const { regionMetrics, guideProfiles, guideMetrics, loading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [filter, setFilter] = useState<DashboardFilter>(DEFAULT_FILTER);

  const years = useMemo(() => getAvailableYears(regionMetrics), [regionMetrics]);
  const months = useMemo(() => getAvailableMonths(regionMetrics, filter.year), [filter.year, regionMetrics]);
  const weeks = useMemo(() => getAvailableWeeks(regionMetrics, filter.year), [filter.year, regionMetrics]);

  const handleFilterChange = (next: DashboardFilter) => {
    setFilter(sanitizeFilter(next, regionMetrics));
  };

  const previousFilter = useMemo(() => getPreviousFilter(filter), [filter]);
  const lastYearFilter = useMemo(() => getLastYearFilter(filter), [filter]);

  const currentContext = useMemo(
    () => getRegionMetricsForFilter(regionMetrics, filter, false),
    [filter, regionMetrics]
  );
  const currentSelected = useMemo(
    () => getRegionMetricsForFilter(regionMetrics, filter, true),
    [filter, regionMetrics]
  );
  const previousContext = useMemo(
    () => getRegionMetricsForFilter(regionMetrics, previousFilter, false),
    [previousFilter, regionMetrics]
  );
  const previousSelected = useMemo(
    () => getRegionMetricsForFilter(regionMetrics, previousFilter, true),
    [previousFilter, regionMetrics]
  );
  const lastYearContext = useMemo(
    () => getRegionMetricsForFilter(regionMetrics, lastYearFilter, false),
    [lastYearFilter, regionMetrics]
  );
  const lastYearSelected = useMemo(
    () => getRegionMetricsForFilter(regionMetrics, lastYearFilter, true),
    [lastYearFilter, regionMetrics]
  );

  const scoredRows = useMemo(
    () =>
      calculateScoredRegions(currentSelected, currentContext, {
        scoreMode: SCORE_MODE,
        targetConfig: TARGET_CONFIG,
        previousMetrics: previousSelected,
        previousContextMetrics: previousContext,
        lastYearMetrics: lastYearSelected,
        lastYearContextMetrics: lastYearContext
      }),
    [currentContext, currentSelected, lastYearContext, lastYearSelected, previousContext, previousSelected]
  );

  const previousScoredRows = useMemo(
    () =>
      calculateScoredRegions(previousSelected, previousContext, {
        scoreMode: SCORE_MODE,
        targetConfig: TARGET_CONFIG
      }),
    [previousContext, previousSelected]
  );

  const lastYearScoredRows = useMemo(
    () =>
      calculateScoredRegions(lastYearSelected, lastYearContext, {
        scoreMode: SCORE_MODE,
        targetConfig: TARGET_CONFIG
      }),
    [lastYearContext, lastYearSelected]
  );

  const currentGuideMetrics = useMemo(
    () => getGuideMetricsForFilter(guideMetrics, filter, true),
    [filter, guideMetrics]
  );
  const guidePerformances = useMemo(
    () => joinGuidePerformance(guideProfiles, currentGuideMetrics),
    [currentGuideMetrics, guideProfiles]
  );
  const scoreTrend = useMemo(() => buildScoreTrend(regionMetrics, filter), [filter, regionMetrics]);
  const guideTrend = useMemo(
    () => buildGuideTrend(guideMetrics, regionMetrics, filter),
    [filter, guideMetrics, regionMetrics]
  );

  if (loading) {
    return (
      <DashboardShell>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          正在加载看板数据...
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          数据加载失败：{error}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-5">
        <FilterBar
          filter={filter}
          years={years}
          months={months}
          weeks={weeks}
          onChange={handleFilterChange}
        />
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <TabNav activeTab={activeTab} onChange={setActiveTab} />
          <div className="p-4 md:p-5">
            {activeTab === "overview" ? (
              <OverviewPage
                rows={scoredRows}
                previousRows={previousScoredRows}
                lastYearRows={lastYearScoredRows}
                trendData={scoreTrend}
              />
            ) : null}
            {activeTab === "compare" ? <RegionComparePage rows={scoredRows} /> : null}
            {activeTab === "guides" ? (
              <GuideCommunityPage guides={guidePerformances} rows={scoredRows} trendData={guideTrend} />
            ) : null}
            {activeTab === "report" ? <ReportExportPage rows={scoredRows} filter={filter} /> : null}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
