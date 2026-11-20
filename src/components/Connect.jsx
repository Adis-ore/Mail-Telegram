import { Linkedin, XLogo } from "../icons";
import { LINKEDIN_URL, X_URL } from "../data";

const Buttons = () => (
  <div className="cx-b">
    <a className="cx-x" href={X_URL} target="_blank" rel="noopener noreferrer">
      <span className="cx-i"><XLogo /></span>
      <span className="cx-l"><b>Follow on X</b><small>@adisdtechie</small></span>
    </a>
    <a className="cx-in" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
      <span className="cx-i"><Linkedin /></span>
      <span className="cx-l"><b>Connect on LinkedIn</b><small>Adis</small></span>
    </a>
  </div>
);

/**
 * "Connect with me": X and LinkedIn buttons (icon, name, hover animation).
 * big = a full card with a heading (under the FAQ); otherwise a compact row (under the setup chat).
 */
export default function Connect({ big = false, className = "" }) {
  if (!big) {
    return (
      <div className={`cx ${className}`}>
        <span className="cx-t">Stuck? <b>Connect with me</b></span>
        <Buttons />
      </div>
    );
  }
  return (
    <div className={`cx-card ${className}`}>
      <span className="cx-glow" aria-hidden="true" />
      <h3>Let’s <em>connect.</em></h3>
      <p>Stuck on a step, found a bug, or have an idea? Message me. I reply to everyone and I’ll help you get it running.</p>
      <Buttons />
    </div>
  );
}
