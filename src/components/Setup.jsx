import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, InfoCircle, RotateLeft, TickCircle } from "../icons";
import { LINKEDIN_URL, STEPS, X_URL } from "../data";
import { scrollToY } from "../lib/smoothScroll";
import ScriptViewer, { CopyScriptButton } from "./ScriptViewer";

/*
 * The setup guide: every step listed on the left (with progress), one step open on the right.
 * Next marks the step done and opens the next one. Progress is remembered in this browser.
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
      {s.note && <p className="su-note"><InfoCircle aria-hidden="true" /><span>{s.note}</span></p>}
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
  const panelRef = useRef(null);
  const railRef = useRef(null);
  const n = STEPS.length;
  const s = STEPS[step];

  useEffect(() => {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(done)); } catch { /* storage blocked */ }
  }, [done]);

  // keep the active step visible in the phone's sideways list
  useEffect(() => {
    const rail = railRef.current, el = rail?.querySelector(".on");
    if (rail && el && rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
    }
  }, [step]);

  // after Back/Next, bring the top of the step into view if it scrolled away
  const reveal = () => requestAnimationFrame(() => {
    const top = panelRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 70 || top > window.innerHeight * 0.6) scrollToY(window.scrollY + top - 84);
  });

  const go = (i) => { setFinished(false); onStep(i); reveal(); };
  const next = () => {
    setDone((d) => (d.includes(step) ? d : [...d, step]));
    if (step < n - 1) go(step + 1);
    else { setFinished(true); reveal(); }
  };
  const reset = () => { setDone([]); go(0); };

  return (
    <section className="sec setup" id="setup">
      <div className="sec-h">
        <span className="eyebrow">Setup</span>
        <h2>Set it up in <em>10 minutes.</em></h2>
        <p>Ten short steps. Copy, paste, done. No coding needed, and your progress is saved on this device.</p>
      </div>

      <div className="su">
        <nav className="su-side" aria-label="Setup steps">
          <div className="su-prog">
            <span><b>{done.length}</b> of {n} done</span>
            {done.length > 0 && (
              <button type="button" className="su-reset" onClick={reset}><RotateLeft /> Start over</button>
            )}
            <i style={{ "--w": `${(done.length / n) * 100}%` }} />
          </div>
          <ol className="su-list" ref={railRef}>
            {STEPS.map((st, i) => {
              const ok = done.includes(i);
              return (
                <li key={st.name}>
                  <button
                    type="button"
                    className={`${i === step && !finished ? "on" : ""}${ok ? " ok" : ""}`}
                    aria-current={i === step && !finished ? "step" : undefined}
                    onClick={() => go(i)}
                  >
                    <span className="su-n">{ok ? <TickCircle variant="Bold" /> : i + 1}</span>
                    <span className="su-l">
                      <b>{st.title}</b>
                      <small>{st.where} · {st.time}</small>
                    </span>
                    <span className="su-s">{st.name}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <article className="su-panel" ref={panelRef} aria-live="polite">
          {finished ? (
            <div className="su-fin" key="fin">
              <TickCircle variant="Bold" />
              <h3>You’re all set.</h3>
              <p>New emails will now arrive in your Telegram within a minute. Try replying to one with a swipe.</p>
              <div className="su-acts">
                <a className="btn sm" href="#faq">Read the FAQ</a>
                <button type="button" className="btn ghost sm" onClick={() => go(0)}>Back to step 1</button>
              </div>
            </div>
          ) : (
            <div className="su-step" key={step}>
              <header className="su-hd">
                <span className="su-ic" style={{ background: `linear-gradient(160deg,${s.colors[0]},${s.colors[1]})` }}>{s.icon}</span>
                <span className="su-k">Step {step + 1} of {n} <em>·</em> {s.time} <em>·</em> {s.where}</span>
              </header>
              <h3>{s.title}</h3>
              <StepBody s={s} />
              <footer className="su-ft">
                <button type="button" className="btn ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                  <ArrowLeft /> Back
                </button>
                <button type="button" className="btn" onClick={next}>
                  {step < n - 1 ? <>Done, next step <ArrowRight /></> : <>Finish <TickCircle /></>}
                </button>
              </footer>
            </div>
          )}
        </article>
      </div>

      <p className="su-help">
        Stuck on a step? Message me on <a href={X_URL} target="_blank" rel="noopener noreferrer">X</a> or{" "}
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a> and I’ll help you get it running.
      </p>
    </section>
  );
}
