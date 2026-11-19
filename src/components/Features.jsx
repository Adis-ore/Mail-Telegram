import { useEffect, useMemo, useRef, useState } from "react";
import { SCRIPT, STEPS } from "../data";
import { parseScript } from "../lib/scriptInfo";
import { timeAgo, useLatestScript } from "../lib/useLatestScript";

const SEEN_KEY = "scriptSeenItems";
const ico = (d) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
// Pick an icon from what the feature talks about; anything unknown gets a sparkle.
const ICONS = [
  [/forward|gmail|mail to telegram/i, ico(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)],
  [/otp|code/i, ico(<><circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 8.2-8.2M17 6l2 2M15 8l2 2" /></>)],
  [/summar|shorten/i, ico(<><path d="M4 6h16M4 12h10M4 18h7" /></>)],
  [/swipe|reply/i, ico(<><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v5" /></>)],
  [/send email|form|compose/i, ico(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>)],
  [/remind|call|date/i, ico(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M5 3 2 6M19 3l3 3" /></>)],
  [/version|update/i, ico(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>)],
];
const SPARKLE = ico(<path d="M12 3c.5 4.5 2.5 6.5 9 9-6.5 2.5-8.5 4.5-9 9-.5-4.5-2.5-6.5-9-9 6.5-2.5 8.5-4.5 9-9Z" />);
const iconFor = (text) => (ICONS.find(([re]) => re.test(text)) || [null, SPARKLE])[1];

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

  return (
    <section className="feats" id="features" ref={ref}>
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
            <div className="feats-whats">
              <span className="feats-whats-k">What’s new in v{s.version}</span>
              <p>{s.notes}</p>
            </div>
          )}

          <div className="feats-grid">
            {info.features.map((f, i) => {
              const [c0, c1] = STEPS[i % STEPS.length].colors;
              return (
                <article key={f.id} className="feat" style={{ "--d": `${i * 60}ms`, "--c0": c0, "--c1": c1 }}>
                  <span className="feat-i">{iconFor(f.title + " " + f.detail)}</span>
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
                  <li key={c.id}>
                    <span className="cmd-w">{c.words.map((w) => <code key={w}>{w}</code>)}</span>
                    <span>{c.desc}{fresh.has("c:" + c.id) && <New />}</span>
                  </li>
                ))}
              </ul>
              <h3 className="sub">Swipe-reply to an email</h3>
              <ul className="cmds">
                {info.commands.swipe.map((c) => (
                  <li key={c.id}>
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
                  <li key={f.id}>
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
