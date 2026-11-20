import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Attach, BackArrow, Battery, Close, ShieldCheck, Signal, Telegram, Wifi, Bookmark, CheckCircle, Info, Menu, Mic, More, RotateLeft, Search, Send, Smile } from "../icons";
import { SCRIPT, STEPS } from "../data";
import { buildScript, checkToken, findChat, isToken, maskToken, sayHello } from "../lib/telegramConnect";
import { markCopied, useLatestScript } from "../lib/useLatestScript";
import { prefersReducedMotion } from "../lib/motion";
import { scrollToY } from "../lib/smoothScroll";
import ScriptViewer, { CopyScriptButton } from "./ScriptViewer";
import Logo from "./Logo";
import Connect from "./Connect";

/*
 * The setup guide as a Telegram chat with a setup bot. The bot sends each step as a message;
 * tap "Done" to reply, the bot types, then sends the next step. Earlier steps stay in the chat,
 * so people can scroll up and down through everything. Progress is saved in this browser.
 */

const KEY = "setupUpto";
const loadUpto = () => {
  try { const v = Math.floor(Number(localStorage.getItem(KEY))); return v >= 0 && v <= STEPS.length ? v : 0; } catch { return 0; }
};

/** Copies `text` and briefly says so. */
function CopyButton({ label, text, className = "btn ghost sm" }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); } catch { window.prompt("Copy this:", text); }
  };
  return <button type="button" className={className} onClick={copy}>{done ? "Copied ✓" : label}</button>;
}

/** Android / iPhone switch for steps that differ by phone. Starts on the visitor's own platform. */
function PlatformTabs({ tabs }) {
  const [i, setI] = useState(() => (typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 1 : 0));
  const tab = tabs[i] || tabs[0];
  return (
    <>
      <div className="su-tabs" role="tablist" aria-label="Your phone">
        {tabs.map((t, j) => (
          <button key={t.label} type="button" role="tab" aria-selected={j === i} className={j === i ? "on" : ""} onClick={() => setI(j)}>{t.label}</button>
        ))}
      </div>
      <ol className="su-ol">{tab.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
    </>
  );
}

function StepBody({ s, creds }) {
  return (
    <>
      {s.tabs && <PlatformTabs tabs={s.tabs} />}
      {s.items && (
        <ol className="su-ol" style={s.tabs ? { counterReset: `s ${s.tabs[0].items.length}` } : undefined}>
          {s.items.map((item, j) => <li key={j}>{item}</li>)}
        </ol>
      )}
      {s.code && (
        <div className="su-code">
          <code>{s.code}</code>
        </div>
      )}
      {s.note && <p className="su-note"><Info aria-hidden="true" /><span>{s.note}</span></p>}
      {s.actions && (
        <div className="su-acts">
          {s.actions.map((a) => a.href
            ? <a key={a.label} className="btn ghost sm" href={a.href} target="_blank" rel="noopener noreferrer">{a.label}</a>
            : a.copyScript
              ? <CopyScriptButton key={a.label} label={a.label} className="btn sm" />
              : <CopyButton key={a.label} label={a.label} text={a.copy} />)}
        </div>
      )}
      {s.kind === "script" ? <ReadyScript creds={creds} /> : s.showScript && <ScriptViewer />}
    </>
  );
}

/** The script with the visitor's token, chat ID and username filled in, ready to copy. */
function ReadyScript({ creds }) {
  const s = useLatestScript();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(t);
  }, [done]);
  if (!creds?.chatId) {
    return (
      <>
        <p className="su-note"><Info aria-hidden="true" /><span>You skipped connecting your bot, so this is the plain script. Set <code>BOT_TOKEN</code> and <code>CHAT_ID</code> at the top after pasting it.</span></p>
        <div className="su-acts"><CopyScriptButton label="Copy script" className="btn sm" /><a className="btn ghost sm" href={SCRIPT.view} target="_blank" rel="noopener noreferrer">View on GitHub ↗</a></div>
      </>
    );
  }
  const ready = s.status === "ready";
  const copy = async () => {
    if (!ready) return;
    try { await navigator.clipboard.writeText(buildScript(s.code, creds)); markCopied(); setDone(true); } catch { /* clipboard blocked */ }
  };
  return (
    <>
      <pre className="rs">
        <span className="rs-c">{"// your details, already filled in"}</span>{"\n"}
        BOT_TOKEN: <span className="rs-s">"{maskToken(creds.token)}"</span>,{"\n"}
        CHAT_ID: <span className="rs-s">"{creds.chatId}"</span>,{"\n"}
        CALLMEBOT_USER: <span className="rs-s">"{creds.username ? "@" + creds.username : "@your_telegram_username"}"</span>,
      </pre>
      <div className="su-acts">
        <button type="button" className="btn sm" onClick={copy} disabled={!ready}>{done ? "Copied ✓" : ready ? "Copy my script" : "Loading…"}</button>
      </div>
    </>
  );
}

