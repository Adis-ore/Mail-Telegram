import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowBendUpLeft, CheckCircle, EnvelopeSimple, PaperPlaneRight, Phone, PhoneDisconnect } from "@phosphor-icons/react";
import { prefersReducedMotion } from "../lib/motion";

/*
 * The hero's product demo: a Gmail inbox on the left, your Telegram chat on the right.
 * A scripted loop shows the four things people need to "get" in a few seconds:
 * an email arrives in Telegram, you copy a code, you swipe to reply, a reminder rings.
 * Every step is a pure state change, so the captions can jump to any point (seek).
 */

const BASE_INBOX = [
  { id: "b1", from: "Daily Brief", subj: "Your morning summary", time: "8:02" },
  { id: "b2", from: "Kemi", subj: "Photos from Saturday", time: "Thu" },
  { id: "b3", from: "Store", subj: "Your order has shipped", time: "Wed" },
];

const REPLY = "3pm works. See you then!";

// The story told next to the demo; t = when each part starts (ms).
export const SCENES = [
  { t: 0, title: "An email lands in your Gmail", text: "It shows up in your Telegram chat within a minute, the whole message." },
  { t: 3300, title: "Tap a code to copy it", text: "Sign-in codes are picked out for you. No more digging through your inbox." },
  { t: 5200, title: "Swipe to reply", text: "Type your answer in Telegram. It goes out as a normal email from your Gmail." },
  { t: 12900, title: "Reminders ring your phone", text: "Interviews and meetings in your emails get a reminder and a call before they start." },
];
export const TOTAL = 18200;

const START = () => ({
  inbox: BASE_INBOX, hot: null, fly: null, chat: [], tap: false, copied: false,
  swipe: false, quote: false, typed: 0, clock: "9:41", jump: false, ring: false, buzz: 0, out: false,
});

const add = (s, msg) => ({ ...s, chat: [...s.chat, msg], buzz: s.buzz + 1 });

// [time in ms, state change]
const EVENTS = [
  [600, (s) => ({ ...s, hot: "bank", inbox: [{ id: "bank", from: "Acme Bank", subj: "Your sign-in code is 482913", time: "9:41", unread: true }, ...s.inbox] })],
  [1300, (s) => ({ ...s, fly: { dir: "in", n: 1 } })],
  [2300, (s) => add({ ...s, fly: null }, { id: "otp", kind: "mail", subj: "Your sign-in code", from: "Acme Bank", time: "Fri, 9:41 AM", otp: "482913", body: "Use this code to sign in. It expires in 10 minutes.", at: "9:41" })],
  [3500, (s) => ({ ...s, tap: true })],
  [3800, (s) => ({ ...s, copied: true })],
  [4900, (s) => ({ ...s, tap: false, copied: false })],
  [5300, (s) => ({ ...s, hot: "tolu", inbox: [{ id: "tolu", from: "Tolu, Northwind", subj: "Interview tomorrow at 3pm?", time: "9:43", unread: true }, ...s.inbox] })],
  [6000, (s) => ({ ...s, fly: { dir: "in", n: 2 } })],
  [7000, (s) => add({ ...s, fly: null }, { id: "int", kind: "mail", subj: "Interview tomorrow", from: "Tolu, Northwind", time: "Fri, 9:43 AM", body: "Hi! Can you do tomorrow at 3pm? I’ll send the link.", at: "9:43" })],
  [7700, (s) => add(s, { id: "det", kind: "bot", at: "9:43", text: <>⏰ Time-bound email detected. Reminders set for <b>Sat, 3:00 PM</b></> })],
  [8500, (s) => ({ ...s, swipe: true })],
  [9100, (s) => ({ ...s, swipe: false, quote: true })],
  ...Array.from({ length: REPLY.length }, (_, i) => [9300 + i * 50, (s) => ({ ...s, typed: i + 1 })]),
  [10900, (s) => add({ ...s, quote: false, typed: 0, fly: { dir: "out", n: 3 } }, { id: "me", kind: "me", at: "9:44", text: REPLY, quote: "Interview tomorrow" })],
  [11900, (s) => add({ ...s, fly: null, hot: "sent", inbox: [{ id: "sent", from: "Me → Tolu", subj: "Re: Interview tomorrow", time: "9:44", sent: true }, ...s.inbox] }, { id: "ok", kind: "bot", at: "9:44", text: <>✅ Reply sent to <b>tolu@northwind.co</b></> })],
  [12900, (s) => ({ ...s, jump: true, hot: null })],
  [13700, (s) => ({ ...s, clock: "2:50" })],
  [14200, (s) => add({ ...s, jump: false, ring: true }, { id: "rem", kind: "bot", at: "2:50", text: <>⏰ <b>Reminder:</b> Interview tomorrow<br />Starts in 10 min, <b>Sat, 3:00 PM</b></> })],
  [17200, (s) => ({ ...s, ring: false })],
  [17700, (s) => ({ ...s, out: true })],
];

