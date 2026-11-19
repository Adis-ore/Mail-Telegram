import { Fragment, useEffect, useRef, useState } from "react";
import { HEADLINE, LINKEDIN_URL, STEPS, X_URL } from "../data";
import {
  between, clamp01, easeIn3, easeInOut4, easeOut4, mix,
  observeVisibility, prefersReducedMotion, scrollToTrack, STEP_SPAN, STEP_START,
} from "../lib/motion";
import Card from "./Card";
import StepPanel from "./StepPanel";
import TechText from "./TechText";
import ScriptViewer from "./ScriptViewer";
import LightTunnel from "./LightTunnel";
import { useDarkMode } from "../lib/useDarkMode";

/**
 * The tall scroll track with a sticky stage. Scroll progress drives:
 * intro title -> scattered cards + headline -> cards fan into an arc and the
 * active card's panel shows -> cards stack and the "Questions?" block appears.
 * Per-frame styles are written straight to DOM refs (no React re-render per frame);
 * only the active step index goes through state.
 */
export default function StepDeck({ trackRef, onSelectStep }) {
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const introRef = useRef(null);
  const copyRef = useRef(null);
  const panelRef = useRef(null);
  const askRef = useRef(null);
  const hintRef = useRef(null);
  const tunnelRef = useRef(null);
  const cardsRef = useRef([]);
  const sheensRef = useRef([]);
  const wordsRef = useRef([]);
  const [active, setActive] = useState(0);
  const dark = useDarkMode();

  useEffect(() => {
    const track = trackRef.current, stage = stageRef.current, layer = layerRef.current;
    const intro = introRef.current, copy = copyRef.current, panel = panelRef.current;
    const ask = askRef.current, hint = hintRef.current, tunnel = tunnelRef.current;
    const cards = cardsRef.current, sheens = sheensRef.current, words = wordsRef.current;
    const n = STEPS.length, mid = (n - 1) / 2, still = prefersReducedMotion();

    let W = 0, H = 0, nar = false, cw = 0, WR = 0, hubX = 0, sp = 0;
    let target = 0, shown = 0, born = -1, prev = 0, visible = true, act = -1, raf = 0;
    let ptr = { x: 0, y: 0 };
    const ease = { x: 0, y: 0 };

    function measure() {
      W = stage.clientWidth; H = stage.clientHeight; nar = W < 768;
      cw = nar ? Math.min(104, Math.max(80, W * 0.24)) : Math.min(180, Math.max(110, W * 0.13));
      stage.style.setProperty("--u", cw / 300 + "px");
      layer.style.perspective = H * 1.744 + "px";
      // Upright wheel whose hub is off to the left: the active card is the rightmost
      // point of the rim and the neighbours curve back toward the left edge, so the
      // panel sits boxed in between the left border and the cards.
      const ch = (cw * 4) / 3;
      WR = H * (nar ? 0.6 : 0.66);
      sp = ((ch * 1.12) / WR) * (180 / Math.PI);
      const panelLeft = nar ? 10 : Math.max(24, W * 0.06);
      const panelW = nar ? W - cw * 0.97 - 22 : Math.min(400, W * 0.34);
      const activeX = nar ? W / 2 - cw * 0.35 : -W / 2 + panelLeft + panelW + 64 + cw * 0.62;
      hubX = activeX - WR;
      panel.style.left = panelLeft + "px";
      panel.style.top = "50%";
      panel.style.width = panelW + "px";
      panel.style.maxHeight = H - 28 + "px";
    }

    const progress = () => {
      const r = track.getBoundingClientRect();
      return clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
    };

    function render(now) {
      const P = shown, age = born < 0 ? 0 : now - born;
      const R0 = H * (nar ? 0.8 : 1.1), pY0 = H * 0.24 + R0, sp0 = nar ? 9 : 10.5;
      const turn = easeInOut4(between(P, 0.42, 0.1));
      const f = Math.min(n - 1, Math.max(0, clamp01((P - STEP_START) / STEP_SPAN) * n - 0.5));
      const fe = mix(mid, f, turn);
      const st = easeInOut4(between(P, 0.8, 0.14));

      cards.forEach((el, i) => {
        const rk = Math.abs(i - mid);
        const o = easeOut4(between(P, 0.03 + 0.01 * rk, 0.14));
        const bk = easeInOut4(between(P, 0.28 + 0.01 * (mid - rk), 0.16));
        const spr = o * (1 - bk);
        // wheel position
        const d = (((i - fe + n / 2) % n) + n) % n - n / 2;
        const a = (d * sp * Math.PI) / 180;
        const fx = hubX + Math.cos(a) * WR, fy = Math.sin(a) * WR, fr = d * sp;
        const fz = -(1 - Math.cos(a)) * WR * 0.45;
        // initial hand position
        const a0 = ((i - mid) * sp0 * Math.PI) / 180;
        const ix = Math.sin(a0) * R0, iy = pY0 - Math.cos(a0) * R0 + H * 0.15, ir = (i - mid) * sp0;
        // scattered position
        const an = (i / n) * 6.2832 - 1.2;
        const sx = Math.cos(an) * W * (nar ? 0.42 : 0.36);
        const sy = nar ? Math.sin(an) * H * 0.26 + H * 0.14 : Math.sin(an) * H * 0.33 - H * 0.02;
        const sr = Math.sin(i * 2.3) * 14;

        let x = mix(mix(ix, sx, o), fx, bk), y = mix(mix(iy, sy, o), fy, bk), r = mix(mix(ir, sr, o), fr, bk);
        let sc = 1 + 0.2 * Math.max(0, 1 - Math.abs(d)) * turn + 0.05 * spr;
        const dl = 0.05 + 0.075 * rk;
        const rise = still ? 0 : Math.pow(1 - clamp01((age - dl) / 1.25), 4);
        const wob = still ? 0 : 0.015 + 0.05 * spr;
        let tx = mix(0.1, Math.sin(i * 1.3) * 0.35, spr) + 0.12 * ease.y + Math.sin(0.7 * now + 1.7 * i) * wob;
        let ty = Math.cos(i * 1.9) * 0.5 * spr + 0.2 * ease.x + Math.cos(0.55 * now + 2.3 * i) * wob;
        let z = spr * Math.sin(i * 2.1) * H * 0.2 + bk * fz;

        if (st > 0) { // final stack
          const k = i - mid;
          x = mix(x, k * W * (nar ? 0.06 : 0.065), st);
          y = mix(y, k * H * (nar ? 0.07 : 0.075) + k * k * H * 0.012, st);
          r = mix(r, -24, st); tx = mix(tx, 0.9, st); ty = mix(ty, -0.35, st);
          sc = mix(sc, nar ? 1.05 : 1.25, st); z = mix(z, 0, st);
        }

        el.style.transform =
          `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${(y + rise * 0.9 * H).toFixed(1)}px,${z.toFixed(1)}px) ` +
          `rotateX(${(-tx).toFixed(3)}rad) rotateY(${ty.toFixed(3)}rad) ` +
          `rotateZ(${((r * Math.PI) / 180 - 0.3 * rise).toFixed(3)}rad) skewX(-6deg) scale(${sc.toFixed(3)})`;
        el.style.zIndex = st > 0.5 ? 10 + i : 10 - Math.round(Math.abs(d));
        sheens[i].style.backgroundPosition = `${(50 + ty * 70 - tx * 30).toFixed(1)}% 0`;
      });

      const enter = clamp01((window.innerHeight * 0.85 - track.getBoundingClientRect().top) / (window.innerHeight * 0.85));
      const g = easeIn3(between(P, 0, 0.12));
      layer.style.opacity = enter.toFixed(3);
      // Tunnel eases in as the hero leaves and eases out as the section hands over to the footer.
      const fadeIn = enter * enter * (3 - 2 * enter);
      tunnel.style.opacity = (fadeIn * (1 - 0.9 * between(P, 0.84, 0.14))).toFixed(3);
      const inn = 1 - enter; // 1 while the hero is still on screen, 0 once the deck has arrived
      intro.style.opacity = (1 - g) * enter * enter;
      intro.style.transform =
        `translateY(calc(${(-120 * g).toFixed(1)}% + ${(80 * inn).toFixed(1)}px)) scale(${((1 - 0.4 * g) * (1 - 0.12 * inn)).toFixed(3)})`;
      const blur = 10 * g + 10 * inn;
      intro.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : "";
      intro.style.visibility = g > 0.98 || enter < 0.02 ? "hidden" : "";
      hint.style.opacity = 1 - between(P, 0, 0.05);

      words.forEach((w, i) => {
        const v = easeOut4(between(P, 0.1 + 0.015 * i, 0.1));
        w.style.opacity = v;
        w.style.transform = `translateY(${(70 * (1 - v)).toFixed(1)}%)`;
      });
      copy.style.opacity = between(P, 0.08, 0.06) * (1 - between(P, 0.3, 0.1));

      const pv = between(P, STEP_START - 0.06, 0.06) * (1 - between(P, STEP_START + STEP_SPAN, 0.05));
      const av = between(P, 0.88, 0.07);
      ask.style.opacity = av;
      ask.style.pointerEvents = av > 0.5 ? "auto" : "none";
      panel.style.opacity = pv;
      panel.style.transform = `translateY(calc(-50% + ${(20 * (1 - pv)).toFixed(1)}px))`;
      panel.style.pointerEvents = pv > 0.5 ? "auto" : "none";

      const ai = Math.round(f);
      if (ai !== act) { act = ai; setActive(ai); }
    }

    function tick(ts) {
      raf = requestAnimationFrame(tick);
      const now = ts / 1000, dt = prev ? Math.min(0.05, now - prev) : 1 / 60;
      prev = now;
      if (!visible) return;
      if (born < 0) born = now;
      shown = still ? target : shown + (target - shown) * (1 - Math.exp(-dt * 6));
      if (Math.abs(target - shown) < 0.0002) shown = target;
      const fl = 1 - Math.pow(0.002, dt);
      ease.x += (ptr.x - ease.x) * fl;
      ease.y += (ptr.y - ease.y) * fl;
      render(now);
    }

    const onScroll = () => { target = progress(); };
    const onResize = () => { measure(); target = progress(); };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      ptr = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
    };
    const onLeave = () => { ptr = { x: 0, y: 0 }; };

    measure();
    target = shown = progress();
    render(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    const stopVis = observeVisibility(track, (v) => { visible = v; });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stopVis();
    };
  }, [trackRef]);

  const handleNext = (i) => {
    if (i < STEPS.length - 1) onSelectStep(i + 1);
    else scrollToTrack(trackRef.current, 0.93);
  };

  return (
    <div id="track" ref={trackRef} style={{ height: "900svh" }}>
      <div id="stage" ref={stageRef}>
        <div className="deck-tunnel" ref={tunnelRef} aria-hidden="true">
        <LightTunnel
          lightMode={!dark}
          cableColor={dark ? "#ffffff" : "#14161f"}
          pulseColor={dark ? "#ffffff" : "#2f6bff"}
          tunnelColor={dark ? "#ffffff" : "#14161f"}
          cableCount={56}
          pulseDensity={0.5}
          flowDirection="inward"
          tunnelOpacity={0}
          speed={0.1}
          pulseSpeed={2}
          pulseLength={0.28}
          pulseBlend={0.6}
          pulseWidth={1}
          thickness={0.35}
          rimWidth={0.15}
          waviness={0.3}
          sway={0.5}
          bend={0.4}
          glow={1}
          size={1}
          fadeNear={0.5}
          fadeFar={2}
          brightness={1}
          colorVariance
          grain={false}
          mouseInteraction
          mouseStrength={0.1}
          clickSurge
          intro
        />
        </div>
        <div id="intro" ref={introRef}>
          <h1 className="techtext-title">
            <TechText
              text="Mail to Telegram"
              fontWeight={700}
              fontSize={150}
              letterSpacing={-0.05}
              reveal="letter"
              lineStyle="dashed"
              dashLength={4}
              dashGap={2}
              strokeWidth={1.5}
              specks={15}
              reach={200}
              softness={0.7}
              speed={1}
              bounce={0.4}
              intro="none"
              introDuration={2}
              guides={false}
              align="center"
              selection
              labels
              draggable
              clickKick
              sweep
            />
          </h1>
          <p>Your Gmail as Telegram DMs. Free, no server, about 10 minutes.</p>
        </div>

        <div id="copy" ref={copyRef}>
          <h2>
            {HEADLINE.map((word, i) => (
              <Fragment key={i}>
                <span ref={(el) => { wordsRef.current[i] = el; }}>{word}</span>{" "}
              </Fragment>
            ))}
          </h2>
          <p>Tap a card or keep scrolling.</p>
        </div>

        <StepPanel panelRef={panelRef} active={active} onNext={handleNext} />
        <ScriptViewer open={!!STEPS[active].showScript} />

        <div id="ask" ref={askRef}>
          <h2>Questions?<br /><i>Just ask.</i></h2>
          <p>Message me on X or LinkedIn and I’ll help you get it running.</p>
          <div className="hb">
            <a className="cta" href={X_URL} target="_blank" rel="noopener noreferrer">X @adisdtechie</a>
            <a className="ghost" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>

        <div id="layer" ref={layerRef}>
          {STEPS.map((step, i) => (
            <Card
              key={step.name}
              step={step}
              index={i}
              onSelect={onSelectStep}
              cardRef={(el) => { cardsRef.current[i] = el; }}
              sheenRef={(el) => { sheensRef.current[i] = el; }}
            />
          ))}
        </div>

        <div id="hint" ref={hintRef} aria-hidden="true"><b>Scroll</b><i /></div>
      </div>
    </div>
  );
}
