import { useEffect, useRef } from "react";
import { GITHUB_URL, LINKEDIN_URL, X_URL } from "../data";
import { observeVisibility, prefersReducedMotion } from "../lib/motion";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };

/** Animated arch of wavy lines with a glow at the bottom centre. */
function useArchCanvas(canvasRef) {
  useEffect(() => {
    const cv = canvasRef.current, ctx = cv.getContext("2d"), still = prefersReducedMotion();
    let w = 0, h = 0, visible = true, raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(ms) {
      const t = ms / 1000, N = 34;
      ctx.clearRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, w * 0.5);
      glow.addColorStop(0, "rgba(120,170,255,.35)"); glow.addColorStop(1, "rgba(11,21,51,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      for (let k = 0; k < N; k++) {
        const q = k / N;
        ctx.beginPath();
        for (let s = 0; s <= 60; s++) {
          const u = s / 60, e = Math.abs(2 * u - 1);
          const y = h * (0.42 + 0.5 * q) - h * 0.55 * Math.pow(e, 2.4) * (1 - 0.25 * q) + Math.sin(u * 7 + t * 0.6 + k * 0.35) * 6 * (1 - e);
          const x = u * w;
          if (s) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = `rgba(190,215,255,${0.07 + 0.25 * q})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      const core = ctx.createRadialGradient(w / 2, h * 0.93, 0, w / 2, h * 0.93, h * 0.22);
      core.addColorStop(0, "rgba(255,255,255,.9)"); core.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = core; ctx.fillRect(0, h * 0.6, w, h * 0.4);
    }

    resize();
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => { resize(); if (still) draw(0); }) : null;
    ro?.observe(cv);
    const stopVis = observeVisibility(cv, (v) => { visible = v; });

    if (still) draw(0);
    else {
      const loop = (ts) => { raf = requestAnimationFrame(loop); if (visible) draw(ts); };
      raf = requestAnimationFrame(loop);
    }

    return () => { cancelAnimationFrame(raf); ro?.disconnect(); stopVis(); };
  }, [canvasRef]);
}

export default function Footer() {
  const canvasRef = useRef(null);
  useArchCanvas(canvasRef);

  return (
    <>
      {/* long colour fade from the page into the footer, so there is no hard edge */}
      <div className="ft-fade" aria-hidden="true" />
    <footer className="ft" id="contact">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="br">Mail to Telegram</div>
      <div>
        <p className="tg">Your inbox, in your pocket.<br />Free to fork and share.</p>
        <div className="so">
          <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="Adis on X">
            <svg viewBox="0 0 24 24" width="19" height="19" {...line}><path d="M4 4h4.6L20 20h-4.6L4 4Z" /><path d="m19.5 4.5-6.1 6.8M4.5 19.5l6.1-6.8" /></svg>
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="Adis on LinkedIn">
            <svg viewBox="0 0 24 24" width="19" height="19" {...line}><path d="M2 12c0-4.7 0-7.1 1.5-8.5C4.9 2 7.3 2 12 2s7.1 0 8.5 1.5C22 4.9 22 7.3 22 12s0 7.1-1.5 8.5C19.1 22 16.7 22 12 22s-7.1 0-8.5-1.5C2 19.1 2 16.7 2 12Z" /><path d="M7 10.5V17M7 7v.01M11 17v-6.5M11 13.75c0-1.8 1.34-3.25 3-3.25s3 1.45 3 3.25V17" /></svg>
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Project on GitHub">
            <svg viewBox="0 0 24 24" width="19" height="19" {...line}><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>
          </a>
        </div>
        <small>Built by Adis · Stuck? Message me on X or LinkedIn.</small>
      </div>
    </footer>
    </>
  );
}
