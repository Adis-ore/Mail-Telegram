import { useEffect, useState } from "react";

const query = () => window.matchMedia("(prefers-color-scheme: dark)");
const read = () => {
  const forced = document.documentElement.dataset.theme;
  return forced ? forced === "dark" : query().matches;
};

/** True when the page is showing its dark palette (system setting or data-theme). */
export function useDarkMode() {
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const update = () => setDark(read());
    const mq = query();
    mq.addEventListener("change", update);
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { mq.removeEventListener("change", update); mo.disconnect(); };
  }, []);
  return dark;
}
