import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import type { ScoredRegionMetric } from "../../types/dashboard";
import { formatCurrency, formatNumber } from "../../utils/format";

type ReputationConversionScatterProps = {
  rows: ScoredRegionMetric[];
};

export function ReputationConversionScatter({ rows }: ReputationConversionScatterProps) {
  const data = rows.map((row) => ({
    region: row.region,
    reputation: row.social_engagement_total,
    conversion: row.rental_amount,
    phones: row.phone_units,
    score: row.region_score
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 18, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="reputation"
            name="社媒赞收量"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            dataKey="conversion"
            name="租机成交额"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <ZAxis dataKey="phones" range={[80, 360]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "租机成交额") return [formatCurrency(Number(value)), name];
              if (name === "社媒赞收量") return [formatNumber(Number(value)), name];
              return [value, name];
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.region ?? ""}
          />
          <Scatter name="区域" data={data} fill="#0066d6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
