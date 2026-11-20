import { useEffect, useState } from "react";
import { Bell, Github, Help, Home, Plus, Workflow } from "../icons";
import { GITHUB_URL } from "../data";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

// The dock's items; the middle one (Setup) is the raised button.
const ITEMS = [
  { id: "top", label: "Home", icon: <Home /> },
  { id: "how", label: "How it works", icon: <Workflow /> },
  { id: "setup", label: "Set it up", icon: <Plus />, mid: true },
  { id: "faq", label: "FAQ", icon: <Help /> },
  { id: "latest", label: "What’s new", icon: <Bell /> },
];

/** The last section whose top has passed the middle of the screen (works for jumps too). */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) cur = id;
      }
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [ids]);
  return active;
}

// Page order, so the check above walks top to bottom.
const ORDER = ["top", "how", "setup", "faq", "latest"];
const IDS = ORDER;

/**
 * Top bar on every screen: logo, theme toggle, GitHub (gets a background once you scroll).
 * Phones also get a floating section dock at the bottom with a raised Setup button; no burger menu.
 */
export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [away, setAway] = useState(false); // phones: the dock hides while the setup phone fills the bottom of the screen
  const active = useActiveSection(IDS);

  useEffect(() => {
    const on = () => {
      setSolid(window.scrollY > 8);
      const r = document.querySelector(".tgw")?.getBoundingClientRect();
      setAway(!!r && r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight - 60);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    document.addEventListener("animationend", on);   // the setup phone opening/closing changes its size
    return () => { window.removeEventListener("scroll", on); document.removeEventListener("animationend", on); };
  }, []);

  return (
    <>
      <header className={`nv${solid ? " solid" : ""}`}>
        <div className="nv-in">
          <a className="nv-lg" href="#top" aria-label="Mail to Telegram, back to top">
            <Logo size={30} />
            <span>Mail to Telegram</span>
          </a>
          <div className="nv-r">
            <ThemeToggle />
            <a className="nv-gh" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Code on GitHub">
              <Github />
            </a>
          </div>
        </div>
      </header>

      {/* phones only (hidden on larger screens in CSS) */}
      <nav className={`dock${away ? " away" : ""}`} aria-label="Sections">
        {ITEMS.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`${it.mid ? "dk-mid" : ""}${active === it.id ? " on" : ""}`}
            aria-label={it.label}
            aria-current={active === it.id ? "true" : undefined}
          >
            {it.icon}
          </a>
        ))}
      </nav>
    </>
  );
}
