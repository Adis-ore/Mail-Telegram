import { useLayoutEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";
import { useReveal } from "../lib/useReveal";
import Logo from "./Logo";
import Connect from "./Connect";

const QA = [
  ["Is it really free?",
    "Yes. Google Apps Script and Telegram bots are free, and there’s nothing to host or subscribe to."],
  ["Can anyone else read my emails?",
    "No. The script runs inside your own Google account and only sends to your own bot. There’s no server in the middle. Just keep your bot token private."],
  ["Does my phone or laptop need to stay on?",
    "No. Google runs the script every minute in the cloud, whether your devices are on or off."],
  ["How fast do emails arrive?",
    "Within about a minute. Replies and commands can be instant if you do the optional last setup card."],
  ["Does it work on iPhone and Android?",
    "Yes, and on Telegram for desktop and the web too. Anywhere Telegram runs."],
  ["I don’t code. Can I still set it up?",
    "Yes. It’s copy and paste: 10 short cards, about 10 minutes. Each card has buttons for the links and text you need."],
  ["Can I turn off the phone calls?",
    <>Yes. Set <code>CALL_ENABLED</code> to <code>false</code> at the top of the script. You’ll still get reminder messages.</>],
  ["How do I stop it?",
    <>In your Apps Script project, open <b>Triggers</b> (the clock icon) and delete the trigger. Nothing runs after that.</>],
  ["How do I update it?",
    "The bot messages you when there’s a new version. Copy the new script and paste it over the old one. Your settings are kept if you ran saveSettings once."],
];

// "now", "2m ago"… like a real notification list, newest first
const AGO = ["now", "now", "2m ago", "5m ago", "9m ago", "14m ago", "21m ago", "32m ago", "1h ago"];

/**
 * The FAQ as a stack of Telegram notifications. Tap the stack and it opens into a list
 * (each card glides from the pile to its place); tap one to read the full answer,
 * tap it again or another one to switch. "Show less" stacks them back up.
 */
export default function Faq() {
  const ref = useReveal(0.2);
  const listRef = useRef(null);
  const before = useRef(null);
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState(-1);

  const items = () => [...(listRef.current?.children || [])];
  const toggleAll = (v) => {
    before.current = items().map((el) => el.getBoundingClientRect());
    setAll(v);
    if (!v) setOpen(-1);
  };

  // glide each card from where it was to where it is now
  useLayoutEffect(() => {
    const prev = before.current;
    if (!prev || prefersReducedMotion()) { before.current = null; return; }
    before.current = null;
    items().forEach((el, i) => {
      const r = el.getBoundingClientRect(), p = prev[i];
      if (!p) return;
      const dx = p.left - r.left, dy = p.top - r.top;
      if (!dx && !dy) return;
      const end = getComputedStyle(el).transform;
      const to = end === "none" ? "" : end;
      el.animate([{ transform: `translate(${dx}px,${dy}px) ${to}` }, { transform: to || "none" }],
        { duration: 560, delay: (all ? i : 0) * 35, easing: "cubic-bezier(.2,.9,.25,1.05)", fill: "backwards" });
    });
  }, [all]);

  const tap = (i) => {
    if (!all) toggleAll(true);
    else setOpen((o) => (o === i ? -1 : i));
  };

  return (
    <section className="sec faq" id="faq">
      <div className="sec-h">
        <h2>Good <em>questions.</em></h2>
        <p>Tap the notifications to read them.</p>
      </div>

      <div className="nq-wrap" ref={ref}>
      <div className={`nq${all ? " all" : ""}`}>
        <div className="nq-bar">
          <b>Mail to Telegram</b>
          {all
            ? <button type="button" onClick={() => toggleAll(false)}>Show less</button>
            : <span>{QA.length} notifications</span>}
        </div>
        <ul className="nq-list" ref={listRef}>
          {QA.map(([q, a], i) => (
            <li key={q} style={{ "--i": i }} className={open === i ? "open" : ""}>
              <button
                type="button"
                className="nf"
                tabIndex={!all && i > 0 ? -1 : 0}
                aria-expanded={all ? open === i : false}
                aria-label={!all && i === 0 ? `${QA.length} questions. Tap to see all.` : undefined}
                onClick={() => tap(i)}
              >
                <span className="nf-av"><Logo size={42} round /></span>
                <span className="nf-tx">
                  <span className="nf-app"><b>Mail to Telegram</b><time>{AGO[i] || "1h ago"}</time></span>
                  <b className="nf-q">{q}</b>
                  <span className="nf-msg">{a}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      </div>
      <Connect className="faq-cx" />
    </section>
  );
}
