type BarItem = {
  label: string;
  value: number;
  meta?: string;
};

export const BarList = ({
  title,
  items,
  emptyLabel,
  valueSuffix,
}: {
  title: string;
  items: BarItem[];
  emptyLabel: string;
  valueSuffix?: string;
}) => {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {items.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">{emptyLabel}</div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const percent = Math.round((item.value / maxValue) * 100);
            return (
              <div key={`${item.label}-${idx}`} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">
                    {item.value}
                    {valueSuffix || ""}
                  </span>
                </div>
                {item.meta && <div className="text-xs text-slate-400">{item.meta}</div>}
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
