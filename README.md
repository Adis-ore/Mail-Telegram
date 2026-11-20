<p align="center">
  <img src="docs/logo.svg" alt="Mail to Telegram logo" width="88">
</p>

<p align="center">
  <img src="docs/banner.svg" alt="Mail to Telegram: your inbox, in your pocket" width="100%">
</p>

<p align="center">
  Every new Gmail lands in your Telegram as a DM, with the full message.<br>
  Reply from the chat, get OTP codes you can tap to copy, and get reminders for anything with a date and time.<br>
  <b>Free. No server. About 10 minutes to set up.</b>
</p>

<p align="center">
  <a href="script/Code.gs"><b>Get the script</b></a> ·
  <a href="#set-it-up-in-10-steps">Setup</a> ·
  <a href="#what-you-can-do-in-telegram">Commands</a> ·
  <a href="#updating">Updating</a> ·
  <a href="#the-setup-website">Website</a>
</p>

---

## See it in action

<p align="center">
  <img src="docs/demo.svg" alt="An email arrives in Telegram with its code in bold, then a summary, a meeting reminder and an update alert" width="640">
</p>

## What it does

| | |
|---|---|
| **Whole email, instantly** | Sender, time (in bold) and the full body, split into parts if it is long. |
| **OTP codes** | Verification codes are bold and tap-to-copy, right at the top. |
| **Reply from Telegram** | Swipe-reply to an email and your text is sent back as an email reply. No-reply senders are blocked so nothing gets lost. |
| **Summaries** | Reply `summarize` (or `shorten`, `tldr`) for a short version. Uses Google Gemini if you add a free key, a built-in summary if you don’t. |
| **Send new email** | Type `send email` and tap **Fill it in here**: the form drops into your typing box. Fill it in and send. Or tap **Copy the form**. Empty Cc and Bcc are skipped. |
| **Instant replies** | Optional: commands and swipe-replies answer in seconds instead of up to a minute. |
| **Reminders** | Emails with a date and time (meetings, deadlines, interviews) get reminders 60 and 10 minutes before, plus a phone call (on by default, can be switched off). |
| **Update alerts** | When a new version of the script is out, you get a Telegram message with what changed and a button to get it. |

It all runs as a Google Apps Script in **your own** Google account, checking once a minute. Nothing goes through anyone else’s server.

## Set it up

The easiest way is the guide on the website: paste your bot token into its chat and it hands you the script with your details already filled in. Prefer to do it by hand? Follow these steps.

### By hand, in 10 steps

> The setup website walks through the same steps with links and copy buttons.

