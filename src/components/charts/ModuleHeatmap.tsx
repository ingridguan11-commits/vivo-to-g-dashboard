import { MODULE_LABELS } from "../../config/dashboardConfig";
import type { ModuleScores, ScoredRegionMetric } from "../../types/dashboard";

type ModuleHeatmapProps = {
  rows: ScoredRegionMetric[];
};

function cellClass(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-800";
  if (score >= 70) return "bg-vivo-50 text-vivo-800";
  if (score >= 55) return "bg-amber-50 text-amber-800";
  return "bg-rose-50 text-rose-700";
}

export function ModuleHeatmap({ rows }: ModuleHeatmapProps) {
  const modules = Object.keys(MODULE_LABELS) as Array<keyof ModuleScores>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white px-2 py-2 text-left text-xs font-semibold text-slate-500">
              区域
            </th>
            {modules.map((module) => (
              <th key={module} className="px-2 py-2 text-center text-xs font-semibold text-slate-500">
                {MODULE_LABELS[module]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.region}>
              <td className="sticky left-0 bg-white px-2 py-2 font-medium text-slate-700">
                {row.region}
              </td>
              {modules.map((module) => (
                <td key={module} className="px-1 py-1 text-center">
                  <span
                    className={`block rounded-md px-3 py-2 font-semibold ${cellClass(
                      row.module_scores[module]
                    )}`}
                  >
                    {row.module_scores[module].toFixed(1)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
