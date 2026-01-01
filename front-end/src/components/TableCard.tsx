import type { ReactNode } from "react";

export const TableCard = ({
  title,
  action,
  helper,
  children,
}: {
  title: string;
  action?: ReactNode;
  helper?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      {helper && <div className="mb-4">{helper}</div>}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};
