import {
  MODULE_LABELS,
  MODULE_WEIGHTS,
  SCORE_MODE,
  SCORE_WEIGHTS,
  TARGET_CONFIG
} from "../config/dashboardConfig";
import type {
  DerivedRegionMetric,
  ModuleScores,
  RegionMetric,
  ScoredRegionMetric,
  ScoreMode,
  TargetConfig
} from "../types/dashboard";

export function safeRate(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  return numerator / denominator;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 1): number {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

export function calculateGrowth(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return current / previous - 1;
}

export function deriveRegionMetric(metric: RegionMetric): DerivedRegionMetric {
  const premiumGuideRate = safeRate(metric.premium_guides, metric.cooperative_guides);
  const trainingParticipationRate = safeRate(
    metric.training_participants,
    metric.community_total_guides
  );
  const postingParticipationRate = safeRate(
    metric.posting_participants,
    metric.community_total_guides
  );
  const campaignParticipationRate = safeRate(
    metric.campaign_participants,
    metric.community_total_guides
  );
  const compositeParticipationRate =
    trainingParticipationRate * MODULE_WEIGHTS.compositeParticipation.training_participation_rate +
    postingParticipationRate * MODULE_WEIGHTS.compositeParticipation.posting_participation_rate +
    campaignParticipationRate * MODULE_WEIGHTS.compositeParticipation.campaign_participation_rate;

  return {
    ...metric,
    premium_guide_rate: premiumGuideRate,
    activity_execution_rate: safeRate(
      metric.activity_executed_count,
      metric.activity_required_count
    ),
    task_close_rate: safeRate(metric.task_closed_count, metric.task_assigned_count),
    data_on_time_rate: safeRate(metric.data_on_time_count, metric.data_due_count),
    review_finish_rate: safeRate(
      metric.review_finished_count,
      metric.review_required_count
    ),
    community_active_rate: safeRate(
      metric.community_active_guides,
      metric.community_total_guides
    ),
    interaction_per_guide: safeRate(
      metric.community_interactions,
      metric.community_total_guides
    ),
    training_participation_rate: trainingParticipationRate,
    posting_participation_rate: postingParticipationRate,
    campaign_participation_rate: campaignParticipationRate,
    composite_participation_rate: compositeParticipationRate,
    social_engagement_total: metric.social_likes + metric.social_saves
  };
}

function scoreByTarget(actual: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) {
    return 0;
  }
  return clamp((Math.min(actual / target, 1.2) / 1.2) * 100);
}

function scoreByMax(actual: number, maxValue: number): number {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return 0;
  }
  return clamp((actual / maxValue) * 100);
}

function targetFor(
  metricName: string,
  metric: DerivedRegionMetric,
  targetConfig: TargetConfig
): number | undefined {
  return targetConfig[metric.region]?.[metricName];
}

function quantityScore(
  metricName: keyof DerivedRegionMetric,
  metric: DerivedRegionMetric,
  context: DerivedRegionMetric[],
  targetConfig: TargetConfig,
  scoreMode: ScoreMode
): number {
  const actual = Number(metric[metricName]);
  const target = targetFor(String(metricName), metric, targetConfig);
  if (scoreMode === "target" && target !== undefined) {
    return scoreByTarget(actual, target);
  }
  const maxValue = Math.max(...context.map((item) => Number(item[metricName]) || 0));
  return scoreByMax(actual, maxValue);
}

function ratioScore(value: number): number {
  return clamp(value * 100);
}

