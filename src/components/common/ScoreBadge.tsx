import { scoreTone } from "../../utils/format";

type ScoreBadgeProps = {
  score: number;
  title?: string;
};

export function ScoreBadge({ score, title }: ScoreBadgeProps) {
  const tone = scoreTone(score);
  const classes =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-rose-50 text-rose-700 ring-rose-100";

  return (
    <span
      title={title}
      className={`inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}
    >
      {score.toFixed(1)}
    </span>
  );
}
