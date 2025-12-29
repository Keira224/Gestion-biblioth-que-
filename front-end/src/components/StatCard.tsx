import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "amber" | "rose";
}) {
  const toneMap: Record<string, string> = {
    blue: "from-brand-500 to-brand-700",
    emerald: "from-emerald-500 to-emerald-700",
    amber: "from-amber-500 to-amber-700",
    rose: "from-rose-500 to-rose-700",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-card">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneMap[tone]}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
