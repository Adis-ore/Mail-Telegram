import { scrollToY } from "./smoothScroll";

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const mix = (a, b, t) => a + (b - a) * t;
/** Progress of t through the window [start, start + dur], clamped to 0..1. */
export const between = (t, start, dur) => clamp01((t - start) / dur);

export const easeOut4 = (t) => 1 - Math.pow(1 - t, 4);
export const easeInOut4 = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const easeIn3 = (t) => t * t * t;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls cb(isVisible) as el enters/leaves the viewport. Returns a cleanup function. */
export function observeVisibility(el, cb) {
  if (!("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver((entries) => cb(entries[0].isIntersecting));
  io.observe(el);
  return () => io.disconnect();
}

/** Scrolls so the sticky track sits at `fraction` (0..1) of its scroll range. */
export function scrollToTrack(track, fraction) {
  const r = track.getBoundingClientRect();
  scrollToY(window.scrollY + r.top + (track.offsetHeight - window.innerHeight) * fraction);
}

/** The step panel's scroll window is split into equal segments, one per step. */
export const STEP_START = 0.46;
export const STEP_SPAN = 0.32;
/** Scroll fraction at the middle of step i's segment. */
export const stepFraction = (i, n) => STEP_START + (STEP_SPAN * (i + 0.5)) / n;