const stateAt = (t) => EVENTS.reduce((s, [at, fn]) => (at <= t ? fn(s) : s), START());

export function useTimeline(rootRef) {
  const [state, setState] = useState(START);
  const [scene, setScene] = useState(0);
  const timers = useRef([]);
  const runRef = useRef(() => {});

  useEffect(() => {
    const still = prefersReducedMotion();
    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const sceneAt = (t) => SCENES.reduce((k, sc, i) => (sc.t <= t ? i : k), 0);
    const run = (from) => {
      clear();
      setState(stateAt(from));
      setScene(sceneAt(from));
      if (still) return;
      EVENTS.forEach(([at, fn]) => { if (at > from) timers.current.push(setTimeout(() => setState((s) => fn(s)), at - from)); });
      SCENES.forEach((sc, i) => { if (sc.t > from) timers.current.push(setTimeout(() => setScene(i), sc.t - from)); });
      timers.current.push(setTimeout(() => run(0), TOTAL - from));
    };
    runRef.current = run;
    // Reduced motion: one finished frame (code copied, reply sent) instead of a loop.
    if (still) { setState({ ...stateAt(12000), fly: null }); setScene(2); return clear; }

    let on = false;
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !on) { on = true; run(0); }
        else if (!e.isIntersecting && on) { on = false; clear(); }
      }, { threshold: 0.15 })
      : null;
    if (io) io.observe(rootRef.current); else run(0);
    return () => { clear(); io?.disconnect(); };
  }, [rootRef]);

  const seek = (i) => runRef.current(SCENES[i].t + (i ? 150 : 0));
  return { state, scene, seek };
}

/** Keeps the fixed-size stage scaled to the space it has. */
function useFit(wrapRef, stageW, stageH) {
  const [s, setS] = useState(1);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    const fit = () => setS(Math.min(1, el.clientWidth / stageW));
    fit();
    const ro = "ResizeObserver" in window ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [wrapRef, stageW]);
  return s;
}

function useNarrow(q = "(max-width: 620px)") {
  const [n, setN] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setN(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [q]);
  return n;
}

function Bubble({ m, state }) {
  if (m.kind === "me") {
    return (
      <div className="dm me">
        <span className="dm-q"><b>Tolu, Northwind</b>{m.quote}</span>
        {m.text}<span className="dm-t">{m.at} ✓✓</span>
      </div>
    );
  }
  if (m.kind === "bot") return <div className="dm">{m.text}<span className="dm-t">{m.at}</span></div>;
  const swiped = m.id === "int" && state.swipe;
  return (
    <div className={`dm mail${swiped ? " sw" : ""}`}>
      <span className="dm-rp" aria-hidden="true"><ArrowBendUpLeft weight="bold" /></span>
      📧 <b>{m.subj}</b><br />
      👤 {m.from}<br />
      🕒 <b>{m.time}</b>
      {m.otp && (
        <>
          <br />🔑 OTP:{" "}
          <span className={`dm-otp${state.tap ? " tap" : ""}`}>{m.otp}<i aria-hidden="true" /></span>
        </>
      )}
      <span className="dm-body">{m.body}</span>
      <span className="dm-t">{m.at}</span>
    </div>
  );
}

