import { useEffect, useMemo, useRef, useState } from "react";
import { SCRIPT, STEPS } from "../data";
import { parseScript } from "../lib/scriptInfo";
import { timeAgo, useLatestScript } from "../lib/useLatestScript";
import { useDarkMode } from "../lib/useDarkMode";
import Crosshair from "./Crosshair";

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

/** Fades children in as the section scrolls into view. */
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

export default function Features() {
  const s = useLatestScript();
  const info = useMemo(() => (s.status === "ready" ? parseScript(s.code) : null), [s.status, s.code]);
  const ids = info ? [
    ...info.features.map((f) => "f:" + f.id),
    ...info.commands.typed.map((c) => "c:" + c.id),
    ...info.commands.swipe.map((c) => "c:" + c.id),
    ...info.functions.map((f) => "fn:" + f.id),
  ] : [];
  const fresh = useNewItems(ids);
  const ref = useReveal();
  const dark = useDarkMode();

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
      <header className="feats-h">
        <p className="feats-k">Everything the script does</p>
        <h2>One script.<br /><i>Everything in your chat.</i></h2>
        <div className="feats-v">
          {s.status === "ready" && s.version && (
            <span className="feats-pill"><b>v{s.version}</b>{s.date ? ` · updated ${timeAgo(s.date)}` : ""}</span>
          )}
          <span className="feats-live">Read live from the script on GitHub</span>
        </div>
      </header>

      {s.status === "loading" && <p className="feats-m">Loading what the latest script can do…</p>}
      {s.status === "error" && (
        <p className="feats-m">Couldn’t load the script right now. <a href={SCRIPT.view} target="_blank" rel="noopener noreferrer">See it on GitHub ↗</a></p>
      )}

      {info && (
        <>
          {s.notes && (
            <div className="feats-whats" data-crosshair-target>
              <span className="feats-whats-k">What’s new in v{s.version}</span>
              <p>{s.notes}</p>
            </div>
          )}

          <div className="feats-grid">
            {info.features.map((f, i) => {
              const [c0, c1] = STEPS[i % STEPS.length].colors;
              return (
                <article key={f.id} className="feat" data-crosshair-target style={{ "--d": `${i * 60}ms`, "--c0": c0, "--c1": c1 }}>
                  <h3>{f.title}{fresh.has("f:" + f.id) && <New />}</h3>
                  {f.detail && <p>{f.detail.charAt(0).toUpperCase() + f.detail.slice(1)}.</p>}
                </article>
              );
            })}
          </div>

          <div className="feats-cols">
            <div className="feats-card">
              <h3>Type in your bot chat</h3>
              <ul className="cmds">
                {info.commands.typed.map((c) => (
                  <li key={c.id} data-crosshair-target>
                    <span className="cmd-w">{c.words.map((w) => <code key={w}>{w}</code>)}</span>
                    <span>{c.desc}{fresh.has("c:" + c.id) && <New />}</span>
                  </li>
                ))}
              </ul>
              <h3 className="sub">Swipe-reply to an email</h3>
              <ul className="cmds">
                {info.commands.swipe.map((c) => (
                  <li key={c.id} data-crosshair-target>
                    <span className="cmd-w">{c.words.map((w) => (c.free ? <em key={w}>{w}</em> : <code key={w}>{w}</code>))}</span>
                    <span>{c.desc}{fresh.has("c:" + c.id) && <New />}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="feats-card">
              <h3>Run in Apps Script</h3>
              <p className="feats-hint">Pick the function next to <b>Run</b> in the editor, then press Run.</p>
              <ul className="fns">
                {info.functions.map((f) => (
                  <li key={f.id} data-crosshair-target>
                    <code>{f.name}</code>
                    <span>{f.desc}{fresh.has("fn:" + f.id) && <New />}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
