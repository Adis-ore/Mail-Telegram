import { useEffect, useRef } from "react";
import { EnvelopeSimple, Sparkle } from "@phosphor-icons/react";
import { GITHUB_URL, HEAD_SRC, STEPS } from "../data";
import { clamp01, observeVisibility, prefersReducedMotion } from "../lib/motion";
import DitherVeil from "./DitherVeil";
import ThemeToggle from "./ThemeToggle";
import GooeyNav from "./GooeyNav";
import GridScan from "./GridScan";
import { useDarkMode } from "../lib/useDarkMode";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "How it works", href: "#track" },
  { label: "Features", href: "#features" },
  { label: "Questions", href: "#contact" },
];


/** Small overlapping circles in step colours, like an avatar stack. */
function StepDots({ picks }) {
  return (
    <div className="dots3" aria-hidden="true">
      {picks.map((i) => {
        const [c0, c1] = STEPS[i].colors;
        return <i key={i} style={{ background: `linear-gradient(160deg,${c0},${c1})` }}>{STEPS[i].icon}</i>;
      })}
      <em>+</em>
    </div>
  );
}

/** One glass tile on the wheel. Its position is set each frame by Hero. */
function Tile({ step, index, onSelect, tileRef }) {
  const [c0, c1] = step.colors;
  return (
    <button
      ref={tileRef}
      type="button"
      className="tile"
      aria-label={`Step ${index + 1}: ${step.title}`}
      style={{ "--c0": c0, "--c1": c1 }}
      onClick={() => onSelect(index)}
    >
      <span className="face front">
        <span className="chip">{step.icon}</span>
        <span>
          <b>{step.name}</b>
          <small>{step.where}</small>
        </span>
      </span>
      <span className="face back" />
    </button>
  );
}

