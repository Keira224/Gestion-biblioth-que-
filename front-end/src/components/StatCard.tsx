import type { ReactNode } from "react";

export const StatCard = ({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {icon && <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>}
      </div>
    </div>
  );
};
