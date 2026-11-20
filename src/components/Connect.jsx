import { Linkedin, XLogo } from "../icons";
import { LINKEDIN_URL, X_URL } from "../data";

/** "Connect with me" with an X and a LinkedIn button (icon + name, animated on hover). */
export default function Connect({ className = "" }) {
  return (
    <div className={`cx ${className}`}>
      <span className="cx-t">Connect with me</span>
      <div className="cx-b">
        <a className="cx-x" href={X_URL} target="_blank" rel="noopener noreferrer">
          <span className="cx-i"><XLogo /></span>
          <span>X <small>@adisdtechie</small></span>
        </a>
        <a className="cx-in" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          <span className="cx-i"><Linkedin /></span>
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}
