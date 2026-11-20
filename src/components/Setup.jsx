import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Info, RotateLeft, Tick } from "../icons";
import { LINKEDIN_URL, STEPS, X_URL } from "../data";
import ScriptViewer, { CopyScriptButton } from "./ScriptViewer";

/*
 * The setup guide as one screen: title, ten tappable progress segments, one step card
 * (long steps scroll inside it) and Back / Next. Next marks the step done. Progress is
 * remembered in this browser.
 */

const DONE_KEY = "setupDone";
const load = () => {
  try { const v = JSON.parse(localStorage.getItem(DONE_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
};

/** Copies `text` and briefly says so. */
function CopyButton({ label, text, className = "btn ghost sm" }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); } catch { window.prompt("Copy this:", text); }
  };
  return <button type="button" className={className} onClick={copy}>{done ? "Copied ✓" : label}</button>;
}

/** Android / iPhone switch for steps that differ by phone. Starts on the visitor's own platform. */
function PlatformTabs({ tabs }) {
  const [i, setI] = useState(() => (typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 1 : 0));
  const tab = tabs[i] || tabs[0];
  return (
    <>
      <div className="su-tabs" role="tablist" aria-label="Your phone">
        {tabs.map((t, j) => (
          <button key={t.label} type="button" role="tab" aria-selected={j === i} className={j === i ? "on" : ""} onClick={() => setI(j)}>{t.label}</button>
        ))}
      </div>
      <ol className="su-ol">{tab.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
    </>
  );
}

function StepBody({ s }) {
  return (
    <>
      {s.tabs && <PlatformTabs tabs={s.tabs} />}
      {s.items && (
        <ol className="su-ol" style={s.tabs ? { counterReset: `s ${s.tabs[0].items.length}` } : undefined}>
          {s.items.map((item, j) => <li key={j}>{item}</li>)}
        </ol>
      )}
      {s.code && (
        <div className="su-code">
          <code>{s.code}</code>
        </div>
      )}
      {s.note && <p className="su-note"><Info aria-hidden="true" /><span>{s.note}</span></p>}
      {s.actions && (
        <div className="su-acts">
          {s.actions.map((a) => a.href
            ? <a key={a.label} className="btn ghost sm" href={a.href} target="_blank" rel="noopener noreferrer">{a.label}</a>
            : a.copyScript
              ? <CopyScriptButton key={a.label} label={a.label} className="btn sm" />
              : <CopyButton key={a.label} label={a.label} text={a.copy} />)}
        </div>
      )}
      {s.showScript && <ScriptViewer />}
    </>
  );
}

export default function Setup({ step, onStep }) {
  const [done, setDone] = useState(load);
  const [finished, setFinished] = useState(false);
  const bodyRef = useRef(null);
  const n = STEPS.length;
  const s = STEPS[step];

  useEffect(() => {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(done)); } catch { /* storage blocked */ }
  }, [done]);

  // a new step starts at the top of the card
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [step, finished]);

  const go = (i) => { setFinished(false); onStep(i); };
  const next = () => {
    setDone((d) => (d.includes(step) ? d : [...d, step]));
    if (step < n - 1) go(step + 1);
    else setFinished(true);
  };
  const reset = () => { setDone([]); go(0); };

  return (
    <section className="setup" id="setup" aria-label="Set it up">
      <div className="su">
        <header className="su-top">
          <h2>Set it up in <em>10 minutes.</em></h2>
          <div className="su-meta">
            <span>{finished ? "All done" : <>Step <b>{step + 1}</b> of {n}</>} · {done.length} done</span>
            {done.length > 0 && (
              <button type="button" className="su-reset" onClick={reset}><RotateLeft /> Start over</button>
            )}
          </div>
          {/* ten segments: tap one to jump to that step */}
          <ol className="su-seg" aria-label="Setup steps">
            {STEPS.map((st, i) => {
              const ok = done.includes(i), on = i === step && !finished;
              return (
                <li key={st.name}>
                  <button
                    type="button"
                    className={`${on ? "on" : ""}${ok ? " ok" : ""}`}
                    aria-current={on ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${st.title}${ok ? " (done)" : ""}`}
                    onClick={() => go(i)}
                  >
                    <i />
                    <span>{st.name}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </header>

        <article className="su-card" style={{ "--c0": s.colors[0], "--c1": s.colors[1] }} aria-live="polite">
          {finished ? (
            <div className="su-fin" key="fin">
              <CheckCircle variant="Bold" />
              <h3>You’re all set.</h3>
              <p>New emails will now arrive in your Telegram within a minute. Try replying to one with a swipe.</p>
              <div className="su-acts">
                <a className="btn sm" href="#faq">Read the FAQ</a>
                <button type="button" className="btn ghost sm" onClick={() => go(0)}>Back to step 1</button>
              </div>
            </div>
          ) : (
            <>
              <div className="su-band" key={`b${step}`}>
                <span className="su-ic">{s.icon}</span>
                <div>
                  <span className="su-k">Step {step + 1} · {s.time} · {s.where}</span>
                  <h3>{s.title}</h3>
                </div>
                <span className="su-big" aria-hidden="true">{String(step + 1).padStart(2, "0")}</span>
              </div>
              {/* long steps scroll here, inside the card */}
              <div className="su-body" ref={bodyRef} data-lenis-prevent key={step}>
                <StepBody s={s} />
              </div>
            </>
          )}
          <footer className="su-ft">
            <button type="button" className="btn ghost su-back" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0 && !finished} aria-label="Previous step">
              <ArrowLeft />
            </button>
            {finished ? (
              <button type="button" className="btn" onClick={reset}>Start again</button>
            ) : (
              <button type="button" className="btn su-next" onClick={next}>
                {step < n - 1 ? <>Done, next step <ArrowRight /></> : <>Finish <Tick /></>}
              </button>
            )}
          </footer>
        </article>

        <p className="su-help">
          Stuck? Message me on <a href={X_URL} target="_blank" rel="noopener noreferrer">X</a> or{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
        </p>
      </div>
    </section>
  );
}
