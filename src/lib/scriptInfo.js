/*
 * Reads what the Apps Script can do straight from its source, so the site stays in step
 * with every pushed version:
 *  - features:  the "- ..." bullets in the header comment at the top of Code.gs
 *  - commands:  the "Type on its own" and "Swipe-reply" lists inside helpText()
 *  - functions: no-argument functions people run from the Apps Script editor
 */

// Plain-language descriptions for functions people run by hand. Anything new that isn't
// listed here still shows up, using the comment line above it in the script.
const KNOWN_FUNCTIONS = {
  setupTrigger: "Switches forwarding on (runs every minute) and saves your settings. Run once after setup or after changing settings.",
  saveSettings: "Saves your token, chat ID and keys inside the project so future updates can be pasted without retyping them.",
  testSend: "Sends a test message to your Telegram to check the bot token and chat ID.",
  testUpdate: "Checks GitHub for a newer version of the script right now.",
  testCall: "Places a test phone call through CallMeBot (needs CALL_ENABLED: true).",
  testMeetingCall: "Fakes a meeting 11 minutes away: you get a reminder in about a minute, plus a call if calls are on.",
  setupWebhook: "Turns on instant replies. Deploy the project as a Web app first (Deploy, New deployment, Web app), then run this once.",
  removeWebhook: "Turns instant replies off again and goes back to checking once a minute.",
  testCompose: "Shows the send-email form with its Fill it in and Copy buttons, as if you typed send email.",
};

const RUNNABLE = /^(setup|save|test|debug|remove)/;

const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function parseFeatures(code) {
  const header = code.match(/\/\*\*([\s\S]*?)\*\//);
  if (!header) return [];
  return header[1]
    .split("\n")
    .map((line) => line.match(/^\s*\*\s*-\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((m) => {
      const text = m[1];
      const paren = text.match(/^(.*?)\s*\((.+)\)\s*$/);
      return paren ? { id: text, title: paren[1], detail: paren[2] } : { id: text, title: text, detail: "" };
    });
}

/** Rebuilds helpText()'s message from its string literals and splits it into sections. */
function parseCommands(code) {
  const fn = code.match(/function helpText\(\)\s*\{([\s\S]*?)\n\}/);
  if (!fn) return { typed: [], swipe: [] };
  const text = [...fn[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]).join("");
  const sections = {};
  let current = null;
  for (const raw of text.split("\\n")) {
    const line = raw.trim();
    const head = line.match(/^<b>(.+?)<\/b>$/);
    if (head) { current = head[1].toLowerCase(); sections[current] = []; continue; }
    if (current && line.startsWith("•")) {
      const codes = [...line.matchAll(/<code>(.+?)<\/code>/g)].map((m) => m[1]);
      let desc = stripTags(line.replace(/^•\s*/, "").replace(/(<code>.+?<\/code>,?\s*)+:?\s*/, "")).replace(/^:\s*/, "");
      let words = codes;
      if (!words.length && desc.includes(":")) {          // e.g. "anything else: sent back as your reply"
        words = [desc.slice(0, desc.indexOf(":")).trim()];
        desc = desc.slice(desc.indexOf(":") + 1).trim();
      }
      if (/^this list$/i.test(desc)) desc = "lists everything the bot understands";
      sections[current].push({ id: `${current}:${words.join(",") || desc}`, words, free: !codes.length, desc: desc.charAt(0).toUpperCase() + desc.slice(1) });
    }
  }
  const pick = (re) => Object.entries(sections).find(([k]) => re.test(k))?.[1] || [];
  return { typed: pick(/type|own/), swipe: pick(/swipe|reply/) };
}

function parseFunctions(code) {
  const out = [];
  const re = /(?:^|\n)((?:\/\/[^\n]*\n)*)function\s+(\w+)\s*\(\s*\)/g;
  let m;
  while ((m = re.exec(code))) {
    const name = m[2];
    if (!RUNNABLE.test(name) && !KNOWN_FUNCTIONS[name]) continue;
    const comment = m[1].split("\n").map((l) => l.replace(/^\/\/\s?/, "").trim()).filter((l) => l && !/^=+/.test(l)).pop();
    out.push({ id: name, name, desc: KNOWN_FUNCTIONS[name] || comment || "Run it from the Apps Script editor." });
  }
  // setup first, tests after, in the order people need them
  const rank = (n) => (n === "setupTrigger" ? 0 : n.startsWith("save") ? 1 : n.startsWith("setup") ? 2 : n.startsWith("remove") ? 3 : n.startsWith("test") ? 4 : 5);
  return out.sort((a, b) => rank(a.name) - rank(b.name));
}

export function parseScript(code) {
  return { features: parseFeatures(code), commands: parseCommands(code), functions: parseFunctions(code) };
}