1. **Fork** this repo on GitHub *(optional)*, or just
2. **Copy** [`script/Code.gs`](script/Code.gs). You don’t need a GitHub account for this.
3. **Create your bot.** In Telegram, open [@BotFather](https://t.me/BotFather), send `/newbot`, pick a name and a username ending in `bot`, and copy the **token**.
   > Keep the token secret. It is your bot’s password.
4. **Get your chat ID.** Open your bot, tap **Start**, send “hi”, then open
   `https://api.telegram.org/botYOUR_TOKEN/getUpdates` (with your token) and copy the number after `"chat":{"id":`.
5. **Create the script.** Go to [script.google.com](https://script.google.com/home/projects/create) signed in to the Gmail you want to forward, delete the sample code and paste the script.
6. **Add your details.** At the top, fill in `BOT_TOKEN` and `CHAT_ID`. In **Project Settings**, tick “Show appsscript.json” and set `timeZone` to [your time zone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (for example `Africa/Lagos`). Save.
7. **Test, then switch it on.** Run `testSend`. Google shows an “unverified app” warning because it is your own script: **Advanced → Go to project → Allow**. When the test message arrives, run `setupTrigger` once. That also saves your settings.
8. **Try it.** Email yourself from another account. It shows up within about a minute. Send one that says “Meeting tomorrow at 3pm” to test reminders.
9. **Make reminders ring.** Give your bot’s chat its own loud sound so every email and reminder stands out.
   - **Android:** open the chat with your bot → tap its name → **Notifications** → **Customize** → pick a loud, long **Sound**, set **Importance** to **Urgent**, turn on **Vibrate**.
   - **iPhone:** open the chat with your bot → tap its name → **Notifications** → **Sound** → pick a loud one.
   - **Louder still:** send yourself a short alarm sound in Telegram, long-press it → **Save for notifications**, then choose it as the bot’s sound.
   - **Optional phone call too:** send `/start` to `@CallMeBot_txtbot` and put your Telegram username in `CALLMEBOT_USER`. Your phone then also rings 10 minutes before. Set `CALL_ENABLED: false` to stop calls. CallMeBot is a free service that is sometimes busy; the reminder message always arrives.
   - Test: run `testMeetingCall` in Apps Script.
10. **Optional: instant replies.** Skip this and the bot still works, answering within about a minute. To make it answer in seconds:
   1. In Apps Script, click **Deploy** (top right) → **New deployment**.
   2. Click the gear next to **Select type** → **Web app**.
   3. Set **Execute as: Me** and **Who has access: Anyone** → **Deploy** → **Authorize access** and allow.
   4. Copy the **Web app URL** (it ends in `/exec`).
   5. At the top of the script, paste it into `WEBAPP_URL: "",` between the quotes, and save.
   6. Run `setupWebhook`. Telegram says “⚡ Instant replies are on”.
   7. Type `help` to your bot: it answers in a second or two.

   New emails still arrive within about a minute (Google’s limit). After pasting a newer script later, also do **Deploy → Manage deployments → pencil → Version: New version → Deploy**.

## What you can do in Telegram

**Type on its own**

| Message | What happens |
|---|---|
| `send email` | Sends a form with **Fill it in here** (puts it in your typing box) and **Copy the form** buttons. Fill in `To`, `Subject`, `Message` (Cc and Bcc are optional) and send. |
| `summarize` | Summary of the latest email. |
| `update` | Checks for a new version of the script. |
| `help` | Lists everything. |

**Swipe-reply to an email**

| Reply | What happens |
|---|---|
| `summarize`, `shorten`, `summary`, `tldr` | Short summary of that email. |
| anything else | Sent back to the sender as your email reply. |

## Settings

All in `CONFIG` at the top of the script.

| Setting | Default | What it does |
|---|---|---|
| `BOT_TOKEN`, `CHAT_ID` | | Your bot and your chat. Required. |
| `SEARCH` | `in:inbox category:primary` | Which mail to forward. Use `in:inbox` for everything. |
| `MAX_BODY` | `12000` | Longest body forwarded, in characters. |
| `SIGNATURE` | empty | Added to emails you send from Telegram. |
| `GEMINI_API_KEY` | empty | Optional free key from [AI Studio](https://aistudio.google.com) for better summaries. |
| `REMIND_BEFORE_MIN` | `[60, 10]` | When reminders fire, in minutes before the event. |
| `CALL_ENABLED`, `CALL_AT_MIN`, `CALLMEBOT_USER` | `true`, `10` | Phone call with the reminder, on by default. Set `CALL_ENABLED` to `false` for messages only. Needs your Telegram username. |
| `UPDATE_CHECK`, `UPDATE_CHECK_HOURS` | `true`, `6` | Update alerts and how often to look. |
| `WEBAPP_URL` | empty | Only if `setupWebhook` can’t find your Web app URL: paste the `/exec` URL here. |

## Updating

When an update is out, the bot tells you in Telegram (and the website tells you too, if you copied the script there). To update:

1. Tap **Open the new script** and copy all of it.
2. In your project at script.google.com, select everything and paste.
3. Save. Your token, chat ID and keys are kept, because `setupTrigger` saved them. If you set things up before this version, run `saveSettings` once first.
4. If you turned on instant replies: **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy**. The web app keeps running the old code until you do.

You can snooze the alert (1 hour, tomorrow, next week) or skip a version from the buttons on the message.

### Releasing a new version (maintainer)

Users are alerted when `script/version.json` has a higher version than the one in their copy.

1. Edit [`script/Code.gs`](script/Code.gs) and raise `const VERSION = "1.0.0";` (for example to `1.1.0`).
2. Set the same version in [`script/version.json`](script/version.json) and write the `notes` people will see.
3. Commit both files together and push.

Copies of the script check every 6 hours. The website picks it up within a few minutes.

## The setup website

[mail-telegram.vercel.app](https://mail-telegram.vercel.app/) walks you through setup as a chat: paste your bot token and it hands you this script with your token and chat ID already filled in. Your token goes straight from your browser to Telegram and is never stored.

The website reads `script/Code.gs` and `script/version.json` from this repo, so it always shows the latest version.

| Path | What’s there |
|---|---|
| `script/` | The Apps Script and its `version.json`. |
| `docs/` | The images in this README. |

## Privacy and safety

- The script runs in your Google account and talks only to Telegram (and Gemini or CallMeBot if you turn them on).
- Only messages from your own `CHAT_ID` are acted on.
- Never commit a real bot token or API key. The copy in this repo has placeholders only.

---

<p align="center">
  Built by Adis · Stuck? Message me on <a href="https://x.com/adisdtechie">X</a> or <a href="https://www.linkedin.com/in/adigun-oreoluwa-78b500237/">LinkedIn</a>.
</p>

## Contributing

Bug reports, ideas and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first: fork, make one change, test it with a test bot, and open a pull request. Every pull request is checked automatically and reviewed before it is merged.

## License

MIT. See [LICENSE](LICENSE).
