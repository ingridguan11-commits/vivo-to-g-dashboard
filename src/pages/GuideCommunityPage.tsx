import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { GuideStarChart } from "../components/charts/GuideStarChart";
import { Panel } from "../components/common/Panel";
import { GuideDetailTable } from "../components/tables/GuideDetailTable";
import type { GuidePerformance, ScoredRegionMetric } from "../types/dashboard";
import { formatCurrency, formatNumber, formatRateAsPercent } from "../utils/format";

export type GuideTrendPoint = {
  period: string;
  interactions: number;
  premiumRate: number;
};

type GuideCommunityPageProps = {
  guides: GuidePerformance[];
  rows: ScoredRegionMetric[];
  trendData: GuideTrendPoint[];
};

function guideValue(row: GuidePerformance) {
  return (
    row.social_engagement_total +
    row.praise_count * 18 +
    row.phone_units * 80 +
    row.rental_amount / 80 +
    row.community_interactions * 6
  );
}

export function GuideCommunityPage({ guides, rows, trendData }: GuideCommunityPageProps) {
  const starData = [3, 4, 5].map((star) => ({
    star: `${star}星`,
    count: guides.filter((guide) => guide.star_level === star).length
  }));
  const topGuides = guides
    .filter((guide) => guide.is_premium)
    .sort((a, b) => guideValue(b) - guideValue(a))
    .slice(0, 10);
  const communityRank = [...rows].sort((a, b) => b.community_active_rate - a.community_active_rate);
  const participationData = rows.map((row) => ({
    region: row.region,
    培训: Number((row.training_participation_rate * 100).toFixed(1)),
    投稿: Number((row.posting_participation_rate * 100).toFixed(1)),
    活动: Number((row.campaign_participation_rate * 100).toFixed(1))
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr_1.1fr]">
        <Panel title="3星 / 4星 / 5星导游分布" subtitle="优质导游定义为4-5星">
          <GuideStarChart data={starData} />
        </Panel>
        <Panel title="优质导游占比趋势" subtitle="按当前区域筛选联动">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "优质导游占比"]} />
                <Line type="monotone" dataKey="premiumRate" stroke="#0066d6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="社群互动次数趋势" subtitle="导游周期表现表汇总">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${formatNumber(Number(value))}次`, "社群互动"]} />
                <Line type="monotone" dataKey="interactions" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="TOP10 优质导游名单" subtitle="综合内容、口碑、转化和社群互动排序">
          <div className="space-y-3">
            {topGuides.map((guide, index) => (
              <div key={guide.guide_id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div>
                  <div className="font-semibold text-ink-950">
                    {index + 1}. {guide.guide_name}
                    <span className="ml-2 text-xs text-vivo-700">{guide.region}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {guide.agency_name} · {guide.star_level}星 · 社媒赞收 {formatNumber(guide.social_engagement_total)}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>{formatCurrency(guide.rental_amount)}</div>
                  <div className="text-xs">售机 {formatNumber(guide.phone_units)}台</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="区域社群活跃率排行" subtitle="体现区域公司与导游社群之间的互动活跃程度">
          <div className="space-y-3">
            {communityRank.map((row) => (
              <div key={row.region}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{row.region}</span>
                  <span className="font-semibold text-vivo-700">{formatRateAsPercent(row.community_active_rate)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-vivo-600"
                    style={{ width: `${Math.min(row.community_active_rate * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="培训 / 投稿 / 活动参与情况" subtitle="综合活动参与率 = 培训参与率30% + 投稿参与率30% + 活动参与率40%">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData} margin={{ left: 0, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="region" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]} />
              <Bar dataKey="培训" stackId="a" fill="#0066d6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="投稿" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="活动" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="导游表现明细表" subtitle="由 guide_profiles 与当前周期 guide_metrics 关联生成">
        <GuideDetailTable rows={guides} />
      </Panel>
    </div>
  );
}
