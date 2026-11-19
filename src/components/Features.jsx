import { useEffect, useMemo, useRef, useState } from "react";
import { SCRIPT, STEPS } from "../data";
import { parseScript } from "../lib/scriptInfo";
import { timeAgo, useLatestScript } from "../lib/useLatestScript";
import { useDarkMode } from "../lib/useDarkMode";
import Crosshair from "./Crosshair";

/*
 * "Everything the script does" as a one-screen bento grid (stacks on phones).
 * All content is read live from script/Code.gs and script/version.json on GitHub.
 */

const SEEN_KEY = "scriptSeenItems";
/** Remembers what this visitor has seen, so anything added in a later version is marked "New". */
function useNewItems(ids) {
  const [fresh, setFresh] = useState(() => new Set());
  const key = ids.join("|");
  useEffect(() => {
    if (!ids.length) return;
    let seen = null;
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "null"); } catch { /* ignore */ }
    if (Array.isArray(seen)) setFresh(new Set(ids.filter((id) => !seen.includes(id))));
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)); } catch { /* storage blocked */ }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return fresh;
}

/** Fades the tiles in as the section scrolls into view. */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { el?.classList.add("in"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const New = () => <span className="ft-new">New</span>;
const LOGO = "/favicon.svg";

export default function Features() {
  const s = useLatestScript();
  const info = useMemo(() => (s.status === "ready" ? parseScript(s.code) : null), [s.status, s.code]);
  const features = info?.features || [];
  const commands = info ? [...info.commands.typed.map((c) => ({ ...c, kind: "type" })), ...info.commands.swipe.map((c) => ({ ...c, kind: "swipe" }))] : [];
  const functions = info?.functions || [];
  const ids = [
    ...features.map((f) => "f:" + f.id),
    ...commands.map((c) => "c:" + c.id),
    ...functions.map((f) => "fn:" + f.id),
  ];
  const fresh = useNewItems(ids);
  const newCount = features.filter((f) => fresh.has("f:" + f.id)).length;
  const ref = useReveal();
  const dark = useDarkMode();
  const loading = s.status === "loading" ? "Loading the latest script…" : null;
  const failed = s.status === "error";

  return (
    <section className="feats" id="features" ref={ref}>
      <Crosshair
        containerRef={ref}
        color={dark ? "#ffffff" : "#14161f"}
        targetEffect="lock"
        thickness={1}
        opacity={0.85}
        smoothing={0.35}
        showCoordinates
        lineStyle="solid"
        blendMode="normal"
        gap={0}
        fade={0}
        clickPulse
        hideCursor={false}
        style={{ zIndex: 5 }}
      />

      <div className="bento">
        {/* brand */}
        <div className="tile t-brand solid" data-crosshair-target style={{ "--d": "0ms" }}>
          <img src={LOGO} alt="" width="56" height="56" />
          <div>
            <b>Mail to Telegram</b>
            <span>{s.version ? `v${s.version}` : "Live"} · free · no server</span>
          </div>
        </div>

        {/* what's new + phone */}
        <div className="tile t-news soft" data-crosshair-target style={{ "--d": "60ms" }}>
          <div className="t-news-copy">
            <span className="k">{s.version ? `What’s new in v${s.version}` : "What’s new"}</span>
            <p>{failed ? "Couldn’t reach GitHub right now." : s.notes || loading || "Every update shows up here."}</p>
            {s.date && <small>Updated {timeAgo(s.date)}</small>}
          </div>
          <div className="phone" aria-hidden="true">
            <div className="phone-notch" />
            <div className="bub">📧 <b>Your verification code</b><br />Acme · 9:41 AM</div>
            <div className="bub">🔑 OTP <b className="mono">482913</b></div>
            <div className="bub me">summarize</div>
            <div className="bub">⏰ <b>Reminder:</b> Interview, 3:00 PM</div>
          </div>
        </div>

        {/* functions (tall, scrolls inside) */}
        <div className="tile t-fns soft" style={{ "--d": "120ms" }}>
          <span className="k">Run in Apps Script</span>
          <p className="hint">Pick it next to <b>Run</b>, then press Run.</p>
          <ul className="fns" data-lenis-prevent>
            {functions.map((f) => (
              <li key={f.id} data-crosshair-target>
                <code>{f.name}</code>
                <span>{f.desc}{fresh.has("fn:" + f.id) && <New />}</span>
              </li>
            ))}
            {!functions.length && <li className="muted">{loading || "See the script on GitHub."}</li>}
          </ul>
        </div>

        {/* stat: features */}
        <div className="tile t-stat soft" data-crosshair-target style={{ "--d": "180ms" }}>
          <span className="k">Things it does</span>
          <strong>{features.length || "–"}</strong>
          <em className={newCount ? "up" : ""}>{newCount ? `+${newCount} new since your last visit` : "and counting"}</em>
        </div>

        {/* stat: setup time */}
        <a className="tile t-time soft" href="#track" data-crosshair-target style={{ "--d": "240ms" }}>
          <div className="t-time-top">
            <strong>10<small>min</small></strong>
            <span className="arrow" aria-hidden="true">↗</span>
          </div>
          <span className="k">to set up, in {STEPS.length} cards</span>
          <div className="dots" aria-hidden="true">
            {STEPS.slice(0, 5).map((st) => <i key={st.name} style={{ background: `linear-gradient(160deg,${st.colors[0]},${st.colors[1]})` }}>{st.icon}</i>)}
            <i className="more">+{Math.max(0, STEPS.length - 5)}</i>
          </div>
        </a>

        {/* headline (tall) */}
        <div className="tile t-head pale" style={{ "--d": "300ms" }}>
          <span className="k">Everything the script does</span>
          <h2>One script.<br /><i>Everything in your chat.</i></h2>
          <svg className="star" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="starg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8f7bff" /><stop offset="1" stopColor="#3b22c9" />
              </linearGradient>
            </defs>
            <g fill="url(#starg)">
              {[0, 45, 90, 135].map((a) => <rect key={a} x="84" y="18" width="32" height="164" rx="16" transform={`rotate(${a} 100 100)`} />)}
            </g>
            <circle cx="100" cy="100" r="22" fill="#2a1796" opacity=".35" />
          </svg>
        </div>

        {/* features (wide, waves) */}
        <div className="tile t-feats solid" style={{ "--d": "360ms" }}>
          <svg className="waves" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 120 C100 60 180 160 300 110 S500 60 600 100 V200 H0Z" fill="rgba(255,255,255,.10)" />
            <path d="M0 150 C120 100 200 180 320 140 S520 110 600 140 V200 H0Z" fill="rgba(255,255,255,.12)" />
            <path d="M0 175 C140 150 240 200 360 170 S540 160 600 175 V200 H0Z" fill="rgba(255,255,255,.14)" />
          </svg>
          <span className="k">What it does</span>
          <ul className="flist">
            {features.map((f) => (
              <li key={f.id} data-crosshair-target title={f.detail ? `${f.title} (${f.detail})` : f.title}>
                {f.title}{fresh.has("f:" + f.id) && <New />}
              </li>
            ))}
            {!features.length && <li>{loading || <a href={SCRIPT.view}>See the script on GitHub ↗</a>}</li>}
          </ul>
        </div>

        {/* commands (donut) */}
        <div className="tile t-cmds solid" style={{ "--d": "420ms" }}>
          <svg className="donut" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="20" />
            <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="20" strokeDasharray="180 264" transform="rotate(-90 60 60)" />
          </svg>
          <span className="k">Say it in your bot chat</span>
          <ul className="clist" data-lenis-prevent>
            {commands.map((c) => (
              <li key={c.id} data-crosshair-target>
                <span className="w">{c.words.slice(0, 2).map((w) => (c.free ? <em key={w}>{w}</em> : <code key={w}>{w}</code>))}</span>
                <span className="d">{c.kind === "swipe" ? "↩ " : ""}{c.desc}{fresh.has("c:" + c.id) && <New />}</span>
              </li>
            ))}
            {!commands.length && <li>{loading || "—"}</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
