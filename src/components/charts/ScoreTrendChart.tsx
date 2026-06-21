import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export type ScoreTrendPoint = {
  period: string;
  score: number;
  community: number;
  reputation: number;
  conversion: number;
};

type ScoreTrendChartProps = {
  data: ScoreTrendPoint[];
};

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}分`, ""]} />
          <Line
            type="monotone"
            dataKey="score"
            name="区域推进平均得分"
            stroke="#0066d6"
            strokeWidth={2.6}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="community"
            name="社群活跃"
            stroke="#10b981"
            strokeWidth={1.8}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="conversion"
            name="商业转化"
            stroke="#f59e0b"
            strokeWidth={1.8}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
