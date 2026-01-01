"use client";

import type { ReactNode } from "react";

export const Modal = ({
  open,
  onClose,
  title,
  header,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  header?: ReactNode;
  children: ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {header ?? <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Fermer
          </button>
        </div>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
};