function StepMsg({ s, i, n, creds }) {
  return (
    <div className="msg msg-bot msg-step" data-i={i}>
      <div className="msg-head">
        <span className="msg-ic" style={{ background: `linear-gradient(160deg,${s.colors[0]},${s.colors[1]})` }}>{s.icon}</span>
        <span>Step {i + 1} of {n} · {s.time} · {s.where}</span>
      </div>
      <h3>{s.title}</h3>
      <StepBody s={s} creds={creds} />
    </div>
  );
}

/** "9:41" style time, kept current. */
function useClock() {
  const fmt = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, "");
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Setup({ focus }) {
  const n = STEPS.length;
  const [upto, setUpto] = useState(loadUpto);   // steps 0..upto are in the chat; upto === n means finished
  const [typing, setTyping] = useState(false);
  const [, setTick] = useState(0);               // re-render once to run the scroll below
  const bodyRef = useRef(null);
  const scrollTo = useRef(null);                 // which message to bring into view after render
  // the visitor's bot (kept in memory only: the token is never saved)
  const [creds, setCreds] = useState(null);      // { token, bot, chatId, username, firstName }
  const [log, setLog] = useState([]);            // the connect conversation: { id, me, body, acts }
  const [draft, setDraft] = useState("");
  // closing the chat: it shrinks into a Telegram icon; tapping the icon reopens it with "continue or start over?"
  const [shut, setShut] = useState(() => { try { return localStorage.getItem("setupClosed") === "1"; } catch { return false; } });
  const [anim, setAnim] = useState("");           // "closing" | "opening" while animating
  const [welcome, setWelcome] = useState(false);  // the "welcome back" question after reopening
  const canPaste = typeof navigator !== "undefined" && !!navigator.clipboard?.readText;
  const paste = async () => { try { const t = await navigator.clipboard.readText(); if (t) setDraft(t.trim()); } catch { /* permission denied */ } };
  const [busy, setBusy] = useState(false);
  const say = (m) => { setLog((l) => [...l, { id: Date.now() + Math.random(), ...m }]); scrollTo.current = "end"; };

  const sendToken = async (e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || busy) return;
    setDraft("");
    say({ me: true, body: maskToken(t) });
    if (!isToken(t)) { say({ body: <>That doesn’t look like a bot token. It looks like <code>123456789:AAF…</code>. Copy it again from <b>@BotFather</b>.</> }); return; }
    setBusy(true);
    const r = await checkToken(t);
    setBusy(false);
    if (!r.ok) {
      say({ body: r.error === "network" ? "I couldn’t reach Telegram. Check your connection and send it again." : <>Telegram says that token isn’t valid. Copy it again from <b>@BotFather</b> and send it here.</> });
      return;
    }
    setCreds({ token: t, bot: r.bot });
    say({ body: <>✅ Connected to <b>{r.bot.name}</b> (@{r.bot.username}). Now open your bot, tap <b>Start</b> and send “hi”. Then tap <b>I sent it</b>.</>, acts: "sent", bot: r.bot.username });
  };

  const checkSent = async () => {
    if (!creds || busy) return;
    say({ me: true, body: "I sent it" });
    setBusy(true);
    const r = await findChat(creds.token);
    setBusy(false);
    if (!r.ok) {
      const why = {
        none: <>I can’t see your message yet. Send “hi” to <b>@{creds.bot.username}</b>, then tap <b>I sent it</b> again.</>,
        webhook: <>This bot already sends its messages to a web app, so I can’t read them. Run <code>removeWebhook</code> in your script first, or make a new bot.</>,
        network: "I couldn’t reach Telegram. Try again in a moment.",
        invalid: "Telegram didn’t accept that. Send your token again.",
      };
      say({ body: why[r.error] || why.network, acts: "sent", bot: creds.bot.username });
      return;
    }
    setCreds((c) => ({ ...c, chatId: r.chatId, username: r.username, firstName: r.firstName }));
    sayHello(creds.token, r.chatId);
    say({ body: <>🎉 Found you{r.firstName ? `, ${r.firstName}` : ""}! Your chat ID is <code>{r.chatId}</code>. I just sent you a message in Telegram to prove it works. Tap <b>Done</b> and I’ll give you your ready-made script.</> });
  };

  useEffect(() => { if (upto % 1 === 0) try { localStorage.setItem(KEY, String(upto)); } catch { /* storage blocked */ } }, [upto]);

  // bring a message to the top of the chat (smooth unless reduced motion)
  useLayoutEffect(() => {
    const body = bodyRef.current, want = scrollTo.current;
    if (!body || want == null) return;
    const el = body.querySelector(want === "end" ? ".msg-end" : `[data-i="${want}"]`);
    if (!el) return;
    scrollTo.current = null;
    body.scrollTo({ top: Math.max(0, el.offsetTop - 12), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });

  // first open: show where they are
  useEffect(() => { scrollTo.current = upto >= n ? "end" : upto; setTick((t) => t + 1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Set it up" buttons elsewhere on the page ask to show a step
  useEffect(() => {
    if (!focus || !focus.n) return;
    if (focus.i < 0) scrollTo.current = upto >= n ? "end" : Math.floor(upto);
    else {
      if (focus.i > upto && upto < n) setUpto(focus.i);
      scrollTo.current = focus.i;
    }
    setTick((t) => t + 1);
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (typing || upto >= n) return;
    const to = upto + 1;
    setTyping(true);
    // the user's "Done" bubble shows right away; the bot "types" for a moment, then answers
    scrollTo.current = "end";
    setUpto((u) => u + 0.5);
    setTimeout(() => {
      setTyping(false);
      setUpto(to);
      scrollTo.current = to < n ? to : "end";
    }, prefersReducedMotion() ? 0 : 850);
  };
  const reset = () => { setTyping(false); setUpto(0); setLog([]); setCreds(null); setWelcome(false); scrollTo.current = 0; };

  useEffect(() => { try { localStorage.setItem("setupClosed", shut ? "1" : "0"); } catch { /* storage blocked */ } }, [shut]);
  const quick = prefersReducedMotion();
  const closeChat = () => {
    if (anim) return;
    if (quick) { setShut(true); return; }
    setAnim("closing");
    setTimeout(() => { setShut(true); setAnim(""); }, 560);
  };
  const openChat = () => {
    setShut(false);
    setWelcome(true);
    const sec = document.getElementById("setup");
    if (sec) scrollToY(window.scrollY + sec.getBoundingClientRect().top);
    scrollTo.current = "end";
    if (!quick) { setAnim("opening"); setTimeout(() => setAnim(""), 600); }
  };

  const shown = Math.floor(upto);               // last bot step message in the chat
  const replied = upto % 1 !== 0 ? shown : shown - 1; // user has said "Done" to steps 0..replied
  const finished = upto >= n;

  const clock = useClock();
  const onConnect = !finished && STEPS[Math.min(shown, n - 1)].kind === "connect" && upto % 1 === 0;
  const status = typing ? "typing…" : finished ? "bot · all done" : `bot · step ${Math.min(shown, n - 1) + 1} of ${n}`;
  const preview = finished ? "You’re all set." : STEPS[Math.min(shown, n - 1)].title;

  return (
    <section className={`setup${shut ? " shut" : ""}`} id="setup" aria-label="Set it up in 10 minutes">
      <div className="su">
        {/* a Telegram window: chat list on the left (desktop), the setup chat on the right */}
        {shut ? (
          <div className="tg-dock">
            <button type="button" className="tg-app" onClick={openChat} aria-label="Open the setup chat">
              <span className="tg-ic"><Telegram /></span>
              <em>1</em>
            </button>
            <b>Setup guide</b>
            <span>Tap to open the chat</span>
          </div>
        ) : (
        <div className={`tgw${anim ? " " + anim : ""}`}>
          <aside className="tgw-side" aria-hidden="true">
            <div className="tgw-sh"><Menu /><span className="tgw-search"><Search /> Search</span></div>
            <ul className="tgw-list">
              <li className="on">
                <Logo size={46} round />
                <span><b>Setup guide</b><small>{typing ? "typing…" : preview}</small></span>
                <time>now</time>
              </li>
              <li>
                <Logo size={46} round />
                <span><b>Mail bot</b><small>📧 Your sign-in code is 482913</small></span>
                <time>9:41</time><em>2</em>
              </li>
              <li>
                <span className="tgw-av sv"><Bookmark /></span>
                <span><b>Saved Messages</b><small>Code.gs</small></span>
                <time>Mon</time>
              </li>
              <li>
                <span className="tgw-av tg">T</span>
                <span><b>Telegram</b><small>Login code: 51234. Do not give…</small></span>
                <time>Sun</time>
              </li>
            </ul>
          </aside>

          <div className="chat">
            {/* phones: a status bar with the time, Dynamic Island, signal, Wi-Fi and battery */}
            <div className="chat-sb" aria-hidden="true">
              <b>{clock}</b>
              <i className="chat-island" />
              <span><Signal /><Wifi /><Battery /></span>
            </div>
            <header className="chat-h">
              <button type="button" className="chat-back" onClick={closeChat} aria-label="Close chat"><BackArrow /></button>
              <Logo size={40} round />
              <span className="chat-who">
                <b>Setup guide</b>
                <small className={typing ? "on" : ""}>{status}</small>
              </span>
              {upto > 0 && <button type="button" className="chat-reset" onClick={reset} title="Start over"><RotateLeft /><span>Start over</span></button>}
              <span className="chat-ico" aria-hidden="true"><Search /><More /></span>
              <button type="button" className="chat-x" onClick={closeChat} aria-label="Close chat" title="Close chat"><Close /></button>
            </header>

            <div className="chat-b" ref={bodyRef}>
              <span className="chat-day">Set it up in 10 minutes</span>
              <div className="msg msg-bot">
                Hi! I’ll walk you through the setup. <b>{n} short steps</b>, about 10 minutes, no coding.
                Scroll up any time to see a step again.
              </div>
              {STEPS.map((st, i) => i <= Math.min(shown, n - 1) && (
                <Fragment key={st.name}>
                  <StepMsg s={st} i={i} n={n} creds={creds} />
                  {st.kind === "connect" && log.map((m) => (
                    <div key={m.id} className={`msg ${m.me ? "msg-me" : "msg-bot"}`}>
                      {m.body}{m.me && <span className="msg-t">✓✓</span>}
                      {m.acts === "sent" && !creds?.chatId && (
                        <div className="su-acts">
                          <a className="btn ghost sm" href={`https://t.me/${m.bot}`} target="_blank" rel="noopener noreferrer">Open @{m.bot} ↗</a>
                          <button type="button" className="btn sm" onClick={checkSent} disabled={busy}>I sent it</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {i <= replied && <div className="msg msg-me">{st.kind === "connect" && !creds?.chatId ? "Skip" : "Done ✓"}<span className="msg-t">✓✓</span></div>}
                </Fragment>
              ))}
              {(typing || busy) && <div className="msg msg-bot msg-typing" aria-label="typing"><i /><i /><i /></div>}
              {finished && (
                <div className="msg msg-bot msg-fin">
                  <CheckCircle variant="Bold" />
                  <b>You’re all set.</b> New emails will now arrive in your bot within a minute. Try replying to one with a swipe.
                  You can close this chat now.
                  <div className="su-acts"><button type="button" className="btn sm" onClick={closeChat}>Close chat</button></div>
                </div>
              )}
              {welcome && (
                <div className="msg msg-bot">
                  👋 Welcome back! Do you want to continue where you left off, or start over?
                  <div className="su-acts">
                    <button type="button" className="btn ghost sm" onClick={() => { setWelcome(false); scrollTo.current = finished ? "end" : Math.floor(upto); setTick((t) => t + 1); }}>Continue</button>
                    <button type="button" className="btn sm" onClick={reset}>Start over</button>
                  </div>
                </div>
              )}
              <span className="msg-end" />
            </div>

            <footer className="chat-f">
              {/* Telegram reply keyboard */}
              {finished ? (
                <button type="button" className="chat-btn" onClick={closeChat}>Close chat</button>
              ) : (
                <button type="button" className="chat-btn" onClick={next} disabled={typing || busy}>
                  {shown >= n - 1 ? "Done ✓ Finish" : onConnect && !creds?.chatId ? "Skip, I’ll fill it in myself" : "Done ✓ Next step"}
                </button>
              )}
              {onConnect && !creds?.chatId ? (
                /* the message bar is live on the connect step: paste the bot token here */
                <form className="chat-live" onSubmit={sendToken}>
                  <p className="chat-hint"><ShieldCheck /> Stays in your browser. Only sent to Telegram.</p>
                  <div className="chat-row">
                    <label className="chat-field">
                      <span className="sr">Your bot token</span>
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={creds ? "Paste another token" : "Paste your bot token"}
                        autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false" enterKeyHint="send"
                      />
                      {canPaste && !draft && <button type="button" className="chat-paste" onClick={paste}>Paste</button>}
                      {draft && <button type="button" className="chat-clear" onClick={() => setDraft("")} aria-label="Clear"><Close /></button>}
                    </label>
                    <button type="submit" className="chat-send" aria-label="Send" disabled={!draft.trim() || busy}><Send /></button>
                  </div>
                </form>
              ) : (
                <div className="chat-in" aria-hidden="true">
                  <Attach />
                  <span>Write a message…</span>
                  <Smile />
                  <span className="chat-mic"><Mic /></span>
                </div>
              )}
            </footer>
          </div>
        </div>
        )}

        <Connect className="su-cx" />
      </div>
    </section>
  );
}