export default function Hero({ onSelectStep }) {
  const heroRef = useRef(null);
  const copyRef = useRef(null);
  const orbRef = useRef(null);
  const tilesRef = useRef([]);
  const dark = useDarkMode();

  // Ring of glass tiles spinning around the head; slows down while hovered.
  useEffect(() => {
    const orb = orbRef.current, tiles = tilesRef.current, n = tiles.length;
    const still = prefersReducedMotion();
    let raf = 0, prev = 0, angle = 0, speed = 0.13, visible = true, hover = false;
    const stopVis = observeVisibility(orb, (v) => { visible = v; });
    const onEnter = () => { hover = true; };
    const onLeave = () => { hover = false; };
    orb.addEventListener("pointerenter", onEnter);
    orb.addEventListener("pointerleave", onLeave);

    // Flat ring around the head at eye level (tilted in CSS on .ring). Each tile sits
    // on the ring facing outward; tiles at the back pass behind the head.
    const place = () => {
      const R = orb.clientWidth * 0.62;
      tiles.forEach((el, i) => {
        const a = angle + (i / n) * Math.PI * 2;
        el.style.transform = `rotateY(${a.toFixed(4)}rad) translateZ(${R.toFixed(1)}px)`;
      });
    };
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      const dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0;
      prev = ts;
      if (!visible) return;
      speed += ((hover ? 0.02 : 0.13) - speed) * Math.min(1, dt * 3);
      angle += speed * dt;
      place();
    };
    if (still) place();
    else raf = requestAnimationFrame(loop);
    const ro = "ResizeObserver" in window ? new ResizeObserver(place) : null;
    ro?.observe(orb);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      stopVis();
      orb.removeEventListener("pointerenter", onEnter);
      orb.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Fade and drift the hero away as the page scrolls.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hero = heroRef.current, copy = copyRef.current, orb = orbRef.current;
    const update = () => {
      const t = clamp01(window.scrollY / (hero.offsetHeight * 0.75));
      // Continuous hand-off: the hero lifts, blurs and shrinks away while the next
      // section's title rises into the same space (see StepDeck's intro).
      const e = t * t * (3 - 2 * t);
      copy.style.opacity = Math.max(0, 1 - 1.4 * e).toFixed(3);
      copy.style.transform = `translateY(${(-90 * e).toFixed(1)}px) scale(${(1 - 0.08 * e).toFixed(3)})`;
      copy.style.filter = e > 0.01 ? `blur(${(8 * e).toFixed(1)}px)` : "";
      orb.style.opacity = Math.max(0, 1 - 1.1 * e).toFixed(3);
      orb.style.transform = `translateX(-50%) translateY(${(-60 * e).toFixed(1)}px) scale(${(1 - 0.22 * e).toFixed(3)})`;
      orb.style.filter = e > 0.01 ? `blur(${(6 * e).toFixed(1)}px)` : "";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="hero" id="hero" ref={heroRef}>
      <GridScan
        className="hero-grid"
        aria-hidden="true"
        lightMode={!dark}
        linesColor={dark ? "#4d4757" : undefined}
        scanColor={dark ? "#7dd3fc" : undefined}
        cells={8}
        depth={3}
        scanDuration={2.4}
        scanDelay={1.6}
        clickEffect="ping"
        lineThickness={1}
        lineStyle="solid"
        depthFade={0.6}
        shading={0.7}
        reflection={0.35}
        points
        scanDirection="forward"
        scanWidth={1}
        trail={0.5}
        glow={0.6}
        parallax={1}
        autoScan
        interactive
        enableWebcam={false}
        intro
      />
      <div className="nav">
        <a className="lg" href="#hero"><img src="/favicon.svg" alt="" width="30" height="30" /><span className="lg-t">Mail to Telegram</span></a>
        <GooeyNav
          className="nav-gooey"
          items={NAV_ITEMS}
          initialActiveIndex={0}
          theme={dark ? "dark" : "light"}
          size="md"
          frame
          particleCount={15}
          spread={56}
          animationTime={600}
          timeVariance={300}
          gooeyness={0.5}
          wobble={0.5}
          hoverEffect
        />
        <div className="nav-r">
          <ThemeToggle />
          <a className="cta" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Get the script ↗</a>
        </div>
      </div>

      <div className="hcopy" ref={copyRef}>
        <h1>Your inbox,<em>in your pocket.</em></h1>
      </div>

      <svg className="hline" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="500" cy="150" rx="410" ry="118" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="fc l">
        <span className="fi"><EnvelopeSimple weight="bold" /></span>
        <b>Whole email, instantly.</b>
        <span>Sender, time and the full body.</span>
      </div>
      <div className="fc r">
        <StepDots picks={[2, 6, 7]} />
        <b>Reply from Telegram.</b>
        <span>Swipe a message to answer by email.</span>
      </div>

      <div className="badge" aria-hidden="true">
        <svg viewBox="0 0 92 92">
          <defs><path id="badge-circle" d="M46 46m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0" /></defs>
          <g className="rt">
            <text><textPath href="#badge-circle">Free · no server · 10 minutes ·</textPath></text>
          </g>
          <Sparkle weight="fill" x="35" y="35" width="22" height="22" />
        </svg>
      </div>

      <div className="hn l">
        Free and open source.<br />Runs on your own Google account.
        <StepDots picks={[0, 4, 5]} />
      </div>
      <div className="hn r">
        <Sparkle weight="fill" aria-hidden="true" />
        Less checking.<br />More doing.
      </div>

      <div className="orb" ref={orbRef}>
        <div className="scene">
          <DitherVeil
            className="hd veil"
            src={HEAD_SRC}
            pattern="floyd"
            pixelSize={2}
            inkColor="#120f17"
            paperColor="#f4f1ea"
            revealRadius={200}
            softness={0.6}
            linger={1}
          />
          <div className="ring">
            {STEPS.map((step, i) => (
              <Tile
                key={step.name}
                step={step}
                index={i}
                onSelect={onSelectStep}
                tileRef={(el) => { tilesRef.current[i] = el; }}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
