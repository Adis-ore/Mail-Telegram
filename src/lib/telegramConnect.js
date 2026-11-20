/*
 * Connects a visitor's bot from the setup chat, entirely in their browser:
 * the token only ever goes to api.telegram.org (which allows browser requests), never to us.
 */

const API = (token, method, params = "") => `https://api.telegram.org/bot${token}/${method}${params}`;

/** Looks like "123456789:AAF..." */
export const isToken = (t) => /^\d{6,12}:[A-Za-z0-9_-]{30,}$/.test(t);

/** "123456789:AAF…x9Q" for showing back to the visitor. */
export const maskToken = (t) => (t.length > 16 ? `${t.slice(0, t.indexOf(":") + 4)}…${t.slice(-3)}` : t);

async function call(url) {
  let res;
  try { res = await fetch(url); } catch { return { ok: false, error: "network" }; }
  let data = null;
  try { data = await res.json(); } catch { /* not JSON */ }
  if (!data) return { ok: false, error: "network" };
  return data;
}

/** Checks the token. Returns { ok, bot: { username, name } } or { ok: false, error }. */
export async function checkToken(token) {
  const d = await call(API(token, "getMe"));
  if (d.ok) return { ok: true, bot: { username: d.result.username, name: d.result.first_name } };
  return { ok: false, error: d.error === "network" ? "network" : "invalid" };
}

/** Finds the visitor's private chat with the bot from its latest messages. */
export async function findChat(token) {
  const d = await call(API(token, "getUpdates", "?limit=50"));
  if (!d.ok) return { ok: false, error: d.error === "network" ? "network" : d.error_code === 409 ? "webhook" : "invalid" };
  const msgs = (d.result || []).map((u) => u.message || u.edited_message).filter((m) => m && m.chat && m.chat.type === "private");
  const m = msgs[msgs.length - 1];
  if (!m) return { ok: false, error: "none" };
  return { ok: true, chatId: String(m.chat.id), firstName: m.from?.first_name || "", username: m.from?.username || "" };
}

/** Sends a hello to the visitor's chat, so they see it working right away. */
export function sayHello(token, chatId) {
  const text = "✅ Mail to Telegram is connected to this chat.\nNext: copy your ready-made script on the setup page.";
  return call(API(token, "sendMessage", `?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(text)}`));
}

/** The live script with the visitor's details filled in. */
export function buildScript(code, { token, chatId, username }) {
  let out = code
    .replace(/(BOT_TOKEN:\s*)"[^"]*"/, `$1"${token}"`)
    .replace(/(CHAT_ID:\s*)"[^"]*"/, `$1"${chatId}"`);
  if (username) out = out.replace(/(CALLMEBOT_USER:\s*)"[^"]*"/, `$1"@${username}"`);
  return out;
}