export default function HeroDemo({ state }) {
  const wrapRef = useRef(null);
  const phoneRef = useRef(null);
  const narrow = useNarrow();
  const W = narrow ? 340 : 640, H = narrow ? 612 : 570;
  const scale = useFit(wrapRef, W, H);
  // a short buzz each time a message lands
  useEffect(() => {
    if (!state.buzz || prefersReducedMotion() || !phoneRef.current?.animate) return;
    phoneRef.current.animate(
      [{ transform: "none" }, { transform: "translateX(-3px) rotate(-.6deg)" }, { transform: "translateX(3px) rotate(.6deg)" }, { transform: "none" }],
      { duration: 260, easing: "ease-in-out" },
    );
  }, [state.buzz]);
  const inboxRows = narrow ? state.inbox.slice(0, 2) : state.inbox.slice(0, 6);

  return (
    <div className="demo">
      <div className="demo-fit" ref={wrapRef} style={{ height: H * scale }}>
        <div
          className={`demo-stage${narrow ? " n" : ""}${state.out ? " out" : ""}`}
          style={{ width: W, height: H, transform: `translateX(-50%) scale(${scale})` }}
          aria-hidden="true"
        >
          {/* Gmail */}
          <div className="gm">
            <div className="gm-bar">
              <span className="gm-logo"><EnvelopeSimple weight="fill" /></span>
              <b>Gmail</b>
              <span className="gm-search">Search mail</span>
            </div>
            <div className="gm-tab">Inbox</div>
            <ul className="gm-list">
              {inboxRows.map((r) => (
                <li key={r.id} className={`${r.unread ? "u" : ""}${r.sent ? " s" : ""}${state.hot === r.id ? " hot" : ""}`}>
                  <span className="gm-f">{r.from}</span>
                  <span className="gm-s">{r.sent && <em>Sent</em>}{r.subj}</span>
                  <span className="gm-t">{r.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Telegram */}
          <div className={`tph${state.ring ? " ring" : ""}`} ref={phoneRef}>
            <div className="ph-in">
              <div className="ph-st"><b>{state.clock}</b><span>●●● ◔</span></div>
              <div className="ph-hd">
                <img src="/favicon.svg" alt="" width="34" height="34" />
                <span><b>Mail bot</b><small>bot</small></span>
              </div>
              <div className="ph-chat">
                <div className="ph-msgs">
                  {state.chat.map((m) => <Bubble key={m.id} m={m} state={state} />)}
                </div>
                {state.copied && <div className="ph-toast"><CheckCircle weight="fill" /> Code copied</div>}
              </div>
              <div className={`ph-in-bar${state.quote ? " q" : ""}`}>
                {state.quote && <span className="ph-q"><ArrowBendUpLeft weight="bold" /><span><b>Reply to Tolu, Northwind</b>Interview tomorrow</span></span>}
                <span className="ph-field">
                  <span className={state.typed ? "" : "ph-ph"}>{state.typed ? REPLY.slice(0, state.typed) : "Message"}</span>
                  {state.quote && <i className="caret" />}
                </span>
                <span className="ph-send"><PaperPlaneRight weight="fill" /></span>
              </div>
              {state.ring && (
                <div className="call">
                  <span className="call-av"><Phone weight="fill" /></span>
                  <b>Incoming call</b>
                  <small>“Reminder. Interview tomorrow. Starts in 10 minutes.”</small>
                  <span className="call-b"><i className="cb-no"><PhoneDisconnect weight="fill" /></i><i className="cb-yes"><Phone weight="fill" /></i></span>
                </div>
              )}
            </div>
          </div>

          {state.jump && <div className="jump">Next day · 2:50 PM</div>}

          {state.fly && (
            <span key={state.fly.n} className={`fly ${state.fly.dir}`}><EnvelopeSimple weight="fill" /></span>
          )}

          <span className="lbl l1">Your Gmail</span>
          <span className="lbl l2">Your Telegram</span>
        </div>
      </div>

    </div>
  );
}
