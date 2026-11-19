/** One coloured step card. Position is driven imperatively through `cardRef`. */
export default function Card({ step, index, onSelect, cardRef, sheenRef }) {
  const [c0, c1] = step.colors;
  return (
    <button
      ref={cardRef}
      type="button"
      className="card"
      aria-label={`Step ${index + 1}: ${step.title}`}
      style={{ background: `linear-gradient(160deg,${c0},${c1})` }}
      onClick={() => onSelect(index)}
    >
      <i className="sh" ref={sheenRef} />
      <span className="nm">{step.name}</span>
      <span className="ic"><span>{step.icon}</span></span>
      <span className="cp">{step.where}</span>
      <span className="no">{String(index + 1).padStart(2, "0")}</span>
    </button>
  );
}
