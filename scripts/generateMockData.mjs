import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/data");

const regions = ["苏皖", "河南", "上海", "浙江", "湖南", "贵州", "广州", "四川", "北京", "山东"];

const regionFactors = {
  苏皖: { guide: 1.16, execution: 1.03, community: 1.18, reputation: 0.98, conversion: 0.92 },
  河南: { guide: 1.05, execution: 0.96, community: 0.95, reputation: 0.9, conversion: 0.88 },
  上海: { guide: 0.96, execution: 1.12, community: 1.04, reputation: 1.25, conversion: 1.18 },
  浙江: { guide: 1.08, execution: 1.13, community: 1.06, reputation: 1.18, conversion: 1.12 },
  湖南: { guide: 1.02, execution: 0.92, community: 1.0, reputation: 1.04, conversion: 0.86 },
  贵州: { guide: 0.95, execution: 0.9, community: 0.98, reputation: 1.02, conversion: 0.8 },
  广州: { guide: 1.0, execution: 1.08, community: 1.02, reputation: 1.2, conversion: 1.2 },
  四川: { guide: 1.14, execution: 1.0, community: 1.16, reputation: 1.08, conversion: 0.95 },
  北京: { guide: 0.9, execution: 1.1, community: 0.96, reputation: 1.1, conversion: 1.04 },
  山东: { guide: 1.03, execution: 0.98, community: 0.94, reputation: 0.96, conversion: 0.9 }
};

const agencies = {
  苏皖: ["南京远行国旅", "合肥光影文旅", "苏州悦游社"],
  河南: ["郑州中原旅业", "洛阳山河国旅", "开封宋韵文旅"],
  上海: ["上海漫行旅行", "浦江城市旅业", "海派观光社"],
  浙江: ["杭州山海旅行", "宁波风物国旅", "温州云帆文旅"],
  湖南: ["长沙湘遇旅行", "张家界云上国旅", "岳阳洞庭文旅"],
  贵州: ["贵阳黔行国旅", "荔波山水旅行", "安顺瀑乡文旅"],
  广州: ["广州南风旅行", "佛山岭南国旅", "珠海海岸文旅"],
  四川: ["成都慢游旅行", "川西星空国旅", "乐山山川文旅"],
  北京: ["北京城迹旅行", "燕京风物国旅", "长城漫旅社"],
  山东: ["济南泉城旅行", "青岛海岸国旅", "烟台山海文旅"]
};

const surnames = ["陈", "王", "李", "赵", "周", "徐", "吴", "郑", "孙", "何", "高", "林", "黄", "许", "梁", "宋"];
const givenNames = ["嘉宁", "思远", "明澈", "雨桐", "亦凡", "梓涵", "星然", "若溪", "景行", "清越", "子墨", "舒航", "安然", "晓舟", "知夏", "云起"];

let seed = 20260620;
function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function int(min, max) {
  return Math.round(min + rand() * (max - min));
}

function chance(probability) {
  return rand() < probability;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value) {
  return Math.round(value);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function monthEnd(year, month) {
  return `${year}-${pad(month)}-28`;
}

function weekEnd(year, week) {
  const date = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7 + 5));
  return date.toISOString().slice(0, 10);
}

function weekStart(year, week) {
  const date = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  return date.toISOString().slice(0, 10);
}

function isBetween(date, start, end) {
  return date >= start && date <= end;
}

function joinedBy(profile, periodDate) {
  return profile.join_date <= periodDate;
}

const guideProfiles = [];
regions.forEach((region, regionIndex) => {
  const factor = regionFactors[region];
  const guideCount = int(15, 20);
  for (let index = 0; index < guideCount; index += 1) {
    const starRoll = rand() * factor.guide;
    const starLevel = starRoll > 0.86 ? 5 : starRoll > 0.48 ? 4 : starRoll > 0.18 ? 3 : 2;
    const joinYear = chance(0.72) ? 2024 : chance(0.55) ? 2025 : 2026;
    const joinMonth = joinYear === 2026 ? int(1, 5) : int(1, 12);
    const joinDay = int(3, 24);
    guideProfiles.push({
      guide_id: `G-${pad(regionIndex + 1)}-${pad(index + 1)}`,
      guide_name: `${surnames[(regionIndex + index) % surnames.length]}${givenNames[(index * 3 + regionIndex) % givenNames.length]}`,
      region,
      agency_name: agencies[region][index % agencies[region].length],
      star_level: starLevel,
      is_premium: starLevel >= 4,
      join_date: `${joinYear}-${pad(joinMonth)}-${pad(joinDay)}`
    });
  }
});

