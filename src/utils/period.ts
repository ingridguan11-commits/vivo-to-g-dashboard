import { REGIONS } from "../config/dashboardConfig";
import type {
  DashboardFilter,
  GuideMetric,
  MetricBasis,
  PeriodType,
  Region,
  RegionMetric
} from "../types/dashboard";

const REGION_SUM_FIELDS: Array<keyof RegionMetric> = [
  "new_guides",
  "travel_days",
  "activity_required_count",
  "activity_executed_count",
  "task_assigned_count",
  "task_closed_count",
  "data_due_count",
  "data_on_time_count",
  "review_required_count",
  "review_finished_count",
  "community_interactions",
  "training_participants",
  "posting_participants",
  "campaign_participants",
  "content_posts",
  "social_likes",
  "social_saves",
  "praise_count",
  "rental_amount",
  "phone_units"
];

const REGION_SNAPSHOT_FIELDS: Array<keyof RegionMetric> = [
  "cooperative_guides",
  "premium_guides",
  "community_total_guides",
  "community_active_guides"
];

const GUIDE_SUM_FIELDS: Array<keyof GuideMetric> = [
  "travel_days",
  "uploaded_photos",
  "content_posts",
  "social_likes",
  "social_saves",
  "praise_count",
  "rental_amount",
  "phone_units",
  "community_interactions"
];

function sortByPeriodDate<T extends { period_date: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.period_date.localeCompare(b.period_date));
}

function aggregateRegionRows(
  rows: RegionMetric[],
  periodType: PeriodType,
  year: number,
  month: number,
  week: number
): RegionMetric[] {
  const grouped = new Map<Region, RegionMetric[]>();
  rows.forEach((row) => {
    const bucket = grouped.get(row.region) ?? [];
    bucket.push(row);
    grouped.set(row.region, bucket);
  });

  return REGIONS.filter((region) => grouped.has(region)).map((region) => {
    const bucket = sortByPeriodDate(grouped.get(region) ?? []);
    const latest = bucket[bucket.length - 1];
    const base: RegionMetric = {
      ...latest,
      period_type: periodType,
      period_date:
        periodType === "year"
          ? `${year}-12-31`
          : periodType === "month"
            ? `${year}-${String(month).padStart(2, "0")}-28`
            : `${year}-W${String(week).padStart(2, "0")}`,
      year,
      month,
      week,
      region
    };

    REGION_SUM_FIELDS.forEach((field) => {
      (base as unknown as Record<string, number>)[field] = bucket.reduce(
        (sum, row) => sum + Number(row[field] ?? 0),
        0
      );
    });
    REGION_SNAPSHOT_FIELDS.forEach((field) => {
      (base as unknown as Record<string, number>)[field] = Number(latest[field] ?? 0);
    });
    return base;
  });
}

function aggregateGuideRows(
  rows: GuideMetric[],
  periodType: PeriodType,
  year: number,
  month: number,
  week: number
): GuideMetric[] {
  const grouped = new Map<string, GuideMetric[]>();
  rows.forEach((row) => {
    const bucket = grouped.get(row.guide_id) ?? [];
    bucket.push(row);
    grouped.set(row.guide_id, bucket);
  });

  return [...grouped.entries()].map(([guideId, bucketRows]) => {
    const bucket = sortByPeriodDate(bucketRows);
    const latest = bucket[bucket.length - 1];
    const base: GuideMetric = {
      ...latest,
      guide_id: guideId,
      period_type: periodType,
      period_date:
        periodType === "year"
          ? `${year}-12-31`
          : periodType === "month"
            ? `${year}-${String(month).padStart(2, "0")}-28`
            : `${year}-W${String(week).padStart(2, "0")}`,
      year,
      month,
      week,
      region: latest.region,
      is_active: bucket.some((row) => row.is_active),
      training_joined: bucket.some((row) => row.training_joined),
      posting_joined: bucket.some((row) => row.posting_joined),
      campaign_joined: bucket.some((row) => row.campaign_joined),
      last_active_date: bucket
        .map((row) => row.last_active_date)
        .sort((a, b) => b.localeCompare(a))[0]
    };

    GUIDE_SUM_FIELDS.forEach((field) => {
      (base as unknown as Record<string, number>)[field] = bucket.reduce(
        (sum, row) => sum + Number(row[field] ?? 0),
        0
      );
    });
    return base;
  });
}

