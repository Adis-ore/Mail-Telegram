# Contributing to Mail to Telegram

Thanks for helping. Bug fixes, new features, better wording and translations for the script are all welcome.

## Before you start

- **Found a bug or have an idea?** [Open an issue](https://github.com/Adis-ore/Mail-Telegram/issues/new/choose) first, so we can agree on it before you write code.
- **Small fix (typo, wording, a clear bug)?** Go straight to a pull request.

## How to send a change

1. **Fork** this repository (top right on GitHub).
2. **Make a branch** in your fork, for example `fix-otp-detection`.
3. **Make your change.** Keep each pull request about one thing.
4. **Test it** (see below).
5. **Open a pull request** to `main` here and fill in the checklist.

Nothing goes live until it is reviewed and merged. Every installed copy of the script reads `script/Code.gs` and `script/version.json` from `main`, so changes there reach real users.

## Testing

**The script (`script/Code.gs`)**

1. Make a test bot with [@BotFather](https://t.me/BotFather) and a separate Apps Script project.
2. Paste your version of `Code.gs`, fill in your test `BOT_TOKEN` and `CHAT_ID`.
3. Run `testSend`, then email yourself and check it arrives. Test whatever you changed (replies, reminders, summaries, …).

**The website** is kept in a separate private repo. If you spot a problem on it, [open an issue](https://github.com/Adis-ore/Mail-Telegram/issues/new/choose) here.

## Rules

- **Never commit a real bot token, chat ID, API key or username.** The script must keep its placeholders (`PASTE_YOUR_BOT_TOKEN_HERE`, `PASTE_YOUR_CHAT_ID_HERE`, `@your_telegram_username`). The automatic check fails if it finds a token.
- **Don't change the version numbers** (`VERSION` in `Code.gs`, `script/version.json`). The maintainer bumps them when releasing, because bumping them tells every user to update.
- **No new servers or third-party calls without discussing it first.** The promise of this project is that mail goes from Gmail to the user's own bot and nowhere else.
- Plain, simple wording in messages the bot sends. Many users don't code.

## What happens after you open a pull request

1. The automatic check looks at the script for syntax errors and leaked tokens.
2. The maintainer reviews the code and tests it with a test bot.
3. Once it's merged, it goes out with the next release.

Questions? Message [@adisdtechie on X](https://x.com/adisdtechie) or on [LinkedIn](https://www.linkedin.com/in/adigun-oreoluwa-78b500237/).
