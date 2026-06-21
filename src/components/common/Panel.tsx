import type { ReactNode } from "react";
import { Info } from "lucide-react";

type PanelProps = {
  title: string;
  subtitle?: string;
  info?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, info, children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-ink-950">{title}</h2>
            {info ? (
              <span title={info}>
                <Info className="h-4 w-4 text-slate-400" />
              </span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
