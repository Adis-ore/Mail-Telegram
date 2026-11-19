/**
 * Mail to Telegram  (see VERSION below)
 * - Forwards new Gmail to Telegram (full body, bold time)
 * - OTP codes are bold and tap-to-copy
 * - Swipe-reply "summarize" or "shorten" for a short summary
 * - Any other swipe-reply is emailed back (blocked for no-reply senders)
 * - Type "send email" to get a form, fill it in, and it sends
 * - Reminders (and optional calls) for emails with a date and time
 * - Tells you in Telegram when a new version of this script is out
 * Never commit your real tokens or keys to GitHub.
 */

const VERSION = "1.0.0";

// ================= SETTINGS =================
const CONFIG = {
  BOT_TOKEN: "PASTE_YOUR_BOT_TOKEN_HERE",
  CHAT_ID: "PASTE_YOUR_CHAT_ID_HERE",
  SEARCH: "in:inbox category:primary",   // "in:inbox" for all inbox mail
  MAX_PER_RUN: 10,
  MAX_BODY: 12000,
  LONG_HINT_AT: 800,                     // add a "reply summarize" hint above this length
  SIGNATURE: "",                         // optional text added to emails you send

  // Summaries
  SUMMARY_WORDS: ["summarize", "summarise", "shorten", "summary", "tldr", "sum"],
  GEMINI_API_KEY: "",                    // optional free key from aistudio.google.com. Empty = built-in summary
  GEMINI_MODEL: "gemini-2.5-flash",      // use a current "flash" name from AI Studio if this stops working
  SUMMARY_SENTENCES: 4,                  // for the built-in summary

  // Reminders and calls
  REMIND_BEFORE_MIN: [60, 10],
  CALL_ENABLED: false,                   // true after you send /start to @CallMeBot_txtbot
  CALL_AT_MIN: 10,                       // which reminder also triggers a call
  CALLMEBOT_USER: "@your_telegram_username",

  // Update alerts
  UPDATE_CHECK: true,
  UPDATE_CHECK_HOURS: 6,
  UPDATE_URL: "https://raw.githubusercontent.com/Adis-ore/Mail-Telegram/main/script/version.json",
  UPDATE_PAGE: "https://github.com/Adis-ore/Mail-Telegram/blob/main/script/Code.gs"
};

// Settings saved by saveSettings() survive when you paste a newer version over this file
const SAVED_KEYS = ["BOT_TOKEN", "CHAT_ID", "GEMINI_API_KEY", "CALLMEBOT_USER", "SIGNATURE"];
(function loadSaved() {
  const p = PropertiesService.getScriptProperties().getProperties();
  SAVED_KEYS.forEach(k => { if (p["CFG_" + k]) CONFIG[k] = p["CFG_" + k]; });
})();

function saveSettings() {
  const p = PropertiesService.getScriptProperties();
  SAVED_KEYS.forEach(k => {
    const v = String(CONFIG[k] || "");
    if (v && !/^PASTE_|^@your_/.test(v)) p.setProperty("CFG_" + k, v);
  });
  Logger.log("Settings saved. You can paste newer versions of the script over this one without retyping them.");
}

// ================= MAIN LOOP (runs every minute) =================
function tick() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    try { checkMail(); } catch (e) { console.error("checkMail", e); }
    try { pollReplies(); } catch (e) { console.error("pollReplies", e); }
    try { checkReminders(); } catch (e) { console.error("checkReminders", e); }
    try { checkUpdate(); } catch (e) { console.error("checkUpdate", e); }
  } finally {
    lock.releaseLock();
  }
}

// ================= 1. NEW MAIL -> TELEGRAM =================
function checkMail() {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty("LAST_TS");
  if (!stored) { props.setProperty("LAST_TS", String(Date.now())); return; }

  const last = Number(stored);
  const me = Session.getEffectiveUser().getEmail().toLowerCase();
  const threads = GmailApp.search(
    `${CONFIG.SEARCH} after:${Math.floor(last / 1000) - 120}`, 0, 20);

  const items = [];
  threads.forEach(th => th.getMessages().forEach(m => {
    if (m.getDate().getTime() > last) items.push({ m: m, th: th });
  }));
  items.sort((a, b) => a.m.getDate() - b.m.getDate());

  for (const item of items.slice(0, CONFIG.MAX_PER_RUN)) {
    const m = item.m;
    if (m.getFrom().toLowerCase().indexOf(me) === -1) {   // skip my own sent mail
      const ids = forward(m);
      if (!ids) return;                                    // Telegram failed: retry next minute
      remember(ids, { t: item.th.getId(), m: m.getId(), nr: isNoReply(m) });
      scanForEvent(m);
    }
    props.setProperty("LAST_TS", String(m.getDate().getTime()));
  }
}

