import { useEffect } from "react";
import { prefersReducedMotion } from "../lib/motion";

/*
 * One background for the whole page, plus the scroll-linked motion that ties the sections together:
 * - --p (0 at the top, 1 at the bottom) on <html> drives the background blobs and the nav progress line
 * - each section rises in and settles as it enters, then eases back a little as it leaves
 */
const SECTIONS = ["how", "setup", "faq", "latest"];

export default function ScrollScene() {
  useEffect(() => {
    const root = document.documentElement;
    const still = prefersReducedMotion();
    let raf = 0;
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const update = () => {
      raf = 0;
      const max = Math.max(1, root.scrollHeight - innerHeight);
      root.style.setProperty("--p", clamp(scrollY / max).toFixed(4));
      if (still) return;
      const vh = innerHeight;
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const enter = clamp((vh - r.top) / (vh * 0.4));   // 0 while below the screen, 1 once it is well in
        const leave = clamp(r.bottom / (vh * 0.35));       // 1 until its bottom is in the top 35% of the screen
        const k = Math.min(enter, leave);
        const e = 1 - Math.pow(1 - k, 3);
        // move the contents, never the section itself, so jumps to a section land in the right place
        const op = (0.3 + 0.7 * e).toFixed(3);
        const tf = e > 0.999 ? "" : `translateY(${((1 - e) * (enter < 1 ? 48 : -24)).toFixed(1)}px) scale(${(0.965 + 0.035 * e).toFixed(4)})`;
        for (const c of el.children) { c.style.opacity = op; c.style.transform = tf; }
      });
      // the hero drifts up and fades as the next section takes over
      const hero = document.querySelector(".hx-in");
      if (hero) {
        const t = clamp(scrollY / (vh * 0.9));
        hero.style.transform = t ? `translateY(${(-60 * t).toFixed(1)}px) scale(${(1 - 0.04 * t).toFixed(4)})` : "";
        hero.style.opacity = (1 - 0.6 * t).toFixed(3);
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);

  return (
    <div className="pbg" aria-hidden="true">
      <i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" />
      <span className="pbg-dots" />
    </div>
  );
}
