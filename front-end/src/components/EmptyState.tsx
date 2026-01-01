"use client";

import { BookOpen } from "lucide-react";

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <BookOpen className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
};
