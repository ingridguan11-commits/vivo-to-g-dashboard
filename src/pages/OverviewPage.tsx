import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  MessageSquareHeart,
  Phone,
  Star,
  ThumbsUp,
  Users
} from "lucide-react";
import { FORMULA_TEXT } from "../config/dashboardConfig";
import { RankingBarChart } from "../components/charts/RankingBarChart";
import { ScoreTrendChart, type ScoreTrendPoint } from "../components/charts/ScoreTrendChart";
import { ModuleRadarChart } from "../components/charts/ModuleRadarChart";
import { KpiCard } from "../components/common/KpiCard";
import { Panel } from "../components/common/Panel";
import type { ScoredRegionMetric } from "../types/dashboard";
import { calculateGrowth, averageModuleScores, moduleLabel, strongestModule, weakestModule } from "../utils/score";
import { formatCurrency, formatNumber, formatRateAsPercent, formatScore } from "../utils/format";
import { summarizeRegions } from "../utils/report";

type OverviewPageProps = {
  rows: ScoredRegionMetric[];
  previousRows: ScoredRegionMetric[];
  lastYearRows: ScoredRegionMetric[];
  trendData: ScoreTrendPoint[];
};

function growthFor(
  current: number,
  previousRows: ScoredRegionMetric[],
  lastYearRows: ScoredRegionMetric[],
  selector: (row: ScoredRegionMetric) => number
) {
  const previous = previousRows.reduce((sum, row) => sum + selector(row), 0);
  const lastYear = lastYearRows.reduce((sum, row) => sum + selector(row), 0);
  return {
    mom: calculateGrowth(current, previous),
    yoy: calculateGrowth(current, lastYear)
  };
}

