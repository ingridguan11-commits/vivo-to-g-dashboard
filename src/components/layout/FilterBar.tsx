import { CalendarDays, Check, RotateCcw } from "lucide-react";
import { REGIONS } from "../../config/dashboardConfig";
import type { DashboardFilter, MetricBasis, PeriodType, Region } from "../../types/dashboard";

type FilterBarProps = {
  filter: DashboardFilter;
  years: number[];
  months: number[];
  weeks: number[];
  onChange: (filter: DashboardFilter) => void;
};

export function FilterBar({ filter, years, months, weeks, onChange }: FilterBarProps) {
  const setPeriodType = (periodType: PeriodType) => {
    onChange({ ...filter, periodType });
  };

  const setBasis = (basis: MetricBasis) => {
    onChange({ ...filter, basis });
  };

  const toggleRegion = (region: Region) => {
    const selected = filter.selectedRegions.includes(region)
      ? filter.selectedRegions.filter((item) => item !== region)
      : [...filter.selectedRegions, region];
    onChange({ ...filter, selectedRegions: selected.length === 0 ? REGIONS : selected });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(["year", "month", "week"] as PeriodType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPeriodType(type)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  filter.periodType === type ? "bg-white text-vivo-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {type === "year" ? "年" : type === "month" ? "月" : "周"}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 text-vivo-600" />
            <select
              value={filter.year}
              onChange={(event) => onChange({ ...filter, year: Number(event.target.value) })}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-vivo-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          </label>

          {filter.periodType === "month" ? (
            <select
              value={filter.month}
              onChange={(event) => onChange({ ...filter, month: Number(event.target.value) })}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-vivo-500"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          ) : null}

          {filter.periodType === "week" ? (
            <select
              value={filter.week}
              onChange={(event) => onChange({ ...filter, week: Number(event.target.value) })}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-vivo-500"
            >
              {weeks.map((week) => (
                <option key={week} value={week}>
                  第{week}周
                </option>
              ))}
            </select>
          ) : null}

          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(["period", "cumulative"] as MetricBasis[]).map((basis) => (
              <button
                key={basis}
                type="button"
                onClick={() => setBasis(basis)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  filter.basis === basis ? "bg-white text-vivo-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {basis === "period" ? "本期" : "累计"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-600">区域多选</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...filter, selectedRegions: REGIONS })}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-vivo-700 hover:bg-vivo-50"
              >
                <Check className="h-3.5 w-3.5" />
                全选
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filter, selectedRegions: REGIONS })}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                重置
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => {
              const active = filter.selectedRegions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-vivo-500 bg-vivo-50 text-vivo-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
