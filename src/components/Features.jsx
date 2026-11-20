import { Swipe } from "../icons";
import { useReveal } from "../lib/useReveal";

/*
 * "What you can do": each feature is shown as the real message you'd see in Telegram,
 * so people understand it by looking.
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

    </section>
  );
}
