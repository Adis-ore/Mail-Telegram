import { SealCheck } from "@phosphor-icons/react";
import { Fragment, useEffect, useRef, useState } from "react";
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

// Blue verified seal next to the bot name
const VerifiedBadge = () => <SealCheck weight="fill" color="#3b9cff" aria-label="Verified" />;

/** Android / iPhone switch for steps that differ by phone. Starts on the visitor's own platform. */
function PlatformTabs({ tabs }) {
  const [i, setI] = useState(() => (typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 1 : 0));
  const tab = tabs[i] || tabs[0];
  return (
    <>
      <div className="ptabs" role="tablist">
        {tabs.map((t, j) => (
          <button key={t.label} type="button" role="tab" aria-selected={j === i} className={j === i ? "on" : ""} onClick={() => setI(j)}>{t.label}</button>
        ))}
      </div>
      <ol>{tab.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
    </>
  );
}

/**
 * Detail panel for the active step. When `active` changes, the old content
 * fades out for 180ms, then the new step mounts (re-running the CSS `up` animation).
 * Opacity/position are set by StepDeck through `panelRef`.
 */
export default function StepPanel({ panelRef, active, onNext }) {
  const [shown, setShown] = useState(active);
  const pcRef = useRef(null);
  // a new step always starts scrolled to the top
  useEffect(() => {
    const pc = pcRef.current;
    if (pc) { pc.scrollTop = 0; pc.removeAttribute("data-scrolled"); }
  }, [shown]);
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
      <div
        id="pc"
        ref={pcRef}
        className={leaving ? "out" : undefined}
        data-lenis-prevent
        onScroll={(e) => e.currentTarget.toggleAttribute("data-scrolled", e.currentTarget.scrollTop > 4)}
      >
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
          {s.tabs && <PlatformTabs tabs={s.tabs} />}
          {s.items && (
            <ol start={s.tabs ? 3 : 1}>{s.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
          )}
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
        <span className="pn">{String(shown + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
        <button id="pbt" type="button" onClick={() => onNext(shown)}>
          {last ? "Ask questions ↓" : "Next step →"}
        </button>
      </div>
    </div>
  );
}
