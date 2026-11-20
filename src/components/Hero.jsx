import { ArrowDown, ArrowRight, Check } from "@phosphor-icons/react";
import { useLatestScript } from "../lib/useLatestScript";
import HeroDemo from "./HeroDemo";

/** Says what the product is in one line, then shows it working. */
export default function Hero({ onStart }) {
  const s = useLatestScript();
  return (
    <header className="hx" id="top">
      <div className="hx-in">
        <div className="hx-copy">
          <span className="eyebrow">
            <i className="live" aria-hidden="true" />
            Free and open source{s.version ? ` · v${s.version}` : ""}
          </span>
          <h1>Read and answer your Gmail <em>from Telegram.</em></h1>
          <p className="hx-sub">
            Every new email lands in your Telegram chat within a minute. Copy codes in one tap,
            reply with a swipe, and get reminders that ring your phone.
          </p>
          <div className="hx-cta">
            <button type="button" className="btn big" onClick={onStart}>
              Set it up free <ArrowRight weight="bold" />
            </button>
            <a className="btn ghost big" href="#how">How it works <ArrowDown weight="bold" /></a>
          </div>
          <ul className="hx-proof">
            <li><Check weight="bold" /> 10-minute setup</li>
            <li><Check weight="bold" /> No app or server</li>
            <li><Check weight="bold" /> Runs in your own Google account</li>
          </ul>
        </div>
        <HeroDemo />
      </div>
    </header>
  );
}
