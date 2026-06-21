export type Region =
  | "苏皖"
  | "河南"
  | "上海"
  | "浙江"
  | "湖南"
  | "贵州"
  | "广州"
  | "四川"
  | "北京"
  | "山东";

export type PeriodType = "year" | "month" | "week";
export type MetricBasis = "period" | "cumulative";
export type ScoreMode = "relative" | "target";

export type DashboardFilter = {
  periodType: PeriodType;
  year: number;
  month: number;
  week: number;
  selectedRegions: Region[];
  basis: MetricBasis;
};

export type RegionMetric = {
  period_date: string;
  year: number;
  month: number;
  week: number;
  period_type: PeriodType;
  region: Region;
  cooperative_guides: number;
  premium_guides: number;
  new_guides: number;
  travel_days: number;
  activity_required_count: number;
  activity_executed_count: number;
  task_assigned_count: number;
  task_closed_count: number;
  data_due_count: number;
  data_on_time_count: number;
  review_required_count: number;
  review_finished_count: number;
  community_total_guides: number;
  community_active_guides: number;
  community_interactions: number;
  training_participants: number;
  posting_participants: number;
  campaign_participants: number;
  content_posts: number;
  social_likes: number;
  social_saves: number;
  praise_count: number;
  rental_amount: number;
  phone_units: number;
};

export type GuideProfile = {
  guide_id: string;
  guide_name: string;
  region: Region;
  agency_name: string;
  star_level: 1 | 2 | 3 | 4 | 5;
  is_premium: boolean;
  join_date: string;
};

export type GuideMetric = {
  period_date: string;
  year: number;
  month: number;
  week: number;
  period_type: PeriodType;
  guide_id: string;
  region: Region;
  is_active: boolean;
  travel_days: number;
  uploaded_photos: number;
  content_posts: number;
  social_likes: number;
  social_saves: number;
  praise_count: number;
  rental_amount: number;
  phone_units: number;
  community_interactions: number;
  training_joined: boolean;
  posting_joined: boolean;
  campaign_joined: boolean;
  last_active_date: string;
};

export type ModuleScores = {
  guide: number;
  execution: number;
  community: number;
  reputation: number;
  conversion: number;
};

export type DerivedRegionMetric = RegionMetric & {
  premium_guide_rate: number;
  activity_execution_rate: number;
  task_close_rate: number;
  data_on_time_rate: number;
  review_finish_rate: number;
  community_active_rate: number;
  interaction_per_guide: number;
  training_participation_rate: number;
  posting_participation_rate: number;
  campaign_participation_rate: number;
  composite_participation_rate: number;
  social_engagement_total: number;
};

export type ScoredRegionMetric = DerivedRegionMetric & {
  module_scores: ModuleScores;
  region_score: number;
  rank: number;
  mom_region_score: number | null;
  yoy_region_score: number | null;
};

export type GuidePerformance = GuideProfile &
  GuideMetric & {
    social_engagement_total: number;
  };

export type TargetConfig = Partial<Record<Region, Partial<Record<string, number>>>>;

export type SortDirection = "asc" | "desc";
