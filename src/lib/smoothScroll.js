import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { prefersReducedMotion } from "./motion";

let lenis = null;

/** Starts eased, continuous scrolling (wheel, keys and #anchor links). Returns a stop function. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {};
  lenis = new Lenis({ duration: 1.25, smoothWheel: true, anchors: { duration: 1.6 } });
  let raf = 0;
  const loop = (t) => { lenis?.raf(t); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null; };
}

/** Scrolls to a page Y position, animated through Lenis when it is running. */
export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
