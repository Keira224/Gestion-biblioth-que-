export function ActivityCard({
  title,
  subtitle,
  time,
}: {
  title: string;
  subtitle?: string;
  time?: string;
}) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {time ? <span className="text-xs text-slate-400">{time}</span> : null}
    </div>
  );
}