function forward(msg) {
  const tz = Session.getScriptTimeZone();
  const when = Utilities.formatDate(msg.getDate(), tz, "EEE, d MMM yyyy, h:mm a");
  const subject = msg.getSubject() || "(no subject)";
  const body = cleanBody(msg);
  const otps = findOtps(subject + "\n" + body);

  let header =
    "📧 <b>" + esc(subject) + "</b>\n" +
    "👤 " + esc(msg.getFrom()) + "\n" +
    "🕒 <b>" + when + "</b>\n";
  if (isNoReply(msg)) header += "🚫 No-reply sender\n";
  if (otps.length) header += "🔑 OTP: " + otps.map(o => "<b><code>" + esc(o) + "</code></b>").join("   ") + "\n";
  header += "\n";

  const shown = body.length > CONFIG.MAX_BODY ? body.slice(0, CONFIG.MAX_BODY) + "\n\n… (truncated)" : body;
  const parts = chunk(shown, 3500);
  const ids = [];
  for (let i = 0; i < parts.length; i++) {
    let text = markOtps(esc(parts[i]), otps);
    if (i === parts.length - 1 && body.length > CONFIG.LONG_HINT_AT) {
      text += "\n\n<i>Reply “summarize” for a short version.</i>";
    }
    const id = sendTelegram((i === 0 ? header : "") + text);
    if (!id) return ids.length ? ids : null;
    ids.push(id);
  }
  return ids;
}

