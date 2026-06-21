import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type GuideStarChartProps = {
  data: Array<{ star: string; count: number }>;
};

export function GuideStarChart({ data }: GuideStarChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 12 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="star" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${value}人`, "导游数量"]} />
          <Bar dataKey="count" fill="#0066d6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
