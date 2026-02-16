type BarChartProps = {
  title: string;
  ariaLabel: string;
  data: { label: string; value: number; suffix?: string }[];
};

export const BarChart = ({ title, ariaLabel, data }: BarChartProps) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <div className="space-y-3" role="img" aria-label={ariaLabel}>
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span>{item.value}{item.suffix ?? ""}</span></div>
            <div className="h-4 rounded bg-slate-200">
              <div className="h-4 rounded bg-emerald-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