function cleanBody(msg) {
  return msg.getPlainBody().replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ================= OTP DETECTION =================
function findOtps(text) {
  const found = [];
  const add = (v, skipYears) => {
    v = String(v).trim();
    if (skipYears && /^(19|20)\d\d$/.test(v)) return;
    if (v && found.indexOf(v) === -1) found.push(v);
  };
  const code = "(\\d{3}[- ]?\\d{3}|\\d{4,8})";
  const kw = "(?:otp|one[- ]?time|verification|verify|security|login|log[- ]?in|sign[- ]?in|confirmation|passcode|pin|code)";
  let re = new RegExp(kw + "[^\\d\\n]{0,40}" + code + "\\b", "ig"), m;
  while ((m = re.exec(text))) add(m[1], false);
  re = new RegExp("\\b" + code + "\\b[^\\n.]{0,30}" + kw, "ig");
  while ((m = re.exec(text))) add(m[1], true);
  return found.slice(0, 3);
}

function markOtps(html, otps) {
  otps.forEach(o => {
    const e = esc(o);
    html = html.split(e).join("<b><code>" + e + "</code></b>");
  });
  return html;
}

// ================= NO-REPLY DETECTION =================
const NOREPLY_RE = /(no[-_.]?reply|do[-_.]?not[-_.]?reply|donotreply|mailer-daemon|postmaster|bounce)/i;

function addrOf(s) {
  const m = String(s || "").match(/<([^>]+)>/);
  return (m ? m[1] : String(s || "")).trim().toLowerCase();
}

function isNoReply(msg) {
  return NOREPLY_RE.test(addrOf(msg.getFrom())) || NOREPLY_RE.test(addrOf(msg.getReplyTo()));
}

// ================= 2. TELEGRAM MESSAGES: COMMANDS, SUMMARY, REPLY =================
function remember(ids, ref, skipLast) {
  const props = PropertiesService.getScriptProperties();
  const map = JSON.parse(props.getProperty("MAP") || "{}");
  const packed = [ref.t, ref.m, ref.nr ? 1 : 0];
  ids.forEach(id => { map[id] = packed; });
  const keys = Object.keys(map);
  if (keys.length > 100) {
    keys.slice(0, keys.length - 100).forEach(k => delete map[k]);
  }
  props.setProperty("MAP", JSON.stringify(map));
  if (!skipLast) props.setProperty("LAST_REF", JSON.stringify(packed));
}

function refFrom(a) {
  if (!a) return null;
  if (typeof a === "string") return { t: a, m: null, nr: false };   // old format
  return { t: a[0], m: a[1], nr: !!a[2] };
}

function getMsg(ref) {
  if (ref.m) {
    try { return GmailApp.getMessageById(ref.m); } catch (e) {}
  }
  const th = GmailApp.getThreadById(ref.t);
  return th ? th.getMessages().pop() : null;
}

function pollReplies() {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty("TG_OFFSET");
  const res = tg("getUpdates", { offset: stored || 0, timeout: 0 });
  if (!res || !res.ok) return;

  // First run: skip anything sent before setup
  if (stored === null) {
    const n = res.result.length;
    props.setProperty("TG_OFFSET", n ? String(res.result[n - 1].update_id + 1) : "0");
    return;
  }

  const map = JSON.parse(props.getProperty("MAP") || "{}");
  let offset = Number(stored);

  res.result.forEach(u => {
    offset = u.update_id + 1;
    if (u.callback_query) { handleCallback(u.callback_query); return; }   // button taps

    const m = u.message;
    if (!m || !m.text || String(m.chat.id) !== String(CONFIG.CHAT_ID)) return; // only you

    const txt = m.text.trim();
    if (!m.reply_to_message) {
      if (/^\/?(help|commands|menu)(@\w+)?$/i.test(txt)) { sendTelegram(helpText()); return; }
      if (/^\/?(update|check update|version)(@\w+)?$/i.test(txt)) { checkUpdateNow(); return; }
      if (/^\/?(send email|send|compose|new email|email)(@\w+)?$/i.test(txt)) { sendTelegram(composeTemplate()); return; }
      if (/^(to|email)\s*:/i.test(txt)) { composeAndSend(txt); return; }
    }
    if (m.text.charAt(0) === "/") return;

    const word = txt.toLowerCase().replace(/[.!?]+$/, "");
    const wantsSummary = CONFIG.SUMMARY_WORDS.indexOf(word) !== -1;

    let ref = m.reply_to_message ? refFrom(map[m.reply_to_message.message_id]) : null;
    if (!ref && !m.reply_to_message && wantsSummary) {
      ref = refFrom(JSON.parse(props.getProperty("LAST_REF") || "null"));  // typed alone: latest email
    }
    if (!ref) {
      sendTelegram(m.reply_to_message
        ? "⚠️ I can't match that to an email (too old, or not an email message)."
        : "ℹ️ Type <b>help</b> to see what I can do.");
      return;
    }

    const gm = getMsg(ref);
    if (!gm) { sendTelegram("⚠️ Couldn't find that email."); return; }

    if (wantsSummary) {
      const id = sendTelegram(summaryFor(gm));
      if (id) remember([id], ref, true);            // you can reply to the summary too
      return;
    }

    if (ref.nr || isNoReply(gm)) {
      sendTelegram("🚫 That sender is a no-reply address, so nothing was sent.");
      return;
    }
    gm.reply(m.text);
    sendTelegram("✅ Reply sent to " + esc(addrOf(gm.getReplyTo() || gm.getFrom())));
  });

  props.setProperty("TG_OFFSET", String(offset));
}

function helpText() {
  return "<b>What I understand</b> (v" + VERSION + ")\n\n" +
    "<b>Type on its own</b>\n" +
    "• <code>send email</code>: get a form to fill in and send\n" +
    "• <code>summarize</code>: summary of the latest email\n" +
    "• <code>update</code>: check for a new version of this script\n" +
    "• <code>help</code>: this list\n\n" +
    "<b>Swipe-reply to an email</b>\n" +
    "• <code>summarize</code>, <code>shorten</code>, <code>summary</code>, <code>tldr</code>: short summary\n" +
    "• anything else: sent back as your reply (blocked for no-reply senders)\n\n" +
    "<b>Automatic</b>\n" +
    "• OTP codes are bold and tap-to-copy\n" +
    "• Meeting reminders " + CONFIG.REMIND_BEFORE_MIN.join(" and ") + " min before" +
    (CONFIG.CALL_ENABLED ? ", with a call at " + CONFIG.CALL_AT_MIN + " min" : "") + "\n" +
    "• A message here when a new script version is out";
}

// ================= 3. UPDATE ALERTS =================
function isNewer(a, b) {
  const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const p = x[i] || 0, q = y[i] || 0;
    if (p > q) return true;
    if (p < q) return false;
  }
  return false;
}