export function OverviewPage({ rows, previousRows, lastYearRows, trendData }: OverviewPageProps) {
  const totals = summarizeRegions(rows);
  const previousTotals = summarizeRegions(previousRows);
  const lastYearTotals = summarizeRegions(lastYearRows);
  const moduleScores = averageModuleScores(rows);
  const top3 = [...rows].sort((a, b) => b.region_score - a.region_score).slice(0, 3);
  const bottom3 = [...rows].sort((a, b) => a.region_score - b.region_score).slice(0, 3);

  const averageGrowth = {
    mom: calculateGrowth(totals.averageScore, previousTotals.averageScore),
    yoy: calculateGrowth(totals.averageScore, lastYearTotals.averageScore)
  };
  const guideGrowth = growthFor(totals.cooperativeGuides, previousRows, lastYearRows, (row) => row.cooperative_guides);
  const premiumGrowth = growthFor(totals.premiumGuides, previousRows, lastYearRows, (row) => row.premium_guides);
  const socialGrowth = growthFor(totals.socialEngagementTotal, previousRows, lastYearRows, (row) => row.social_engagement_total);
  const praiseGrowth = growthFor(totals.praiseCount, previousRows, lastYearRows, (row) => row.praise_count);
  const rentalGrowth = growthFor(totals.rentalAmount, previousRows, lastYearRows, (row) => row.rental_amount);
  const phoneGrowth = growthFor(totals.phoneUnits, previousRows, lastYearRows, (row) => row.phone_units);
  const travelGrowth = growthFor(totals.travelDays, previousRows, lastYearRows, (row) => row.travel_days);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="区域推进平均得分"
          value={formatScore(totals.averageScore)}
          subtitle="当前为区域相对表现得分"
          mom={averageGrowth.mom}
          yoy={averageGrowth.yoy}
          icon={BadgeCheck}
          info={FORMULA_TEXT.regionScore}
        />
        <KpiCard
          title="合作导游数量"
          value={`${formatNumber(totals.cooperativeGuides)}人`}
          mom={guideGrowth.mom}
          yoy={guideGrowth.yoy}
          icon={Users}
        />
        <KpiCard
          title="优质导游数量"
          value={`${formatNumber(totals.premiumGuides)}人`}
          subtitle={`占比 ${formatRateAsPercent(totals.premiumGuideRate)}`}
          mom={premiumGrowth.mom}
          yoy={premiumGrowth.yoy}
          icon={Star}
          info="4-5星导游定义为优质导游"
        />
        <KpiCard
          title="优质导游占比"
          value={formatRateAsPercent(totals.premiumGuideRate)}
          mom={calculateGrowth(totals.premiumGuideRate, previousTotals.premiumGuideRate)}
          yoy={calculateGrowth(totals.premiumGuideRate, lastYearTotals.premiumGuideRate)}
          icon={BadgeCheck}
          info="优质导游占比 = 优质导游数量 / 合作导游数量"
        />
        <KpiCard
          title="社群活跃率"
          value={formatRateAsPercent(totals.communityActiveRate)}
          mom={calculateGrowth(totals.communityActiveRate, previousTotals.communityActiveRate)}
          yoy={calculateGrowth(totals.communityActiveRate, lastYearTotals.communityActiveRate)}
          icon={MessageSquareHeart}
          info={FORMULA_TEXT.community}
        />
        <KpiCard
          title="社媒赞收量"
          value={formatNumber(totals.socialEngagementTotal)}
          mom={socialGrowth.mom}
          yoy={socialGrowth.yoy}
          icon={ThumbsUp}
          info="点赞量 + 收藏量"
        />
        <KpiCard
          title="团友好评数"
          value={formatNumber(totals.praiseCount)}
          mom={praiseGrowth.mom}
          yoy={praiseGrowth.yoy}
          icon={ThumbsUp}
        />
        <KpiCard
          title="租机成交额"
          value={formatCurrency(totals.rentalAmount)}
          mom={rentalGrowth.mom}
          yoy={rentalGrowth.yoy}
          icon={Banknote}
        />
        <KpiCard
          title="售机台数"
          value={`${formatNumber(totals.phoneUnits)}台`}
          mom={phoneGrowth.mom}
          yoy={phoneGrowth.yoy}
          icon={Phone}
        />
        <KpiCard
          title="出团天数"
          value={`${formatNumber(totals.travelDays)}天`}
          subtitle="业务背景指标，不进入得分"
          mom={travelGrowth.mom}
          yoy={travelGrowth.yoy}
          icon={CalendarClock}
          info="出团天数受旅行社业务与旅游淡旺季影响，只辅助分析机会量。"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_1.4fr]">
        <Panel title="十个区域推进得分排行榜" subtitle="得分口径：区域相对表现得分" info={FORMULA_TEXT.regionScore}>
          <RankingBarChart rows={rows} />
        </Panel>
        <Panel title="区域推进得分趋势" subtitle="按当前筛选区域计算平均值">
          <ScoreTrendChart data={trendData} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Panel title="五大模块平均得分" subtitle="用于观察项目推进结构是否均衡" info={FORMULA_TEXT.regionScore}>
          <ModuleRadarChart scores={moduleScores} />
        </Panel>
        <Panel title="TOP3 区域与待提升区域">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-emerald-700">TOP3 区域亮点</h3>
              <div className="space-y-3">
                {top3.map((row) => (
                  <div key={row.region} className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-950">{row.rank}. {row.region}</span>
                      <span className="text-sm font-semibold text-emerald-700">{row.region_score.toFixed(1)}分</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      优势模块：{moduleLabel(strongestModule(row))}，社媒赞收 {formatNumber(row.social_engagement_total)}。
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-amber-700">待提升区域</h3>
              <div className="space-y-3">
                {bottom3.map((row) => (
                  <div key={row.region} className="rounded-lg border border-amber-100 bg-amber-50/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-950">{row.region}</span>
                      <span className="text-sm font-semibold text-amber-700">{row.region_score.toFixed(1)}分</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      短板模块：{moduleLabel(weakestModule(row))}，建议优先复盘执行闭环与导游社群动作。
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
