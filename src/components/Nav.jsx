import { useEffect, useRef, useState } from "react";
import { Close, Github, Menu } from "../icons";
import { GITHUB_URL } from "../data";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Setup", href: "#setup" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Fixed top bar. Gets a background once you scroll, hides while scrolling down,
 * shows again on scroll up.
 * Phones get a menu button with the same links.
 */
export default function Nav({ onStart }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setSolid(y > 8);
      if (y > last.current + 4 && y > 120) setHidden(true);
      else if (y < last.current - 4) setHidden(false);
      last.current = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const start = () => { setOpen(false); onStart(); };

  return (
    <nav className={`nv${solid ? " solid" : ""}${hidden && !open ? " hide" : ""}${open ? " open" : ""}`} aria-label="Main">
      <div className="nv-in">
        <a className="nv-lg" href="#top" onClick={() => setOpen(false)}>
          <Logo size={30} />
          <span>Mail to Telegram</span>
        </a>
        <div className="nv-links">
          {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </div>
        <div className="nv-r">
          <ThemeToggle />
          <a className="nv-gh" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Code on GitHub">
            <Github />
          </a>
          <button type="button" className="btn sm" onClick={start}>Set it up free</button>
          <button
            type="button"
            className="nv-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nv-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      <div className="nv-sheet" id="nv-sheet" hidden={!open}>
        {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"><Github /> Code on GitHub</a>
        <button type="button" className="btn" onClick={start}>Set it up free</button>
      </div>
    </nav>
  );
}
