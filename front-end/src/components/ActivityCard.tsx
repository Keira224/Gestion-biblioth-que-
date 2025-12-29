import type { ReactNode } from "react";

export const ActivityCard = ({
  title,
  items,
  fallback,
}: {
  title: string;
  items: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <div className="mt-4 space-y-3">
        {items}
        {fallback}
      </div>
    </div>
  );
};
