import { Moon, Sun } from "@phosphor-icons/react";
import { useDarkMode } from "../lib/useDarkMode";

/** Switches between light and dark and remembers the choice for next visit. */
export default function ThemeToggle() {
  const dark = useDarkMode();
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* storage blocked: still switches */ }
  };
  return (
    <button type="button" className="tgl" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>
      {dark ? <Sun weight="bold" aria-hidden="true" /> : <Moon weight="bold" aria-hidden="true" />}
    </button>
  );
}
