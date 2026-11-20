import { useEffect, useState } from "react";
import { Features, Github, Help, Home, Plus, Workflow } from "../icons";
import { GITHUB_URL } from "../data";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

// The dock's items; the middle one (Setup) is the raised button.
const ITEMS = [
  { id: "top", label: "Home", icon: <Home /> },
  { id: "how", label: "How it works", icon: <Workflow /> },
  { id: "setup", label: "Set it up", icon: <Plus />, mid: true },
  { id: "features", label: "Features", icon: <Features /> },
  { id: "faq", label: "FAQ", icon: <Help /> },
];

/** Which section is in the middle of the screen right now. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const IDS = ITEMS.map((i) => i.id);

/**
 * Top: a slim bar with the logo, theme toggle and GitHub (fades in a background once you scroll).
 * Bottom: a floating pill dock with the sections, the same on desktop and phones. No burger menu.
 */
export default function Nav() {
  const [solid, setSolid] = useState(false);
  const active = useActiveSection(IDS);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <header className={`nv${solid ? " solid" : ""}`}>
        <div className="nv-in">
          <a className="nv-lg" href="#top">
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

      <nav className="dock" aria-label="Sections">
        {ITEMS.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`${it.mid ? "dk-mid" : ""}${active === it.id ? " on" : ""}`}
            aria-label={it.label}
            aria-current={active === it.id ? "true" : undefined}
            data-label={it.label}
          >
            {it.icon}
          </a>
        ))}
      </nav>
    </>
  );
}
