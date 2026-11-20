import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Attach, BackArrow, Bookmark, CheckCircle, Info, Menu, Mic, More, RotateLeft, Search, Smile } from "../icons";
import { STEPS } from "../data";
import { prefersReducedMotion } from "../lib/motion";
import ScriptViewer, { CopyScriptButton } from "./ScriptViewer";
import Logo from "./Logo";
import Connect from "./Connect";

/*
 * The setup guide as a Telegram chat with a setup bot. The bot sends each step as a message;
 * tap "Done" to reply, the bot types, then sends the next step. Earlier steps stay in the chat,
 * so people can scroll up and down through everything. Progress is saved in this browser.
 */

const KEY = "setupUpto";
const loadUpto = () => {
  try { const v = Math.floor(Number(localStorage.getItem(KEY))); return v >= 0 && v <= STEPS.length ? v : 0; } catch { return 0; }
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

function StepMsg({ s, i, n }) {
  return (
    <div className="msg msg-bot msg-step" data-i={i}>
      <div className="msg-head">
        <span className="msg-ic" style={{ background: `linear-gradient(160deg,${s.colors[0]},${s.colors[1]})` }}>{s.icon}</span>
        <span>Step {i + 1} of {n} · {s.time} · {s.where}</span>
      </div>
      <h3>{s.title}</h3>
      <StepBody s={s} />
    </div>
  );
}

export default function Setup({ focus }) {
  const n = STEPS.length;
  const [upto, setUpto] = useState(loadUpto);   // steps 0..upto are in the chat; upto === n means finished
  const [typing, setTyping] = useState(false);
  const [, setTick] = useState(0);               // re-render once to run the scroll below
  const bodyRef = useRef(null);
  const scrollTo = useRef(null);                 // which message to bring into view after render

  useEffect(() => { if (upto % 1 === 0) try { localStorage.setItem(KEY, String(upto)); } catch { /* storage blocked */ } }, [upto]);

  // bring a message to the top of the chat (smooth unless reduced motion)
  useLayoutEffect(() => {
    const body = bodyRef.current, want = scrollTo.current;
    if (!body || want == null) return;
    const el = body.querySelector(want === "end" ? ".msg-end" : `[data-i="${want}"]`);
    if (!el) return;
    scrollTo.current = null;
    body.scrollTo({ top: Math.max(0, el.offsetTop - 12), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });

  // first open: show where they are
  useEffect(() => { scrollTo.current = upto >= n ? "end" : upto; setTick((t) => t + 1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Set it up" buttons elsewhere on the page ask to show a step
  useEffect(() => {
    if (!focus || !focus.n) return;
    if (focus.i < 0) scrollTo.current = upto >= n ? "end" : Math.floor(upto);
    else {
      if (focus.i > upto && upto < n) setUpto(focus.i);
      scrollTo.current = focus.i;
    }
    setTick((t) => t + 1);
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (typing || upto >= n) return;
    const to = upto + 1;
    setTyping(true);
    // the user's "Done" bubble shows right away; the bot "types" for a moment, then answers
    scrollTo.current = "end";
    setUpto((u) => u + 0.5);
    setTimeout(() => {
      setTyping(false);
      setUpto(to);
      scrollTo.current = to < n ? to : "end";
    }, prefersReducedMotion() ? 0 : 850);
  };
  const reset = () => { setTyping(false); setUpto(0); scrollTo.current = 0; };

  const shown = Math.floor(upto);               // last bot step message in the chat
  const replied = upto % 1 !== 0 ? shown : shown - 1; // user has said "Done" to steps 0..replied
  const finished = upto >= n;

  const status = typing ? "typing…" : finished ? "bot · all done" : `bot · step ${Math.min(shown, n - 1) + 1} of ${n}`;
  const preview = finished ? "You’re all set." : STEPS[Math.min(shown, n - 1)].title;

  return (
    <section className="setup" id="setup" aria-label="Set it up in 10 minutes">
      <div className="su">
        {/* a Telegram window: chat list on the left (desktop), the setup chat on the right */}
        <div className="tgw">
          <aside className="tgw-side" aria-hidden="true">
            <div className="tgw-sh"><Menu /><span className="tgw-search"><Search /> Search</span></div>
            <ul className="tgw-list">
              <li className="on">
                <Logo size={46} round />
                <span><b>Setup guide</b><small>{typing ? "typing…" : preview}</small></span>
                <time>now</time>
              </li>
              <li>
                <Logo size={46} round />
                <span><b>Mail bot</b><small>📧 Your sign-in code is 482913</small></span>
                <time>9:41</time><em>2</em>
              </li>
              <li>
                <span className="tgw-av sv"><Bookmark /></span>
                <span><b>Saved Messages</b><small>Code.gs</small></span>
                <time>Mon</time>
              </li>
              <li>
                <span className="tgw-av tg">T</span>
                <span><b>Telegram</b><small>Login code: 51234. Do not give…</small></span>
                <time>Sun</time>
              </li>
            </ul>
          </aside>

          <div className="chat">
            <header className="chat-h">
              <span className="chat-back" aria-hidden="true"><BackArrow /></span>
              <Logo size={40} round />
              <span className="chat-who">
                <b>Setup guide</b>
                <small className={typing ? "on" : ""}>{status}</small>
              </span>
              {upto > 0 && <button type="button" className="chat-reset" onClick={reset} title="Start over"><RotateLeft /><span>Start over</span></button>}
              <span className="chat-ico" aria-hidden="true"><Search /><More /></span>
            </header>

            <div className="chat-b" ref={bodyRef}>
              <span className="chat-day">Set it up in 10 minutes</span>
              <div className="msg msg-bot">
                Hi! I’ll walk you through the setup. <b>10 short steps</b>, about 10 minutes, no coding.
                Scroll up any time to see a step again.
              </div>
              {STEPS.map((st, i) => i <= Math.min(shown, n - 1) && (
                <Fragment key={st.name}>
                  <StepMsg s={st} i={i} n={n} />
                  {i <= replied && <div className="msg msg-me">Done ✓<span className="msg-t">✓✓</span></div>}
                </Fragment>
              ))}
              {typing && <div className="msg msg-bot msg-typing" aria-label="typing"><i /><i /><i /></div>}
              {finished && (
                <div className="msg msg-bot msg-fin">
                  <CheckCircle variant="Bold" />
                  <b>You’re all set.</b> New emails will now arrive here within a minute. Try replying to one with a swipe.
                </div>
              )}
              <span className="msg-end" />
            </div>

            <footer className="chat-f">
              {/* Telegram reply keyboard */}
              {finished ? (
                <button type="button" className="chat-btn" onClick={reset}>Start again</button>
              ) : (
                <button type="button" className="chat-btn" onClick={next} disabled={typing}>
                  {shown >= n - 1 ? "Done ✓ Finish" : "Done ✓ Next step"}
                </button>
              )}
              <div className="chat-in" aria-hidden="true">
                <Attach />
                <span>Write a message…</span>
                <Smile />
                <span className="chat-mic"><Mic /></span>
              </div>
            </footer>
          </div>
        </div>

        <Connect className="su-cx" />
      </div>
    </section>
  );
}