export function calculateModuleScores(
  metric: RegionMetric,
  contextMetrics: RegionMetric[],
  targetConfig: TargetConfig = TARGET_CONFIG,
  scoreMode: ScoreMode = SCORE_MODE
): ModuleScores {
  const derived = deriveRegionMetric(metric);
  const context = contextMetrics.map(deriveRegionMetric);

  const guide =
    quantityScore("cooperative_guides", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.guide.cooperative_guides +
    quantityScore("premium_guides", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.guide.premium_guides +
    ratioScore(derived.premium_guide_rate) * MODULE_WEIGHTS.guide.premium_guide_rate +
    quantityScore("new_guides", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.guide.new_guides;

  const execution =
    ratioScore(derived.activity_execution_rate) *
      MODULE_WEIGHTS.execution.activity_execution_rate +
    ratioScore(derived.task_close_rate) * MODULE_WEIGHTS.execution.task_close_rate +
    ratioScore(derived.data_on_time_rate) * MODULE_WEIGHTS.execution.data_on_time_rate +
    ratioScore(derived.review_finish_rate) *
      MODULE_WEIGHTS.execution.review_finish_rate;

  const community =
    ratioScore(derived.community_active_rate) *
      MODULE_WEIGHTS.community.community_active_rate +
    quantityScore("interaction_per_guide", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.community.interaction_per_guide +
    ratioScore(derived.composite_participation_rate) *
      MODULE_WEIGHTS.community.composite_participation_rate;

  const reputation =
    quantityScore("social_engagement_total", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.reputation.social_engagement_total +
    quantityScore("praise_count", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.reputation.praise_count +
    quantityScore("content_posts", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.reputation.content_posts;

  const conversion =
    quantityScore("rental_amount", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.conversion.rental_amount +
    quantityScore("phone_units", derived, context, targetConfig, scoreMode) *
      MODULE_WEIGHTS.conversion.phone_units;

  return {
    guide: round(guide),
    execution: round(execution),
    community: round(community),
    reputation: round(reputation),
    conversion: round(conversion)
  };
}

export function calculateRegionScore(moduleScores: ModuleScores): number {
  return round(
    moduleScores.guide * SCORE_WEIGHTS.guide +
      moduleScores.execution * SCORE_WEIGHTS.execution +
      moduleScores.community * SCORE_WEIGHTS.community +
      moduleScores.reputation * SCORE_WEIGHTS.reputation +
      moduleScores.conversion * SCORE_WEIGHTS.conversion
  );
}

function baseScoredRegions(
  metrics: RegionMetric[],
  contextMetrics: RegionMetric[],
  targetConfig: TargetConfig,
  scoreMode: ScoreMode
): ScoredRegionMetric[] {
  const scored = metrics.map((metric) => {
    const moduleScores = calculateModuleScores(metric, contextMetrics, targetConfig, scoreMode);
    return {
      ...deriveRegionMetric(metric),
      module_scores: moduleScores,
      region_score: calculateRegionScore(moduleScores),
      rank: 0,
      mom_region_score: null,
      yoy_region_score: null
    };
  });

  return scored
    .sort((a, b) => b.region_score - a.region_score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function calculateScoredRegions(
  metrics: RegionMetric[],
  contextMetrics: RegionMetric[],
  options?: {
    targetConfig?: TargetConfig;
    scoreMode?: ScoreMode;
    previousMetrics?: RegionMetric[];
    previousContextMetrics?: RegionMetric[];
    lastYearMetrics?: RegionMetric[];
    lastYearContextMetrics?: RegionMetric[];
  }
): ScoredRegionMetric[] {
  const targetConfig = options?.targetConfig ?? TARGET_CONFIG;
  const scoreMode = options?.scoreMode ?? SCORE_MODE;
  const current = baseScoredRegions(metrics, contextMetrics, targetConfig, scoreMode);

  const previous =
    options?.previousMetrics && options.previousContextMetrics
      ? baseScoredRegions(
          options.previousMetrics,
          options.previousContextMetrics,
          targetConfig,
          scoreMode
        )
      : [];
  const lastYear =
    options?.lastYearMetrics && options.lastYearContextMetrics
      ? baseScoredRegions(
          options.lastYearMetrics,
          options.lastYearContextMetrics,
          targetConfig,
          scoreMode
        )
      : [];

  const previousMap = new Map(previous.map((item) => [item.region, item.region_score]));
  const lastYearMap = new Map(lastYear.map((item) => [item.region, item.region_score]));

  return current.map((item) => ({
    ...item,
    mom_region_score: calculateGrowth(item.region_score, previousMap.get(item.region) ?? 0),
    yoy_region_score: calculateGrowth(item.region_score, lastYearMap.get(item.region) ?? 0)
  }));
}

export function averageModuleScores(metrics: ScoredRegionMetric[]): ModuleScores {
  if (metrics.length === 0) {
    return { guide: 0, execution: 0, community: 0, reputation: 0, conversion: 0 };
  }
  const total = metrics.reduce(
    (acc, item) => ({
      guide: acc.guide + item.module_scores.guide,
      execution: acc.execution + item.module_scores.execution,
      community: acc.community + item.module_scores.community,
      reputation: acc.reputation + item.module_scores.reputation,
      conversion: acc.conversion + item.module_scores.conversion
    }),
    { guide: 0, execution: 0, community: 0, reputation: 0, conversion: 0 }
  );
  return {
    guide: round(total.guide / metrics.length),
    execution: round(total.execution / metrics.length),
    community: round(total.community / metrics.length),
    reputation: round(total.reputation / metrics.length),
    conversion: round(total.conversion / metrics.length)
  };
}

export function weakestModule(metric: ScoredRegionMetric): keyof ModuleScores {
  return (Object.entries(metric.module_scores) as Array<[keyof ModuleScores, number]>).sort(
    (a, b) => a[1] - b[1]
  )[0][0];
}

export function strongestModule(metric: ScoredRegionMetric): keyof ModuleScores {
  return (Object.entries(metric.module_scores) as Array<[keyof ModuleScores, number]>).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
}

export function moduleLabel(module: keyof ModuleScores): string {
  return MODULE_LABELS[module];
}
