import { useState } from "react";
import { Mail, Plus, ShieldCheck, SourceCode, Telegram } from "../icons";
import { useReveal } from "../lib/useReveal";
import Logo from "./Logo";

// Four short points; the detail opens on hover (mouse) or tap/click.
const POINTS = [
  { icon: <Mail />, tone: "red", title: "An email lands in Gmail", text: "Any new email in your inbox: sign-in codes, invoices, interview invites. Nothing changes in how you use Gmail." },
  { icon: <SourceCode />, tone: "violet", title: "Your script picks it up", text: "A small Google Apps Script in your own account checks every minute, even when your phone and laptop are off." },
  { icon: <Telegram />, tone: "blue", title: "It arrives in Telegram", text: "Your own bot sends you the whole email. Swipe to reply and it goes out from your Gmail as a normal email." },
  { icon: <ShieldCheck />, tone: "green", title: "Private by design", text: "Gmail to your script to your bot. There’s no server in the middle, so nobody else can read your mail, including me." },
];

function Point({ p, i, open, onToggle }) {
  return (
    <li className={`hw-card rv tone-${p.tone}${open ? " open" : ""}`} style={{ "--d": `${i * 90}ms` }}>
      <button type="button" aria-expanded={open} onClick={onToggle}>
        <span className="hw-i">{p.icon}</span>
        <b>{p.title}</b>
        <span className="hw-plus" aria-hidden="true"><Plus /></span>
      </button>
      <div className="hw-x"><p>{p.text}</p></div>
    </li>
  );
}

export default function HowItWorks() {
  const ref = useReveal();
  const [open, setOpen] = useState(-1);
  const toggle = (i) => setOpen((o) => (o === i ? -1 : i));

  return (
    <section className="sec how" id="how" ref={ref}>
      <div className="sec-h">
        <h2>Gmail in, <em>Telegram out.</em></h2>
        <p>Set it up once. After that you don’t open anything, it just runs.</p>
      </div>
      <div className="hw">
        <ul className="hw-col">
          {POINTS.slice(0, 2).map((p, i) => <Point key={p.title} p={p} i={i} open={open === i} onToggle={() => toggle(i)} />)}
        </ul>
        <div className="hw-core rv" aria-hidden="true">
          <span className="hw-ring" /><span className="hw-ring r2" />
          <Logo size={96} />
        </div>
        <ul className="hw-col">
          {POINTS.slice(2).map((p, j) => <Point key={p.title} p={p} i={j + 2} open={open === j + 2} onToggle={() => toggle(j + 2)} />)}
        </ul>
      </div>
      {/* phones: the tapped card's detail shows here, so the cards all stay the same size */}
      <div className={`hw-detail${open >= 0 ? ` on tone-${POINTS[open].tone}` : ""}`} aria-live="polite">
        {open >= 0 ? <><b>{POINTS[open].title}</b><p key={open}>{POINTS[open].text}</p></> : <p>Tap a card to see more.</p>}
      </div>
      <p className="hw-hint">Hover or tap a card to see more.</p>
    </section>
  );
}
