import { useMemo } from "react";
import { ArrowRight, Reply, Swipe } from "../icons";
import { SCRIPT } from "../data";
import { parseScript } from "../lib/scriptInfo";
import { timeAgo, useLatestScript } from "../lib/useLatestScript";
import { useReveal } from "../lib/useReveal";

/*
 * "What you can do": each feature is shown as the real message you'd see in Telegram,
 * so people understand it by looking. The strip at the bottom is read live from the
 * script on GitHub (version, what's new, commands).
 */

const Me = ({ children }) => <div className="dm me">{children}</div>;
const Bot = ({ children, className = "" }) => <div className={`dm ${className}`}>{children}</div>;

const FEATURES = [
  {
    title: "The whole email, not a preview",
    text: "Sender, time and the full message, as soon as it arrives.",
    chat: (
      <Bot>
        📧 <b>Invoice #2041 is ready</b><br />👤 Billing, Cloudly<br />🕒 <b>Mon, 10:12 AM</b>
        <span className="dm-body">Hi Ada, your invoice for March is attached. Amount due: $24.00 by April 5.</span>
      </Bot>
    ),
  },
  {
    title: "Codes you copy in one tap",
    text: "Sign-in codes are picked out and made tap-to-copy.",
    chat: (
      <Bot>
        📧 <b>Your sign-in code</b><br />👤 Acme Bank<br />
        🔑 OTP: <span className="dm-otp">482913</span>
      </Bot>
    ),
  },
  {
    title: "Reply with a swipe",
    text: "Swipe a message, type your answer. It’s sent from your Gmail.",
    chat: (
      <>
        <Me><span className="dm-q"><b>Tolu, Northwind</b>Interview tomorrow</span>3pm works. See you then!</Me>
        <Bot>✅ Reply sent to <b>tolu@northwind.co</b></Bot>
      </>
    ),
  },
  {
    title: "Write new emails",
    text: "Type “send email”, fill in the short form, and it’s sent.",
    chat: (
      <>
        <Me>send email</Me>
        <Bot className="kb">
          ✉️ <b>New email</b>
          <span className="dm-pre">To: <br />Subject: <br />Message: </span>
          <span className="dm-btns"><i>✏️ Fill it in here</i><i>📋 Copy the form</i></span>
        </Bot>
      </>
    ),
  },
  {
    title: "Reminders that ring",
    text: "Emails with a date and time get reminders, and a phone call if you want.",
    chat: (
      <>
        <Bot>⏰ <b>Reminder:</b> Team call<br />Starts in 10 min, <b>Thu, 4:00 PM</b></Bot>
        <div className="dm-call"><span className="ringer" aria-hidden="true">📞</span> Incoming call…</div>
      </>
    ),
  },
  {
    title: "Long email? Get the short version",
    text: "Reply “summarize” to any email for a few-line summary.",
    chat: (
      <>
        <Me>summarize</Me>
        <Bot>📝 <b>Summary:</b> Lease renewal<br /><span className="dm-body">Rent goes up 5% from June 1. Sign by May 20 to keep your unit.</span></Bot>
      </>
    ),
  },
];

export default function Features() {
  const ref = useReveal(0.08);
  const s = useLatestScript();
  const info = useMemo(() => (s.status === "ready" ? parseScript(s.code) : null), [s.status, s.code]);
  const typed = info?.commands.typed || [];

  return (
    <section className="sec feat" id="features" ref={ref}>
      <div className="sec-h">
        <h2>Your inbox, <em>run from one chat.</em></h2>
        <p>This is exactly what you’ll see in Telegram.</p>
      </div>

      <div className="fgrid">
        {FEATURES.map((f, i) => (
          <article key={f.title} className="fcard rv" style={{ "--d": `${(i % 3) * 90}ms` }}>
            <div className="mc" aria-hidden="true">{f.chat}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </div>
      <p className="fswipe" aria-hidden="true"><Swipe /> Swipe to see more</p>

      <div className="livebox rv">
        <div className="live-v">
          <span className="eyebrow"><i className="live" aria-hidden="true" />Live from the script</span>
          <b>{s.version ? `Version ${s.version}` : s.status === "error" ? "Latest version" : "Checking…"}</b>
          <small>
            {s.date ? `Updated ${timeAgo(s.date)}. ` : ""}The bot tells you in Telegram when there’s a new one.
          </small>
        </div>
        <div className="live-n">
          <span className="k">What’s new</span>
          <p>{s.notes || (s.status === "error" ? "Couldn’t reach GitHub right now." : "Loading…")}</p>
        </div>
        <div className="live-c">
          <span className="k">Type in your bot chat</span>
          <div className="chips">
            {(typed.length ? typed.flatMap((c) => c.words.slice(0, 1)) : ["help", "send email", "summarize"]).map((w) => <code key={w}>{w}</code>)}
            <span className="chip-s"><Reply /> or swipe-reply any email</span>
          </div>
        </div>
        <a className="live-a" href={SCRIPT.view} target="_blank" rel="noopener noreferrer">
          See the code <ArrowRight />
        </a>
      </div>
    </section>
  );
}
