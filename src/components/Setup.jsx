import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Info } from "../icons";
import { LINKEDIN_URL, STEPS, X_URL } from "../data";
import { prefersReducedMotion } from "../lib/motion";
import ScriptViewer, { CopyScriptButton } from "./ScriptViewer";

/*
 * The setup guide as a book: one step per page. Swipe left for the next page, right for the
 * previous one (or the small arrows / arrow keys); each turn plays a page-flip.
 * The last page after step 10 says "You're all set".
 */

const TURN_MS = 850;

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

/** One page of the book. */
function Page({ i }) {
  const n = STEPS.length;
  if (i >= n) {
    return (
      <div className="pg-in pg-fin">
        <CheckCircle variant="Bold" />
        <h3>You’re all set.</h3>
        <p>New emails will now arrive in your Telegram within a minute. Try replying to one with a swipe.</p>
        <div className="su-acts"><a className="btn sm" href="#faq">Read the FAQ</a></div>
      </div>
    );
  }
  const s = STEPS[i];
  return (
    <div className="pg-in" data-lenis-prevent>
      <div className="pg-head">
        <span className="pg-ic" style={{ background: `linear-gradient(160deg,${s.colors[0]},${s.colors[1]})` }}>{s.icon}</span>
        <span className="pg-k">{s.where} · {s.time}</span>
      </div>
      <h3>{s.title}</h3>
      <StepBody s={s} />
    </div>
  );
}

export default function Setup({ step, onStep }) {
  const n = STEPS.length;
  const [page, setPage] = useState(step);          // 0..n (n = the "all set" page)
  const [turn, setTurn] = useState(null);           // { from, dir, id } while a page is turning
  const secRef = useRef(null);
  const start = useRef(null);

  // the nav / hero "Set it up" buttons open a step from outside
  useEffect(() => { setPage((p) => (p === n && step === n - 1 ? p : step)); }, [step, n]);

  const goTo = (to) => {
    if (turn || to < 0 || to > n || to === page) return;
    const dir = to > page ? "next" : "prev";
    if (!prefersReducedMotion()) {
      const id = Date.now();
      setTurn({ from: page, dir, id });
      setTimeout(() => setTurn((t) => (t && t.id === id ? null : t)), TURN_MS);
    }
    setPage(to);
    if (to < n) onStep(to);
  };
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);

  // swipe: left = next page, right = previous page (vertical moves still scroll the page text)
  const onDown = (e) => { start.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    const s0 = start.current; start.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? next : prev)();
  };

  // arrow keys while the book is on screen
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = secRef.current?.getBoundingClientRect();
      if (!r || r.top > window.innerHeight / 2 || r.bottom < window.innerHeight / 2) return;
      if (/input|textarea/i.test(e.target.tagName)) return;
      e.key === "ArrowRight" ? next() : prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // while turning forward the old page flips away over the new one; going back, the previous page flips in over the current one
  const base = turn && turn.dir === "prev" ? turn.from : page;
  const flip = turn ? (turn.dir === "next" ? turn.from : page) : null;

  return (
    <section className="setup" id="setup" ref={secRef} aria-label="Set it up">
      <div className="su">
        <h2 className="su-title">Set it up in <em>10 minutes.</em></h2>

        <div
          className="bk"
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={() => { start.current = null; }}
          aria-live="polite"
        >
          <span className="bk-stack" aria-hidden="true" />
          <article className="bk-page" key={`p${base}`}>
            <Page i={base} />
            <span className="pg-no" aria-hidden="true">{base < n ? base + 1 : "✓"}</span>
          </article>
          {turn && (
            <article className={`bk-flip ${turn.dir}`} key={`f${turn.id}`} aria-hidden="true">
              <div className="bk-face">
                <Page i={flip} />
                <span className="pg-no">{flip < n ? flip + 1 : "✓"}</span>
                <i className="bk-shade" />
              </div>
              <div className="bk-back" />
            </article>
          )}
        </div>

        <div className="bk-nav">
          <button type="button" onClick={prev} disabled={page === 0} aria-label="Previous page"><ArrowLeft /></button>
          <span>Swipe to turn the page</span>
          <button type="button" onClick={next} disabled={page === n} aria-label="Next page"><ArrowRight /></button>
        </div>
        <p className="su-help">
          Stuck? Message me on <a href={X_URL} target="_blank" rel="noopener noreferrer">X</a> or{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
        </p>
      </div>
    </section>
  );
}
