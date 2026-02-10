type LineChartProps = { data: { label: string; value: number }[] };

export const LineChart = ({ data }: LineChartProps) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-3 text-xl font-semibold">Partidas por día</h3>
      <svg viewBox="0 0 100 100" className="h-48 w-full rounded bg-slate-50" role="img" aria-label="Línea de partidas por día">
        <polyline fill="none" stroke="#0369a1" strokeWidth="2" points={points} />
      </svg>
    </div>
  );
};

export const BarChart = ({ data }: LineChartProps) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-3 text-xl font-semibold">Acierto por juego</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span>{item.value}%</span></div>
            <div className="h-4 rounded bg-slate-200">
              <div className="h-4 rounded bg-emerald-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
