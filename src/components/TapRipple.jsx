import { useEffect } from "react";
import { prefersReducedMotion } from "../lib/motion";

/**
 * A small, soft ripple where you tap or click: two thin rings that spread out and fade.
 * Replaces the browser's grey/blue tap box (turned off in CSS). One shared layer, no re-renders.
 */
export default function TapRipple() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const layer = document.createElement("div");
    layer.className = "tap-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const onDown = (e) => {
      if (e.button > 0) return; // main button / touch only
      const r = document.createElement("span");
      r.className = "tap";
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      r.innerHTML = "<i></i><i></i>";
      layer.appendChild(r);
      setTimeout(() => r.remove(), 750);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => { window.removeEventListener("pointerdown", onDown); layer.remove(); };
  }, []);
  return null;
}
