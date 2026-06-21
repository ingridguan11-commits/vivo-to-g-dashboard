import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ScoredRegionMetric } from "../../types/dashboard";

type RankingBarChartProps = {
  rows: ScoredRegionMetric[];
};

export function RankingBarChart({ rows }: RankingBarChartProps) {
  const data = [...rows]
    .sort((a, b) => a.region_score - b.region_score)
    .map((row) => ({ region: row.region, score: row.region_score }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis
            dataKey="region"
            type="category"
            width={46}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}分`, "推进得分"]} />
          <Bar dataKey="score" fill="#0066d6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
