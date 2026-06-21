import type { Region, ScoreMode, TargetConfig } from "../types/dashboard";

export const REGIONS: Region[] = [
  "苏皖",
  "河南",
  "上海",
  "浙江",
  "湖南",
  "贵州",
  "广州",
  "四川",
  "北京",
  "山东"
];

export const SCORE_MODE: ScoreMode = "relative";

export const SCORE_MODE_LABEL: Record<ScoreMode, string> = {
  relative: "区域相对表现得分",
  target: "目标达成得分"
};

export const SCORE_WEIGHTS = {
  guide: 0.25,
  execution: 0.25,
  community: 0.15,
  reputation: 0.2,
  conversion: 0.15
} as const;

export const MODULE_WEIGHTS = {
  guide: {
    cooperative_guides: 0.3,
    premium_guides: 0.3,
    premium_guide_rate: 0.3,
    new_guides: 0.1
  },
  execution: {
    activity_execution_rate: 0.4,
    task_close_rate: 0.3,
    data_on_time_rate: 0.2,
    review_finish_rate: 0.1
  },
  community: {
    community_active_rate: 0.5,
    interaction_per_guide: 0.3,
    composite_participation_rate: 0.2
  },
  compositeParticipation: {
    training_participation_rate: 0.3,
    posting_participation_rate: 0.3,
    campaign_participation_rate: 0.4
  },
  reputation: {
    social_engagement_total: 0.4,
    praise_count: 0.35,
    content_posts: 0.25
  },
  conversion: {
    rental_amount: 0.6,
    phone_units: 0.4
  }
} as const;

export const MODULE_LABELS = {
  guide: "导游建设",
  execution: "运营执行",
  community: "社群活跃",
  reputation: "传播口碑",
  conversion: "商业转化"
} as const;

export const TARGET_CONFIG: TargetConfig = {};

export const TARGET_CONFIG_HINTS = [
  "每区域合作导游目标",
  "优质导游目标",
  "活动执行目标",
  "社群活跃目标",
  "传播目标",
  "租售转化目标"
];

export const FORMULA_TEXT = {
  regionScore:
    "区域推进得分 = 导游建设25% + 运营执行25% + 社群活跃15% + 传播口碑20% + 商业转化15%；出团天数、环比、同比不进入得分。",
  guide:
    "导游建设 = 合作导游数量30% + 优质导游数量30% + 优质导游占比30% + 新增导游数量10%。",
  execution:
    "运营执行 = 活动方案执行率40% + 任务闭环率30% + 数据提交及时率20% + 复盘完成率10%。",
  community:
    "社群活跃 = 社群活跃率50% + 人均互动次数30% + 综合活动参与率20%；综合活动参与率 = 培训30% + 投稿30% + 活动40%。",
  reputation: "传播口碑 = 社媒赞收量40% + 团友好评数35% + 内容发布量25%。",
  conversion: "商业转化 = 租机成交额60% + 售机台数40%。"
};
