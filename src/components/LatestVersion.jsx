import { useMemo } from "react";
import { ArrowRight, Reply } from "../icons";
import { SCRIPT } from "../data";
import { parseScript } from "../lib/scriptInfo";
import { timeAgo, useLatestScript } from "../lib/useLatestScript";

/** Version, what's new and the chat commands, read live from the script on GitHub. Sits just above the footer. */
export default function LatestVersion() {
  const s = useLatestScript();
  const info = useMemo(() => (s.status === "ready" ? parseScript(s.code) : null), [s.status, s.code]);
  const typed = info?.commands.typed || [];

  return (
    <section className="sec latest" aria-label="Latest version">
      <div className="livebox">
        <div className="live-v">
          <b>{s.version ? `Version ${s.version}` : s.status === "error" ? "Latest version" : "Checking…"}</b>
          <small>
            {s.date ? `Updated ${timeAgo(s.date)}. ` : ""}The bot tells you in Telegram when there’s a new one.
          </small>
        </div>
        <div className="live-n">
          <span className="k">What’s new</span>
          <p>{s.notes || (s.status === "error" ? "Couldn’t reach GitHub right now." : "Loading…")}</p>
        </div>
        <div className="live-c">
          <span className="k">Type in your bot chat</span>
          <div className="chips">
            {(typed.length ? typed.flatMap((c) => c.words.slice(0, 1)) : ["help", "send email", "summarize"]).map((w) => <code key={w}>{w}</code>)}
            <span className="chip-s"><Reply /> or swipe-reply any email</span>
          </div>
        </div>
        <a className="live-a" href={SCRIPT.view} target="_blank" rel="noopener noreferrer">
          See the code <ArrowRight />
        </a>
      </div>
    </section>
  );
}
