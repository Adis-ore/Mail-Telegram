import { Fragment, useEffect, useState } from "react";
import { STEPS } from "../data";
import { CopyScriptButton } from "./ScriptViewer";

/** Copies `text` and briefly says so. */
function CopyButton({ label, text }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
    } catch {
      window.prompt("Copy this:", text);
    }
  };
  return <button type="button" className="pab" onClick={copy}>{done ? "Copied ✓" : label}</button>;
}

// Scalloped blue seal with a white tick.
function VerifiedBadge() {
  const bumps = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return [12 + Math.cos(a) * 7, 12 + Math.sin(a) * 7];
  });
  return (
    <svg viewBox="0 0 24 24" aria-label="Verified" role="img">
      <g fill="#3b9cff">
        <circle cx="12" cy="12" r="8" />
        {bumps.map(([x, y], i) => <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="3.6" />)}
      </g>
      <path d="m8.2 12.2 2.6 2.6 5-5.3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Detail panel for the active step. When `active` changes, the old content
 * fades out for 180ms, then the new step mounts (re-running the CSS `up` animation).
 * Opacity/position are set by StepDeck through `panelRef`.
 */
export default function StepPanel({ panelRef, active, onNext }) {
  const [shown, setShown] = useState(active);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (active === shown) {
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const t = setTimeout(() => {
      setShown(active);
      setLeaving(false);
    }, 180);
    return () => clearTimeout(t);
  }, [active, shown]);

  const s = STEPS[shown];
  const n = STEPS.length;
  const last = shown === n - 1;

  return (
    <div id="panel" ref={panelRef} aria-live="polite" style={{ "--c0": s.colors[0], "--c1": s.colors[1] }}>
      <span className="tag"><i>{s.icon}</i>{s.name}</span>
      <div id="pc" className={leaving ? "out" : undefined} data-lenis-prevent>
        <Fragment key={shown}>
          <div className="ph">
            <span className="pi">{s.icon}</span>
            <span className="pk">Mail to Telegram <VerifiedBadge /></span>
          </div>
          <h3>{s.title}</h3>
          <div className="pm">
            <div><small>Where</small>{s.where}</div>
            <div><small>Time</small>{s.time}</div>
            <div><small>Up next</small>{last ? "Questions" : STEPS[shown + 1].name}</div>
          </div>
          <ol>{s.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
          {s.code && <pre>{s.code}</pre>}
          {s.note && <div className="nt">{s.note}</div>}
          {s.actions && (
            <div className="pa">
              {s.actions.map((a) => a.href
                ? <a key={a.label} className="pab" href={a.href} target="_blank" rel="noopener noreferrer">{a.label}</a>
                : a.copyScript
                  ? <CopyScriptButton key={a.label} label={a.label} className="pab pab-main" />
                  : <CopyButton key={a.label} label={a.label} text={a.copy} />)}
            </div>
          )}
        </Fragment>
      </div>
      <div className="pf">
        <span className="pn">0{shown + 1} / 0{n}</span>
        <button id="pbt" type="button" onClick={() => onNext(shown)}>
          {last ? "Ask questions ↓" : "Next step →"}
        </button>
      </div>
    </div>
  );
}
