import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { MODULE_LABELS } from "../../config/dashboardConfig";
import type { ModuleScores } from "../../types/dashboard";

type ModuleRadarChartProps = {
  scores: ModuleScores;
};

export function ModuleRadarChart({ scores }: ModuleRadarChartProps) {
  const data = Object.entries(scores).map(([key, value]) => ({
    module: MODULE_LABELS[key as keyof ModuleScores],
    score: value
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#cbd5e1" />
          <PolarAngleAxis dataKey="module" tick={{ fill: "#475569", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}分`, "模块得分"]} />
          <Radar
            name="模块平均得分"
            dataKey="score"
            stroke="#0066d6"
            fill="#1684f8"
            fillOpacity={0.22}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
