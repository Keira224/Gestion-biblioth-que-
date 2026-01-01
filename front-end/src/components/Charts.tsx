import type { ReactNode } from "react";

type BarItem = {
  label: string;
  value: number;
  helper?: ReactNode;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const DonutChart = ({
  value,
  total,
  label,
  description,
  color = "#2563eb",
}: {
  value: number;
  total: number;
  label: string;
  description?: string;
  color?: string;
}) => {
  const safeTotal = total > 0 ? total : 0;
  const ratio = safeTotal ? clamp(value / safeTotal, 0, 1) : 0;
  const percent = Math.round(ratio * 100);
  const angle = ratio * 360;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `conic-gradient(${color} ${angle}deg, #e2e8f0 0deg)`,
          }}
        />
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
          {percent}%
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-1 text-xs text-slate-500">
          {value} / {safeTotal}
        </p>
        {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      </div>
    </div>
  );
};

export const BarList = ({
  items,
  color = "bg-blue-600",
  emptyLabel = "Aucune donnée disponible.",
}: {
  items: BarItem[];
  color?: string;
  emptyLabel?: string;
}) => {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (!items.length) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-xs text-slate-500">{item.value}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${clamp((item.value / max) * 100, 4, 100)}%` }}
            />
          </div>
          {item.helper && <div className="mt-2 text-xs text-slate-400">{item.helper}</div>}
        </div>
      ))}
    </div>
  );
};