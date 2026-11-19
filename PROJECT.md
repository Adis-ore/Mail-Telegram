# Mail to Telegram: project guide

How this project is put together and how to change it. For setting up the bot itself, see [README.md](README.md).

## What's in the repo

| Path | What it is |
|---|---|
| `script/Code.gs` | The Google Apps Script people copy into their own Google account. This *is* the product. |
| `script/version.json` | The latest version number and release notes. Every installed script and the website read it. |
| `src/` | The setup website (React + Vite). |
| `public/` | Favicon and app icons served as-is. |
| `docs/` | README images (animated banner, chat demo) and logo files. |
| `README.md` | User-facing setup guide (shown on GitHub). |

## The Apps Script (`script/Code.gs`)

Runs inside each user's own Google account. Nothing goes through a server of ours.

**How it runs**
- `tick()` runs every minute (time trigger made by `setupTrigger`). It checks Gmail, polls Telegram (unless instant replies are on), fires due reminders and checks for updates.
- `doPost()` receives Telegram messages instantly when the user has deployed the project as a Web app and run `setupWebhook`. The URL carries a secret `?k=` key; repeated deliveries of the same update are ignored.
- All state lives in Script Properties: `LAST_TS` (last forwarded mail), `MAP` (Telegram message → Gmail message), `REMINDERS`, `TG_OFFSET`, `WEBHOOK*`, `UPD_*` (update alerts), `CFG_*` (saved settings).

**Features and where they live**

| Feature | Functions |
|---|---|
| Forward new mail | `checkMail`, `forward`, `cleanBody` |
| OTP codes in bold | `findOtps`, `markOtps` |
| Swipe-reply / summaries | `handleUpdate`, `summaryFor`, `geminiSummary`, `extractiveSummary` |
| No-reply protection | `isNoReply`, `addrOf` |
| Send email from Telegram | `sendCompose`, `parseCompose`, `composeAndSend` |
| Reminders and calls | `scanForEvent`, `findDate`, `findTime`, `checkReminders`, `callMe` |
| Update alerts | `checkUpdate`, `checkUpdateNow`, `sendUpdateNotice`, `handleCallback` |
| Instant replies | `doPost`, `setupWebhook`, `removeWebhook` |
| Keep settings across updates | `saveSettings`, `loadSaved` |

**Limits to know**
- New mail takes up to about a minute: Google's time triggers can't run more often, and free accounts get about 90 minutes of trigger time a day.
- Calls go through CallMeBot, a free unofficial service that is sometimes busy.

## Releasing a new script version

1. Edit `script/Code.gs`.
2. If you added a feature, add a `- …` bullet to the comment at the top, and a line in `helpText()` if it's a command. **The website reads both**, so this is what makes it appear there.
3. Raise `const VERSION = "x.y.z"` (last digit for fixes, middle for features).
4. Set the same number and user-facing `notes` in `script/version.json`.
5. Commit both files together and push.

What happens next: within 6 hours every installed copy sends its owner a Telegram alert with your notes (they can snooze or skip it). The website shows the new version and notes within a few minutes, and marks new features **New** for returning visitors. Users with instant replies also need **Deploy → Manage deployments → pencil → New version**; the alert tells them.

Never commit a real bot token or chat ID. The repo copy keeps `PASTE_YOUR_…` placeholders.

## The website (`src/`)

Single page, top to bottom:

| Section | Component | Notes |
|---|---|---|
| Hero | `Hero.jsx` | Dithered glass head (`DitherVeil`), ring of step tiles, GooeyNav, theme toggle |
| Setup steps | `StepDeck.jsx`, `StepPanel.jsx`, `Card.jsx` | Scroll-driven card wheel, step panel, light tunnel background, live script window on the Copy step (`ScriptViewer.jsx`) |
| Everything the script does | `Features.jsx` | Built from the live script (see below), with a crosshair cursor |
| Footer | `Footer.jsx` | Animated arch lines |
| Update notice | `ScriptViewer.jsx` (`UpdateToast`) | Shown to visitors whose copied script is out of date |

**Where to edit things**
- Step text, links and buttons: `src/data.jsx` (`STEPS`). Each step can have `items`, `note`, `code` and `actions` (`{ label, href }` opens a link, `{ label, copy }` copies text, `{ copyScript: true }` copies the live script).
- Descriptions of Apps Script functions on the site: `KNOWN_FUNCTIONS` in `src/lib/scriptInfo.js`. Anything not listed falls back to the `//` comment above the function.
- Colours and layout: `src/index.css` (theme tokens at the top; light/dark both defined).

**Live data from GitHub** (`src/lib/useLatestScript.js`, `src/lib/scriptInfo.js`)
- Fetches `script/Code.gs`, `script/version.json` and the last commit date from GitHub on page load.
- `scriptInfo.js` reads the features (header bullets), commands (`helpText()`) and runnable functions (`setup…`, `save…`, `test…`, `remove…`, `debug…`) out of the script.
- Remembers in the visitor's browser which version they copied and which items they've seen, for the update notice and **New** badges.
- GitHub caches raw files for a few minutes, and the commit-date lookup is limited to 60 requests an hour per visitor (the rest of the page works without it).

**Third-party pieces**
- From React Bits, copied into `src/components/`: `DitherVeil` (hero head; we added a `cutout` option so the photo's plain background is transparent), `TechText` (deck title), `LightTunnel` (deck background), `GooeyNav` (navbar), `Crosshair` (features section).
- npm: `react`, `ogl` (WebGL for DitherVeil), `lenis` (smooth scrolling).
- Hero photo: Unsplash image set in `HEAD_SRC` in `src/data.jsx`.

## Running and building

```bash
npm install
npm run dev      # local site at http://localhost:5173
npm run build    # static site in dist/
```

`dist/` is a plain static site: it can go on GitHub Pages, Netlify, Vercel or any static host. It isn't deployed anywhere yet.

## Logo

`docs/logo/`: `logo.svg` (vector), `logo-1024.png` / `logo-512.png` (rounded, transparent), `telegram-bot-photo.png` (full square for the bot's profile picture via @BotFather `/setuserpic`). Browser icons are in `public/`.
