import { useEffect, useState } from "react";
import { Camera, Flashlight, Lock } from "../icons";
import { LINKEDIN_URL, X_URL } from "../data";
import { useReveal } from "../lib/useReveal";
import Logo from "./Logo";

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

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/**
 * The FAQ as an iPhone lock screen: each question is a notification from Mail to Telegram.
 * They arrive as a stack and spread out when the section scrolls into view.
 * Tap one to read the full answer; tap it again (or another one) to close it.
 */
export default function Faq() {
  const ref = useReveal(0.2);
  const [open, setOpen] = useState(-1);
  const now = useClock();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, "");
  const date = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="sec faq" id="faq">
      <div className="sec-h">
        <h2>Good <em>questions.</em></h2>
        <p>
          Tap a notification to read it. Still stuck? Message me on <a href={X_URL} target="_blank" rel="noopener noreferrer">X</a> or{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
        </p>
      </div>

      <div className="ls" ref={ref}>
        <div className="ls-top" aria-hidden="true">
          <Lock />
          <span className="ls-date">{date}</span>
          <span className="ls-time">{time}</span>
        </div>

        <ul className="ls-list">
          {QA.map(([q, a], i) => (
            <li key={q} style={{ "--i": i }} className={open === i ? "open" : ""}>
              <button type="button" className="nf" aria-expanded={open === i} onClick={() => setOpen((o) => (o === i ? -1 : i))}>
                <span className="nf-app">
                  <Logo size={22} />
                  <span>Mail to Telegram</span>
                  <time>{AGO[i] || "1h ago"}</time>
                </span>
                <b>{q}</b>
                <span className="nf-msg">{a}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="ls-foot" aria-hidden="true">
          <span><Flashlight /></span>
          <i />
          <span><Camera /></span>
        </div>
      </div>
    </section>
  );
}
