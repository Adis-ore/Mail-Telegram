import { useState } from "react";
import { Mail, Plus, ShieldCheck, SourceCode, Telegram } from "../icons";
import { useReveal } from "../lib/useReveal";
import Logo from "./Logo";

// Four short points in a 2 × 2 cluster around the logo, read left to right, top to bottom.
// Each card's inner corner is carved to wrap the logo ball. The detail shows in the box below.
const POINTS = [
  { icon: <Mail />, tone: "red", pos: "tl", title: "An email lands in Gmail", text: "Any new email in your inbox: sign-in codes, invoices, interview invites. Nothing changes in how you use Gmail." },
  { icon: <SourceCode />, tone: "violet", pos: "tr", title: "Your script picks it up", text: "A small Google Apps Script in your own account checks every minute, even when your phone and laptop are off." },
  { icon: <Telegram />, tone: "blue", pos: "bl", title: "It arrives in Telegram", text: "Your own bot sends you the whole email. Swipe to reply and it goes out from your Gmail as a normal email." },
  { icon: <ShieldCheck />, tone: "green", pos: "br", title: "Private by design", text: "Gmail to your script to your bot. There’s no server in the middle, so nobody else can read your mail, including me." },
];

export default function HowItWorks() {
  const ref = useReveal();
  const [open, setOpen] = useState(-1);
  const hoverable = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  return (
    <section className="sec how" id="how" ref={ref}>
      <div className="sec-h">
        <h2>Gmail in, <em>Telegram out.</em></h2>
        <p>Set it up once. After that you don’t open anything, it just runs.</p>
      </div>

      <div className="hw rv">
        <ul className="hw-grid">
          {POINTS.map((p, i) => (
            <li key={p.title} className={`hw-card pos-${p.pos} tone-${p.tone}${open === i ? " open" : ""}`}>
              <button
                type="button"
                className="hw-face"
                aria-expanded={open === i}
                aria-controls="hw-detail"
                onClick={() => setOpen((o) => (o === i ? -1 : i))}
                onMouseEnter={hoverable ? () => setOpen(i) : undefined}
              >
                <span className="hw-i">{p.icon}</span>
                <b>{p.title}</b>
                <span className="hw-plus" aria-hidden="true"><Plus /></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="hw-core" aria-hidden="true">
          <span className="hw-ring" />
          <Logo size={84} />
        </div>
      </div>

      {/* only shows once a card is chosen */}
      <div id="hw-detail" aria-live="polite">
        {open >= 0 && (
          <div className={`hw-detail on tone-${POINTS[open].tone}`} key={open}>
            <b>{POINTS[open].title}</b><p>{POINTS[open].text}</p>
          </div>
        )}
      </div>
    </section>
  );
}
