import { useEffect, useMemo, useState } from "react";
import { SCRIPT } from "../data";
import { markCopied, timeAgo, useLatestScript } from "../lib/useLatestScript";

// Minimal JS highlighter: comments, strings, keywords, numbers.
const TOKENS = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|try|catch|finally|new|true|false|null|of|in|throw|break|continue)\b|\b(\d+(?:\.\d+)?)\b/g;
const KIND = ["", "cm", "st", "kw", "nu"];

function highlight(code) {
  const out = [];
  let last = 0, m, k = 0;
  TOKENS.lastIndex = 0;
  while ((m = TOKENS.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const kind = KIND[m.slice(1).findIndex(Boolean) + 1];
    out.push(<span key={k++} className={kind}>{m[0]}</span>);
    last = TOKENS.lastIndex;
  }
  out.push(code.slice(last));
  return out;
}

/** Copies the live script; says "new version" when the visitor's copy is out of date. */
export function CopyScriptButton({ label = "Copy script", className = "pab" }) {
  const s = useLatestScript();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(t);
  }, [done]);
  const ready = s.status === "ready";
  const copy = async () => {
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(s.code);
      markCopied();
      setDone(true);
    } catch {
      window.open(SCRIPT.view, "_blank", "noopener");
    }
  };
  const text = done ? "Copied ✓" : !ready ? (s.status === "error" ? "Unavailable" : "Loading…") : s.updated ? "Copy the new version" : label;
  return <button type="button" className={className} onClick={copy} disabled={!ready}>{text}</button>;
}

/** Code window shown beside the panel while the Copy step is active. */
export default function ScriptViewer({ open }) {
  const s = useLatestScript();
  const code = s.status === "ready" ? s.code.replace(/\s+$/, "") : "";
  const lines = useMemo(() => (code ? code.split("\n").length : 0), [code]);
  const body = useMemo(() => (code ? highlight(code) : null), [code]);

  return (
    <aside className={`sv${open ? " on" : ""}`} aria-label="Apps Script code" aria-hidden={!open} {...(!open && { inert: "" })}>
      <header className="sv-h">
        <span className="sv-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="sv-f">Code.gs</span>
        {s.status === "ready" && s.version && (
          <span className={`sv-u${s.updated ? " new" : ""}`}>
            {s.updated
              ? `v${s.version} is out · you copied v${s.copied}`
              : `v${s.version} · latest${s.date ? ` · updated ${timeAgo(s.date)}` : ""}`}
          </span>
        )}
        <CopyScriptButton className="sv-c" />
      </header>
      <div className="sv-b" data-lenis-prevent>
        {s.status === "loading" && <p className="sv-m">Loading the latest script…</p>}
        {s.status === "error" && (
          <p className="sv-m">Couldn’t load the script. <a href={SCRIPT.view} target="_blank" rel="noopener noreferrer">Open it on GitHub ↗</a></p>
        )}
        {body && (
          <pre className="sv-code">
            <span className="sv-n" aria-hidden="true">{Array.from({ length: lines }, (_, i) => i + 1).join("\n")}</span>
            <code>{body}</code>
          </pre>
        )}
      </div>
      <footer className="sv-ft">
        <span>{s.status === "ready" && s.notes ? `What’s new: ${s.notes}` : "Pulled live from GitHub"}</span>
        <a href={SCRIPT.view} target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>
      </footer>
    </aside>
  );
}

/** Pops up once per new version for visitors whose copied script is out of date. */
export function UpdateToast({ onOpen }) {
  const s = useLatestScript();
  const sha = s.status === "ready" ? s.version || "" : "";
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem("toastClosed") || ""; } catch { return ""; }
  });
  if (!s.updated || hidden === sha) return null;
  const close = () => {
    setHidden(sha);
    try { sessionStorage.setItem("toastClosed", sha); } catch { /* ignore */ }
  };
  return (
    <div className="toast" role="status">
      <b>Mail to Telegram v{s.version} is out</b>
      <span>{s.notes || `You copied v${s.copied}.`}</span>
      <div className="toast-a">
        <button type="button" className="toast-go" onClick={() => { onOpen(); close(); }}>Get the new version</button>
        <button type="button" className="toast-x" onClick={close} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}
