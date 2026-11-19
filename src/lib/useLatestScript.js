import { useEffect, useState } from "react";
import { SCRIPT } from "../data";

/*
 * Fetches the newest Apps Script from GitHub: the code, script/version.json (version + notes,
 * the same file the script checks), and the last commit date. Fetched once per page load and
 * shared by every component that asks. "updated" is true when this visitor copied an older version.
 */

const COPIED_KEY = "scriptCopiedVersion";
const listeners = new Set();
let request = null;
let snapshot = { status: "loading" };

/** True when version a is newer than b ("1.2.0" > "1.1.9"). Mirrors isNewer() in the script. */
export function isNewer(a, b) {
  const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const p = x[i] || 0, q = y[i] || 0;
    if (p !== q) return p > q;
  }
  return false;
}

const readCopied = () => {
  try { return localStorage.getItem(COPIED_KEY); } catch { return null; }
};

const withUpdated = (data) => {
  const copied = readCopied();
  return { ...data, copied, updated: !!(data.version && copied && isNewer(data.version, copied)) };
};

const publish = (next) => {
  snapshot = next;
  listeners.forEach((fn) => fn(next));
};

const json = (url) => fetch(url, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

function load() {
  if (request) return request;
  request = Promise.all([
    fetch(SCRIPT.raw, { cache: "no-cache" }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    }),
    json(SCRIPT.version),
    json(SCRIPT.commits), // only for the "updated 2 days ago" date; fine if rate-limited
  ]).then(
    ([code, info, commits]) => {
      // version.json wins; fall back to the VERSION constant inside the code
      const version = info?.version || code.match(/const VERSION = "([^"]+)"/)?.[1] || null;
      const c = Array.isArray(commits) ? commits[0] : null;
      publish(withUpdated({
        status: "ready",
        code,
        version,
        notes: info?.notes || "",
        date: c ? c.commit.committer.date : null,
      }));
    },
    () => {
      request = null; // allow a retry on next mount
      publish({ status: "error" });
    }
  );
  return request;
}

export function useLatestScript() {
  const [state, setState] = useState(snapshot);
  useEffect(() => {
    listeners.add(setState);
    load();
    setState(snapshot);
    return () => listeners.delete(setState);
  }, []);
  return state;
}

/** Remember that this visitor now has the live version (call after copying). */
export function markCopied() {
  if (snapshot.status !== "ready" || !snapshot.version) return;
  try { localStorage.setItem(COPIED_KEY, snapshot.version); } catch { /* storage blocked */ }
  publish(withUpdated(snapshot));
}

const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
/** "3 days ago" style label for an ISO date. */
export function timeAgo(iso) {
  const secs = (new Date(iso).getTime() - Date.now()) / 1000;
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(secs) >= size) return fmt.format(Math.round(secs / size), unit);
  }
  return "just now";
}
