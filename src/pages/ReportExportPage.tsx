import { Copy, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Panel } from "../components/common/Panel";
import { RegionCompareTable } from "../components/tables/RegionCompareTable";
import type { DashboardFilter, ScoredRegionMetric } from "../types/dashboard";
import { buildRegionCompareCsv, downloadCsv } from "../utils/csv";
import { formatCurrency, formatNumber, formatRateAsPercent, formatScore } from "../utils/format";
import { getPeriodLabel } from "../utils/period";
import { buildReportSections, generateMonthlySummary } from "../utils/report";
import { moduleLabel, weakestModule } from "../utils/score";

type ReportExportPageProps = {
  rows: ScoredRegionMetric[];
  filter: DashboardFilter;
};

export function ReportExportPage({ rows, filter }: ReportExportPageProps) {
  const [copied, setCopied] = useState(false);
  const summary = useMemo(() => generateMonthlySummary(rows, filter), [filter, rows]);
  const sections = useMemo(() => buildReportSections(rows), [rows]);

  const exportCsv = () => {
    const csv = buildRegionCompareCsv(rows);
    downloadCsv(`vivo-to-g-region-compare-${filter.year}-${filter.month}-${filter.week}.csv`, csv);
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="本期整体数据概览" subtitle={getPeriodLabel(filter)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">区域平均推进得分</div>
              <div className="mt-1 text-xl font-semibold text-ink-950">{formatScore(sections.totals.averageScore)}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">合作导游 / 优质导游</div>
              <div className="mt-1 text-xl font-semibold text-ink-950">
                {formatNumber(sections.totals.cooperativeGuides)} / {formatNumber(sections.totals.premiumGuides)}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">优质导游占比 / 社群活跃率</div>
              <div className="mt-1 text-xl font-semibold text-ink-950">
                {formatRateAsPercent(sections.totals.premiumGuideRate)} / {formatRateAsPercent(sections.totals.communityActiveRate)}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">租机成交额 / 售机台数</div>
              <div className="mt-1 text-xl font-semibold text-ink-950">
                {formatCurrency(sections.totals.rentalAmount)} / {formatNumber(sections.totals.phoneUnits)}台
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-md bg-vivo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-vivo-700"
            >
              <Download className="h-4 w-4" />
              导出区域对比 CSV
            </button>
          </div>
        </Panel>

        <Panel title="文字版月报摘要" subtitle="可直接复制到周报、月报或复盘材料">
          <textarea
            readOnly
            value={summary}
            className="h-56 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none"
          />
          <button
            type="button"
            onClick={copySummary}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-vivo-200 bg-white px-4 py-2 text-sm font-semibold text-vivo-700 hover:bg-vivo-50"
          >
            <Copy className="h-4 w-4" />
            {copied ? "已复制" : "复制月报摘要"}
          </button>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="TOP3 区域亮点">
          <div className="space-y-3">
            {sections.top3.map((row) => (
              <div key={row.region} className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                <div className="font-semibold text-ink-950">{row.rank}. {row.region}</div>
                <div className="mt-1 text-sm text-slate-600">
                  得分 {row.region_score.toFixed(1)}，社群活跃率 {formatRateAsPercent(row.community_active_rate)}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="待提升区域问题">
          <div className="space-y-3">
            {sections.bottom3.map((row) => (
              <div key={row.region} className="rounded-lg border border-amber-100 bg-amber-50/70 p-3">
                <div className="font-semibold text-ink-950">{row.region}</div>
                <div className="mt-1 text-sm text-slate-600">
                  短板模块：{moduleLabel(weakestModule(row))}，建议纳入下期跟进事项。
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="下期建议跟进事项">
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>跟进总部活动方案执行率与任务闭环率偏低区域。</li>
            <li>优先提升4-5星导游培育、投稿参与和社群互动反馈。</li>
            <li>针对声量高但转化弱区域复盘租机链路和售机触点。</li>
            <li>沉淀TOP区域打法，形成跨区域导游社群运营案例。</li>
          </ul>
        </Panel>
      </div>

      <Panel title="当前筛选后的区域对比表" subtitle="CSV 导出内容与下表一致">
        <RegionCompareTable rows={rows} />
      </Panel>
    </div>
  );
}
