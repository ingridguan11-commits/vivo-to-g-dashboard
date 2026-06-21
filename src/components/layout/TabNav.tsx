import { BarChart3, FileDown, GitCompareArrows, UsersRound } from "lucide-react";

export type DashboardTab = "overview" | "compare" | "guides" | "report";

const tabs = [
  { id: "overview" as const, label: "项目总览", icon: BarChart3 },
  { id: "compare" as const, label: "区域对比", icon: GitCompareArrows },
  { id: "guides" as const, label: "导游分层与社群运营", icon: UsersRound },
  { id: "report" as const, label: "报表导出", icon: FileDown }
];

type TabNavProps = {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
};

export function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              active
                ? "border-vivo-600 text-vivo-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
