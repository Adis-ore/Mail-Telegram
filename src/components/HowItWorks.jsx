import { Code, Send2, ShieldTick, Sms } from "../icons";
import { useReveal } from "../lib/useReveal";

const STEPS = [
  {
    icon: <Sms />,
    title: "An email lands in Gmail",
    text: "Any new email in your inbox: codes, invoices, interview invites.",
  },
  {
    icon: <Code />,
    title: "Your script picks it up",
    text: "A small Google Apps Script in your own account checks every minute, even with your phone off.",
  },
  {
    icon: <Send2 />,
    title: "It arrives in Telegram",
    text: "Your own bot sends you the full email. Reply there and it goes out from your Gmail.",
  },
];

export default function HowItWorks() {
  const ref = useReveal();
  return (
    <section className="sec how" id="how" ref={ref}>
      <div className="sec-h">
        <span className="eyebrow">How it works</span>
        <h2>Gmail in, <em>Telegram out.</em></h2>
        <p>Set it up once. After that you don’t open anything, it just runs.</p>
      </div>
      <ol className="how-flow">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rv" style={{ "--d": `${i * 120}ms` }}>
            <span className="how-i">{s.icon}<em>{i + 1}</em></span>
            <b>{s.title}</b>
            <p>{s.text}</p>
          </li>
        ))}
        <span className="how-line" aria-hidden="true"><i /></span>
      </ol>
      <div className="how-safe rv" style={{ "--d": "360ms" }}>
        <span className="how-si"><ShieldTick /></span>
        <div>
          <b>Private by design.</b>
          <p>Your emails go from your Gmail to your script to your bot. There’s no server in the middle, so nobody else can read them, including me.</p>
        </div>
      </div>
    </section>
  );
}