function guidePeriodMetric(profile, period) {
  const factor = regionFactors[profile.region];
  if (!joinedBy(profile, period.period_date)) {
    return null;
  }

  const monthSeason = period.period_type === "week" ? 1 + Math.sin(period.week / 4) * 0.08 : 1 + Math.sin(period.month / 2) * 0.12;
  const starBoost = 0.72 + profile.star_level * 0.08;
  const activeProbability = clamp(0.42 * factor.community * starBoost * monthSeason, 0.18, 0.92);
  const isActive = chance(activeProbability);
  const scale = period.period_type === "week" ? 0.28 : 1;
  const travelDays = isActive ? int(0, round((7 + profile.star_level * 2.2) * scale * factor.guide * monthSeason)) : int(0, round(2 * scale));
  const uploadedPhotos = isActive ? int(travelDays, travelDays * 5 + profile.star_level * 3) : int(0, 3);
  const contentPosts = isActive ? int(0, round((1.5 + profile.star_level * 0.8) * scale * factor.reputation)) : 0;
  const socialLikes = round((contentPosts * int(18, 54) + uploadedPhotos * int(1, 5)) * factor.reputation);
  const socialSaves = round((contentPosts * int(5, 18) + uploadedPhotos * int(0, 2)) * factor.reputation);
  const praiseCount = isActive ? round(travelDays * clamp(0.55 + profile.star_level * 0.08 + rand() * 0.28, 0.2, 1.1)) : 0;
  const phoneUnits = isActive ? round(contentPosts * factor.conversion * rand() * 0.9 + praiseCount * 0.05 * factor.conversion) : 0;
  const rentalAmount = round((travelDays * int(80, 180) + phoneUnits * int(120, 320)) * factor.conversion);
  const communityInteractions = isActive ? int(1, round((4 + profile.star_level * 2.2) * scale * factor.community)) : int(0, 2);
  const trainingJoined = isActive && chance(clamp(0.32 * factor.community, 0.12, 0.72));
  const postingJoined = isActive && chance(clamp(0.38 * factor.community * factor.reputation, 0.1, 0.78));
  const campaignJoined = isActive && chance(clamp(0.34 * factor.community, 0.08, 0.74));

  return {
    period_date: period.period_date,
    year: period.year,
    month: period.month,
    week: period.week,
    period_type: period.period_type,
    guide_id: profile.guide_id,
    region: profile.region,
    is_active: isActive,
    travel_days: travelDays,
    uploaded_photos: uploadedPhotos,
    content_posts: contentPosts,
    social_likes: socialLikes,
    social_saves: socialSaves,
    praise_count: praiseCount,
    rental_amount: rentalAmount,
    phone_units: phoneUnits,
    community_interactions: communityInteractions,
    training_joined: trainingJoined,
    posting_joined: postingJoined,
    campaign_joined: campaignJoined,
    last_active_date: isActive ? period.period_date : period.period_type === "week" ? weekStart(period.year, Math.max(1, period.week - 1)) : `${period.year}-${pad(Math.max(1, period.month - 1))}-20`
  };
}

const monthPeriods = [];
for (const year of [2025, 2026]) {
  const maxMonth = year === 2026 ? 6 : 12;
  for (let month = 1; month <= maxMonth; month += 1) {
    monthPeriods.push({
      period_date: monthEnd(year, month),
      year,
      month,
      week: 0,
      period_type: "month"
    });
  }
}

const weekPeriods = [];
for (const year of [2025, 2026]) {
  for (let week = 1; week <= 24; week += 1) {
    weekPeriods.push({
      period_date: weekEnd(year, week),
      year,
      month: Math.min(12, Math.ceil(week / 4.35)),
      week,
      period_type: "week"
    });
  }
}