function fetchLatest() {
  try {
    const res = UrlFetchApp.fetch(CONFIG.UPDATE_URL + "?t=" + Date.now(), { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return null;
    const j = JSON.parse(res.getContentText());
    if (!j || !j.version) return null;
    return { version: String(j.version), notes: String(j.notes || ""), url: String(j.url || CONFIG.UPDATE_PAGE) };
  } catch (e) { console.error(e); return null; }
}

// Runs every minute but only contacts GitHub every UPDATE_CHECK_HOURS
function checkUpdate() {
  if (!CONFIG.UPDATE_CHECK) return;
  const p = PropertiesService.getScriptProperties(), now = Date.now();
  if (now - Number(p.getProperty("UPD_CHECKED") || 0) >= CONFIG.UPDATE_CHECK_HOURS * 3600000) {
    p.setProperty("UPD_CHECKED", String(now));
    const fresh = fetchLatest();
    if (fresh) p.setProperty("UPD_INFO", JSON.stringify(fresh));
  }
  const info = JSON.parse(p.getProperty("UPD_INFO") || "null");
  if (!info || !isNewer(info.version, VERSION) || p.getProperty("UPD_SKIP") === info.version) return;
  if (p.getProperty("UPD_VER") !== info.version) {          // a brand-new version: tell them now
    p.setProperty("UPD_VER", info.version);
    p.setProperty("UPD_NEXT", "0");
  }
  if (now < Number(p.getProperty("UPD_NEXT") || 0)) return;  // snoozed
  if (sendUpdateNotice(info)) p.setProperty("UPD_NEXT", String(now + 3 * 86400000)); // ping again in 3 days if ignored
}

function checkUpdateNow() {
  const fresh = fetchLatest();
  if (!fresh) { sendTelegram("⚠️ Couldn't reach GitHub to check for updates."); return; }
  PropertiesService.getScriptProperties().setProperty("UPD_INFO", JSON.stringify(fresh));
  if (isNewer(fresh.version, VERSION)) sendUpdateNotice(fresh);
  else sendTelegram("✅ You're on the latest version (v" + VERSION + ").");
}

function sendUpdateNotice(info) {
  const text =
    "🔔 <b>Update available</b>\n" +
    "Mail to Telegram <b>v" + esc(info.version) + "</b> is out. You have v" + VERSION + ".\n\n" +
    (info.notes ? "<b>What's new</b>\n" + esc(info.notes) + "\n\n" : "") +
    "<b>To update</b>\n" +
    "1. Tap “Open the new script” and copy all of it\n" +
    "2. Open your project at script.google.com, select everything and paste\n" +
    "3. Save. Your token and settings are kept if you ran saveSettings once.";
  return sendTelegram(text, { inline_keyboard: [
    [{ text: "Open the new script", url: info.url }],
    [{ text: "Remind me in 1 hour", callback_data: "upd:1h" }, { text: "Tomorrow", callback_data: "upd:1d" }],
    [{ text: "Next week", callback_data: "upd:7d" }, { text: "Skip this version", callback_data: "upd:skip" }]
  ] });
}

function handleCallback(cb) {
  if (!cb.message || String(cb.message.chat.id) !== String(CONFIG.CHAT_ID)) return;
  const p = PropertiesService.getScriptProperties();
  const d = String(cb.data || "");
  const info = JSON.parse(p.getProperty("UPD_INFO") || "null");
  const snooze = { "upd:1h": [3600000, "in 1 hour"], "upd:1d": [86400000, "tomorrow"], "upd:7d": [604800000, "in a week"] }[d];
  let note = "";
  if (snooze) {
    p.setProperty("UPD_NEXT", String(Date.now() + snooze[0]));
    note = "I'll remind you " + snooze[1] + ".";
  } else if (d === "upd:skip" && info) {
    p.setProperty("UPD_SKIP", info.version);
    note = "Skipped v" + info.version + ".";
  } else {
    tg("answerCallbackQuery", { callback_query_id: cb.id });
    return;
  }
  tg("answerCallbackQuery", { callback_query_id: cb.id, text: note });
  tg("editMessageReplyMarkup", {
    chat_id: CONFIG.CHAT_ID,
    message_id: cb.message.message_id,
    reply_markup: JSON.stringify({ inline_keyboard: [] })
  });
  sendTelegram("⏰ " + esc(note));
}

// ================= SUMMARIES =================
function summaryFor(msg) {
  const subject = msg.getSubject() || "(no subject)";
  const text = cleanBody(msg).slice(0, 15000);
  let s = "";
  if (CONFIG.GEMINI_API_KEY) s = geminiSummary(subject, msg.getFrom(), text);
  if (!s) s = extractiveSummary(text);
  const otps = findOtps(subject + "\n" + text);
  return "📝 <b>Summary:</b> " + esc(subject) + "\n\n" + markOtps(esc(s), otps);
}

function geminiSummary(subject, from, text) {
  try {
    const prompt =
      "Summarize this email for a busy person in at most 5 short bullet points starting with \"- \". " +
      "Keep every important detail: who it is from, what is needed, dates and times, amounts, deadlines, " +
      "links to act on, and any code or OTP. No introduction and no commentary.\n\n" +
      "Subject: " + subject + "\nFrom: " + from + "\n\n" + text;
    const res = UrlFetchApp.fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + CONFIG.GEMINI_MODEL + ":generateContent",
      {
        method: "post",
        contentType: "application/json",
        headers: { "x-goog-api-key": CONFIG.GEMINI_API_KEY },
        payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        muteHttpExceptions: true
      });
    if (res.getResponseCode() !== 200) { console.error(res.getContentText()); return ""; }
    const j = JSON.parse(res.getContentText());
    const parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
    return parts ? parts.map(p => p.text || "").join("").trim() : "";
  } catch (e) { console.error(e); return ""; }
}

// Built-in summary (no AI): picks the sentences that carry dates, amounts, deadlines and actions
function extractiveSummary(text) {
  const flat = text.replace(/https?:\/\/\S+/g, " ").replace(/\s+/g, " ").trim();
  const sents = (flat.match(/[^.!?]+[.!?]+/g) || [flat]).map(s => s.trim()).filter(s => s.length > 25 && s.length < 300);
  const KEY = /(deadline|due|urgent|important|required|please|confirm|verify|payment|paid|invoice|amount|total|meeting|interview|schedule|appointment|expires?|reminder|attached|action|click|register|submit|reply|cancel|refund)/i;
  const scored = sents.map((s, i) => {
    let sc = 0;
    if (KEY.test(s)) sc += 2;
    if (/\d/.test(s)) sc += 1;
    if (/[₦$€£]\s?\d|\d+\s?(naira|ngn|usd)/i.test(s)) sc += 2;
    if (i < 2) sc += 2 - i;
    return { s: s, i: i, sc: sc };
  });
  const top = scored.sort((a, b) => b.sc - a.sc).slice(0, CONFIG.SUMMARY_SENTENCES)
    .sort((a, b) => a.i - b.i).map(x => "- " + x.s);
  const links = (text.match(/https?:\/\/[^\s<>"')]+/g) || []).slice(0, 2);
  let out = top.join("\n") || ("- " + flat.slice(0, 300));
  if (links.length) out += "\n\nLinks:\n" + links.join("\n");
  return out;
}

// ================= 4. TIME-BOUND MAIL -> REMINDERS + CALL =================
const MONTH_RE = "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const WEEKDAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
const EVENT_WORDS = /(meeting|interview|deadline|due|submit|submission|appointment|webinar|class|exam|test|session|zoom|meet|event|starts?|reminder|closes|closing|expires|rsvp|register|schedule)/i;

function scanForEvent(msg) {
  const text = (msg.getSubject() + "\n" + msg.getPlainBody()).slice(0, 4000);
  if (!EVENT_WORDS.test(text)) return;

  const d = findDate(text, msg.getDate());
  const t = findTime(text);
  if (!d || !t) return;
  d.setHours(t.h, t.min, 0, 0);
  if (d.getTime() <= Date.now() + 60000) return;

  const props = PropertiesService.getScriptProperties();
  const list = JSON.parse(props.getProperty("REMINDERS") || "[]");
  CONFIG.REMIND_BEFORE_MIN.forEach(min => {
    const at = d.getTime() - min * 60000;
    if (at > Date.now()) {
      list.push({ at: at, min: min, ev: d.getTime(), s: (msg.getSubject() || "Event").slice(0, 80) });
    }
  });
  props.setProperty("REMINDERS", JSON.stringify(list.slice(-40)));

  const tz = Session.getScriptTimeZone();
  sendTelegram("⏰ Time-bound email detected. Reminders set for <b>" +
    Utilities.formatDate(d, tz, "EEE, d MMM yyyy, h:mm a") + "</b>");
}

function checkReminders() {
  const props = PropertiesService.getScriptProperties();
  const list = JSON.parse(props.getProperty("REMINDERS") || "[]");
  if (!list.length) return;

  const now = Date.now();
  const tz = Session.getScriptTimeZone();
  const keep = [];

  list.forEach(r => {
    if (r.at > now) { keep.push(r); return; }
    if (r.ev < now) return;                                  // event already passed
    const when = Utilities.formatDate(new Date(r.ev), tz, "EEE, d MMM, h:mm a");
    sendTelegram("⏰ <b>Reminder:</b> " + esc(r.s) +
      "\nStarts in " + r.min + " min, <b>" + when + "</b>");
    if (r.min === CONFIG.CALL_AT_MIN) callMe("Reminder. " + r.s + ". Starts in " + r.min + " minutes.");
  });

  props.setProperty("REMINDERS", JSON.stringify(keep));
}

function callMe(text) {
  if (!CONFIG.CALL_ENABLED) return;
  const url = "https://api.callmebot.com/start.php?user=" +
    encodeURIComponent(CONFIG.CALLMEBOT_USER) +
    "&text=" + encodeURIComponent(String(text).slice(0, 250)) +   // CallMeBot allows 256 characters
    "&lang=en-US-Standard-B&rpt=2";
  try { UrlFetchApp.fetch(url, { muteHttpExceptions: true }); }
  catch (e) { console.error(e); }
}

// ---------- date/time detection ----------
function findTime(t) {
  let m = t.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i);
  if (m) {
    let h = Number(m[1]) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return { h: h, min: Number(m[2] || 0) };
  }
  m = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  return m ? { h: Number(m[1]), min: Number(m[2]) } : null;
}

function mkDate(year, month, day, base) {
  const start = new Date(base); start.setHours(0, 0, 0, 0);
  const y = year || base.getFullYear();
  let d = new Date(y, month, day);
  if (!year && d < start) d = new Date(y + 1, month, day);
  return d;
}

function findDate(text, base) {
  const s = text.toLowerCase();
  let m;

  m = s.match(/\b(20\d\d)-(\d{1,2})-(\d{1,2})\b/);
  if (m) return mkDate(Number(m[1]), Number(m[2]) - 1, Number(m[3]), base);

  m = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);           // day/month/year
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return mkDate(y, Number(m[2]) - 1, Number(m[1]), base);
  }

  m = s.match(new RegExp("\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?" + MONTH_RE + "\\b(?:,?\\s+(20\\d\\d))?"));
  if (m) return mkDate(m[3] ? Number(m[3]) : 0, MONTHS.indexOf(m[2].slice(0, 3)), Number(m[1]), base);

  m = s.match(new RegExp("\\b" + MONTH_RE + "\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s+(20\\d\\d))?"));
  if (m) return mkDate(m[3] ? Number(m[3]) : 0, MONTHS.indexOf(m[1].slice(0, 3)), Number(m[2]), base);

  const today = new Date(base); today.setHours(0, 0, 0, 0);
  if (/\b(today|tonight)\b/.test(s)) return today;
  if (/\btomorrow\b/.test(s)) { today.setDate(today.getDate() + 1); return today; }

  m = s.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (m) {
    const diff = (WEEKDAYS.indexOf(m[1]) - today.getDay() + 7) % 7 || 7;
    today.setDate(today.getDate() + diff);
    return today;
  }
  return null;
}

// ================= 5. COMPOSE NEW EMAIL FROM TELEGRAM =================
function composeTemplate() {
  return "✉️ <b>New email</b>\nCopy this, fill it in and send it back. " +
    "Separate several addresses with commas. Cc and Bcc can stay empty.\n\n" +
    "<pre>To: \nCc: \nBcc: \nSubject: \nMessage: \n</pre>";
}

function parseCompose(text) {
  const out = { to: "", cc: "", bcc: "", subject: "", body: "" };
  const bodyLines = [];
  let cur = null;
  text.replace(/\r/g, "").split("\n").forEach(line => {
    if (cur === "body") { bodyLines.push(line); return; }
    const m = line.match(/^\s*(to|email|cc|bcc|subject|message|body)\s*:\s*(.*)$/i);
    if (m) {
      let key = m[1].toLowerCase();
      if (key === "email") key = "to";
      if (key === "message") key = "body";
      cur = key;
      if (key === "body") bodyLines.push(m[2]); else out[key] = m[2];
    } else if (cur) {
      out[cur] += " " + line.trim();
    }
  });
  out.body = bodyLines.join("\n").trim();
  return out;
}

function parseAddrs(s) {
  const all = String(s || "").split(/[,;\s]+/).filter(Boolean);
  const bad = all.filter(a => !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(a));
  return { list: all, bad: bad };
}

function composeAndSend(text) {
  const c = parseCompose(text);
  const to = parseAddrs(c.to), cc = parseAddrs(c.cc), bcc = parseAddrs(c.bcc);
  const bad = to.bad.concat(cc.bad, bcc.bad);
  if (!to.list.length) { sendTelegram("⚠️ Add at least one address after <b>To:</b>. Nothing was sent."); return; }
  if (bad.length) { sendTelegram("⚠️ These don't look like email addresses: " + esc(bad.join(", ")) + ". Nothing was sent."); return; }
  if (!c.body) { sendTelegram("⚠️ The message is empty. Write it after <b>Message:</b>. Nothing was sent."); return; }

  const subject = c.subject.trim() || "(no subject)";
  const body = c.body + (CONFIG.SIGNATURE ? "\n\n" + CONFIG.SIGNATURE : "");
  try {
    const opts = {};
    if (cc.list.length) opts.cc = cc.list.join(",");
    if (bcc.list.length) opts.bcc = bcc.list.join(",");
    GmailApp.sendEmail(to.list.join(","), subject, body, opts);
  } catch (e) {
    console.error(e);
    sendTelegram("⚠️ Couldn't send: " + esc(e.message));
    return;
  }
  sendTelegram("✅ <b>Email sent</b>\nTo: " + esc(to.list.join(", ")) +
    (cc.list.length ? "\nCc: " + esc(cc.list.join(", ")) : "") +
    (bcc.list.length ? "\nBcc: " + esc(bcc.list.join(", ")) : "") +
    "\nSubject: " + esc(subject));
}

// ================= HELPERS =================
function tg(method, payload) {
  try {
    const res = UrlFetchApp.fetch(
      "https://api.telegram.org/bot" + CONFIG.BOT_TOKEN + "/" + method,
      { method: "post", payload: payload, muteHttpExceptions: true });
    return JSON.parse(res.getContentText());
  } catch (e) { console.error(e); return null; }
}

function sendTelegram(html, markup) {
  const payload = {
    chat_id: CONFIG.CHAT_ID,
    text: html,
    parse_mode: "HTML",
    disable_web_page_preview: "true"
  };
  if (markup) payload.reply_markup = JSON.stringify(markup);
  const r = tg("sendMessage", payload);
  return r && r.ok ? r.result.message_id : null;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chunk(text, size) {
  if (!text) return [""];
  const out = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

// ================= SETUP & TESTS =================
function setupTrigger() {
  saveSettings();
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  PropertiesService.getScriptProperties().setProperty("LAST_TS", String(Date.now()));
  ScriptApp.newTrigger("tick").timeBased().everyMinutes(1).create();
  sendTelegram("✅ Mail forwarding is on (v" + VERSION + "). Only emails received from now will be sent.");
}

function testSend() { Logger.log(sendTelegram("✅ Test from Apps Script")); }
function testCall() { callMe("This is a test call from your mail bot."); }
function testUpdate() { checkUpdateNow(); }

// Fakes a meeting 11 minutes away: in about a minute you get the reminder here, plus the call if enabled
function testMeetingCall() {
  const props = PropertiesService.getScriptProperties();
  const list = JSON.parse(props.getProperty("REMINDERS") || "[]");
  list.push({ at: Date.now() + 60000, min: CONFIG.CALL_AT_MIN, ev: Date.now() + (CONFIG.CALL_AT_MIN + 1) * 60000, s: "Test meeting" });
  props.setProperty("REMINDERS", JSON.stringify(list));
  sendTelegram("🧪 Test meeting set. In about a minute you should get a reminder here and a call.");
}