function regionRowsForFilter(metrics: RegionMetric[], filter: DashboardFilter): RegionMetric[] {
  const { periodType, year, month, week, basis } = filter;

  if (periodType === "year") {
    const explicitYearRows = metrics.filter(
      (row) => row.period_type === "year" && row.year === year
    );
    if (explicitYearRows.length > 0) {
      return explicitYearRows;
    }
    const monthRows = metrics.filter(
      (row) => row.period_type === "month" && row.year === year
    );
    return aggregateRegionRows(monthRows, "year", year, 0, 0);
  }

  if (periodType === "month") {
    const monthRows = metrics.filter((row) => row.period_type === "month" && row.year === year);
    if (basis === "cumulative") {
      return aggregateRegionRows(
        monthRows.filter((row) => row.month <= month),
        "month",
        year,
        month,
        0
      );
    }
    return monthRows.filter((row) => row.month === month);
  }

  const weekRows = metrics.filter((row) => row.period_type === "week" && row.year === year);
  if (basis === "cumulative") {
    return aggregateRegionRows(
      weekRows.filter((row) => row.week <= week),
      "week",
      year,
      month,
      week
    );
  }
  return weekRows.filter((row) => row.week === week);
}

function guideRowsForFilter(metrics: GuideMetric[], filter: DashboardFilter): GuideMetric[] {
  const { periodType, year, month, week, basis } = filter;

  if (periodType === "year") {
    const explicitYearRows = metrics.filter(
      (row) => row.period_type === "year" && row.year === year
    );
    if (explicitYearRows.length > 0) {
      return explicitYearRows;
    }
    const monthRows = metrics.filter(
      (row) => row.period_type === "month" && row.year === year
    );
    return aggregateGuideRows(monthRows, "year", year, 0, 0);
  }

  if (periodType === "month") {
    const monthRows = metrics.filter((row) => row.period_type === "month" && row.year === year);
    if (basis === "cumulative") {
      return aggregateGuideRows(
        monthRows.filter((row) => row.month <= month),
        "month",
        year,
        month,
        0
      );
    }
    return monthRows.filter((row) => row.month === month);
  }

  const weekRows = metrics.filter((row) => row.period_type === "week" && row.year === year);
  if (basis === "cumulative") {
    return aggregateGuideRows(
      weekRows.filter((row) => row.week <= week),
      "week",
      year,
      month,
      week
    );
  }
  return weekRows.filter((row) => row.week === week);
}

export function getRegionMetricsForFilter(
  metrics: RegionMetric[],
  filter: DashboardFilter,
  applyRegionSelection = true
): RegionMetric[] {
  const rows = regionRowsForFilter(metrics, filter);
  if (!applyRegionSelection) {
    return rows;
  }
  return rows.filter((row) => filter.selectedRegions.includes(row.region));
}

export function getGuideMetricsForFilter(
  metrics: GuideMetric[],
  filter: DashboardFilter,
  applyRegionSelection = true
): GuideMetric[] {
  const rows = guideRowsForFilter(metrics, filter);
  if (!applyRegionSelection) {
    return rows;
  }
  return rows.filter((row) => filter.selectedRegions.includes(row.region));
}

export function getPreviousFilter(filter: DashboardFilter): DashboardFilter {
  if (filter.periodType === "year") {
    return { ...filter, year: filter.year - 1 };
  }
  if (filter.periodType === "month") {
    if (filter.month === 1) {
      return { ...filter, year: filter.year - 1, month: 12 };
    }
    return { ...filter, month: filter.month - 1 };
  }
  if (filter.week === 1) {
    return { ...filter, year: filter.year - 1, week: 52 };
  }
  return { ...filter, week: filter.week - 1 };
}

export function getLastYearFilter(filter: DashboardFilter): DashboardFilter {
  return { ...filter, year: filter.year - 1 };
}

export function getPeriodLabel(filter: Pick<DashboardFilter, "periodType" | "year" | "month" | "week" | "basis">): string {
  const basisLabel = filter.basis === "cumulative" ? "累计" : "本期";
  if (filter.periodType === "year") {
    return `${filter.year}年`;
  }
  if (filter.periodType === "month") {
    return `${filter.year}年${filter.month}月 ${basisLabel}`;
  }
  return `${filter.year}年第${filter.week}周 ${basisLabel}`;
}

export function getAvailableYears(metrics: RegionMetric[]): number[] {
  return [...new Set(metrics.map((row) => row.year))].sort((a, b) => b - a);
}

export function getAvailableMonths(metrics: RegionMetric[], year: number): number[] {
  return [
    ...new Set(
      metrics
        .filter((row) => row.period_type === "month" && row.year === year)
        .map((row) => row.month)
    )
  ].sort((a, b) => a - b);
}

export function getAvailableWeeks(metrics: RegionMetric[], year: number): number[] {
  return [
    ...new Set(
      metrics
        .filter((row) => row.period_type === "week" && row.year === year)
        .map((row) => row.week)
    )
  ].sort((a, b) => a - b);
}

export function withMetricBasis(filter: DashboardFilter, basis: MetricBasis): DashboardFilter {
  return { ...filter, basis };
}
