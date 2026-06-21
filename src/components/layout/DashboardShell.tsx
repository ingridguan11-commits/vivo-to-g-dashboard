import type { ReactNode } from "react";
import { SCORE_MODE_LABEL, SCORE_MODE, TARGET_CONFIG_HINTS } from "../../config/dashboardConfig";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f8fc] text-ink-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-vivo-700">vivo To G</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink-950 md:text-3xl">
              旅拍项目区域运营数据看板
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              聚焦导游建设、总部活动执行、社群运营、传播口碑与租售转化，出团天数仅作为业务背景指标展示。
            </p>
          </div>
          <div className="rounded-lg border border-vivo-100 bg-vivo-50 px-4 py-3 text-sm text-vivo-800">
            <div className="font-semibold">{SCORE_MODE_LABEL[SCORE_MODE]}</div>
            <div className="mt-1 text-xs leading-5 text-vivo-700">
              已预留目标配置：{TARGET_CONFIG_HINTS.join("、")}。
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-5">{children}</main>
    </div>
  );
}
