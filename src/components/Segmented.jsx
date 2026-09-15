// A reusable iOS-style segmented control with an animated sliding pill.
// options: [{ id, label }]
export default function Segmented({ options, value, onChange }) {
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  const n = options.length;
  const pct = 100 / n;
  const offsetPx = 4 / n;
  return (
    <div className="segmented">
      <div
        className="pill"
        style={{
          width: `calc(${pct}% - ${offsetPx}px)`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button key={o.id} className={o.id === value ? 'active' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