const guideMetrics = [...monthPeriods, ...weekPeriods]
  .flatMap((period) => guideProfiles.map((profile) => guidePeriodMetric(profile, period)))
  .filter(Boolean);

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function executionCounts(region, period) {
  const factor = regionFactors[region];
  const scale = period.period_type === "week" ? 0.32 : 1;
  const activityRequired = Math.max(1, round(int(4, 9) * scale));
  const taskAssigned = Math.max(2, round(int(8, 18) * scale));
  const dataDue = Math.max(1, round(int(4, 8) * scale));
  const reviewRequired = Math.max(1, round(int(2, 5) * scale));
  const executionRate = clamp(0.64 + factor.execution * 0.22 + (rand() - 0.5) * 0.12, 0.48, 1);
  const closeRate = clamp(0.6 + factor.execution * 0.24 + (rand() - 0.5) * 0.14, 0.45, 1);
  const onTimeRate = clamp(0.66 + factor.execution * 0.2 + (rand() - 0.5) * 0.12, 0.48, 1);
  const reviewRate = clamp(0.58 + factor.execution * 0.25 + (rand() - 0.5) * 0.16, 0.4, 1);

  return {
    activity_required_count: activityRequired,
    activity_executed_count: Math.min(activityRequired, round(activityRequired * executionRate)),
    task_assigned_count: taskAssigned,
    task_closed_count: Math.min(taskAssigned, round(taskAssigned * closeRate)),
    data_due_count: dataDue,
    data_on_time_count: Math.min(dataDue, round(dataDue * onTimeRate)),
    review_required_count: reviewRequired,
    review_finished_count: Math.min(reviewRequired, round(reviewRequired * reviewRate))
  };
}

function regionMetricForPeriod(region, period) {
  const periodGuideMetrics = guideMetrics.filter(
    (row) => row.region === region && row.period_type === period.period_type && row.period_date === period.period_date
  );
  const periodProfiles = guideProfiles.filter((profile) => profile.region === region && joinedBy(profile, period.period_date));
  const periodStart =
    period.period_type === "week"
      ? weekStart(period.year, period.week)
      : `${period.year}-${pad(period.month || 1)}-01`;
  const newGuides = periodProfiles.filter((profile) => isBetween(profile.join_date, periodStart, period.period_date)).length;

  return {
    period_date: period.period_date,
    year: period.year,
    month: period.month,
    week: period.week,
    period_type: period.period_type,
    region,
    cooperative_guides: periodProfiles.length,
    premium_guides: periodProfiles.filter((profile) => profile.is_premium).length,
    new_guides: newGuides,
    travel_days: sum(periodGuideMetrics, "travel_days"),
    ...executionCounts(region, period),
    community_total_guides: periodProfiles.length,
    community_active_guides: periodGuideMetrics.filter((row) => row.is_active).length,
    community_interactions: sum(periodGuideMetrics, "community_interactions"),
    training_participants: periodGuideMetrics.filter((row) => row.training_joined).length,
    posting_participants: periodGuideMetrics.filter((row) => row.posting_joined).length,
    campaign_participants: periodGuideMetrics.filter((row) => row.campaign_joined).length,
    content_posts: sum(periodGuideMetrics, "content_posts"),
    social_likes: sum(periodGuideMetrics, "social_likes"),
    social_saves: sum(periodGuideMetrics, "social_saves"),
    praise_count: sum(periodGuideMetrics, "praise_count"),
    rental_amount: sum(periodGuideMetrics, "rental_amount"),
    phone_units: sum(periodGuideMetrics, "phone_units")
  };
}

const regionMetrics = [...monthPeriods, ...weekPeriods].flatMap((period) =>
  regions.map((region) => regionMetricForPeriod(region, period))
);

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "guide_profiles.json"), JSON.stringify(guideProfiles, null, 2));
writeFileSync(resolve(outDir, "guide_metrics.json"), JSON.stringify(guideMetrics, null, 2));
writeFileSync(resolve(outDir, "region_metrics.json"), JSON.stringify(regionMetrics, null, 2));

console.log(`Generated ${guideProfiles.length} guide profiles`);
console.log(`Generated ${guideMetrics.length} guide metrics`);
console.log(`Generated ${regionMetrics.length} region metrics`);
