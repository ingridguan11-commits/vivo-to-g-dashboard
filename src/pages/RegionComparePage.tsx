import { FORMULA_TEXT } from "../config/dashboardConfig";
import { ModuleHeatmap } from "../components/charts/ModuleHeatmap";
import { RankingBarChart } from "../components/charts/RankingBarChart";
import { ReputationConversionScatter } from "../components/charts/ReputationConversionScatter";
import { Panel } from "../components/common/Panel";
import { RegionCompareTable } from "../components/tables/RegionCompareTable";
import type { ScoredRegionMetric } from "../types/dashboard";

type RegionComparePageProps = {
  rows: ScoredRegionMetric[];
};

export function RegionComparePage({ rows }: RegionComparePageProps) {
  return (
    <div className="space-y-5">
      <Panel
        title="区域对比矩阵表"
        subtitle="表头可排序，鼠标悬停可查看关键公式说明"
        info={FORMULA_TEXT.regionScore}
      >
        <RegionCompareTable rows={rows} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="区域推进得分横向柱状图" subtitle="识别综合推进靠前与待提升区域">
          <RankingBarChart rows={rows} />
        </Panel>
        <Panel title="五大模块得分热力图" subtitle="绿色代表强项，橙红代表预警">
          <ModuleHeatmap rows={rows} />
        </Panel>
      </div>

      <Panel
        title="传播口碑 vs 商业转化"
        subtitle="用于识别声量高但租售转化偏弱的区域"
        info="横轴为社媒赞收量，纵轴为租机成交额，气泡大小参考售机台数。"
      >
        <ReputationConversionScatter rows={rows} />
      </Panel>
    </div>
  );
}
