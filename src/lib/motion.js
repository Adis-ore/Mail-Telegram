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
