import { Bell, Bot, CheckCircle, Copy, FileScript, Flash, GitFork, IdCard, Mail, Sliders } from "./icons";
// Content for the setup guide. Edit text, links and steps here.

export const GITHUB_URL = "https://github.com/Adis-ore/Mail-Telegram/";
export const X_URL = "https://x.com/adisdtechie";
export const LINKEDIN_URL = "https://www.linkedin.com/in/adigun-oreoluwa-78b500237/";

// Where the live Apps Script lives (same paths the script itself checks for updates).
// To release: update script/Code.gs, bump VERSION in it, and bump script/version.json to match.
const RAW = "https://raw.githubusercontent.com/Adis-ore/Mail-Telegram/main/script/";
export const SCRIPT = {
  raw: RAW + "Code.gs",
  version: RAW + "version.json",
  commits: "https://api.github.com/repos/Adis-ore/Mail-Telegram/commits?per_page=1&path=script/Code.gs",
  view: GITHUB_URL + "blob/main/script/Code.gs",
};



// Inline link inside step text.
const L = ({ href, children }) => (
  <a className="il" href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

export const LINKS = {
  botFather: "https://t.me/BotFather",
  getUpdates: "https://api.telegram.org/botYOUR_TOKEN/getUpdates",
  newScript: "https://script.google.com/home/projects/create",
  scripts: "https://script.google.com/home",
  timeZones: "https://en.wikipedia.org/wiki/List_of_tz_database_time_zones",
  testEmail: "https://mail.google.com/mail/?view=cm&fs=1&su=" + encodeURIComponent("Meeting tomorrow at 3pm"),
  telegram: "https://web.telegram.org/",
  callMeBot: "https://www.callmebot.com/",
};

// Each step can have `actions`: { label, href } opens a link, { label, copy } copies text.
export const STEPS = [
  {
    name: "Fork", where: "github.com", time: "2 min", colors: ["#5f8f88", "#3c6660"],
    title: "Fork the project on GitHub",
    icon: <GitFork />,
    items: [
      <>Sign in to <L href="https://github.com/login">GitHub</L> (a free account is fine).</>,
      <>Open <L href={GITHUB_URL}>the project</L> and tap <b>Fork</b> at the top right.</>,
      <>Open the script file in your fork and copy all of it.</>,
    ],
    note: <>Don’t want to use GitHub? The next card lets you copy the script straight from this page.</>,
    actions: [{ label: "Open the project ↗", href: GITHUB_URL }],
  },
  {
    name: "Copy", where: "this page", time: "1 min", colors: ["#2f8f5b", "#1d6440"],
    title: "Or just copy the script", showScript: true,
    icon: <Copy />,
    items: [
      <>No GitHub account needed. The full script is shown here, always the latest version.</>,
      <>Tap <b>Copy script</b>.</>,
      <>You’ll paste it into Google Apps Script in step 5.</>,
    ],
    note: <>When the script is updated, this page tells you on your next visit so you can copy the new version.</>,
    actions: [{ label: "Copy script", copyScript: true }, { label: "View on GitHub ↗", href: SCRIPT.view }],
  },
  {
    name: "Bot", where: "@BotFather", time: "1 min", colors: ["#5b7cfa", "#3a4fc4"],
    title: "Create your Telegram bot",
    icon: <Bot />,
    items: [
      <>In Telegram, open <L href={LINKS.botFather}>@BotFather</L> and send <code>/newbot</code>.</>,
      <>Pick a name, then a username ending in <code>bot</code>.</>,
      <>Copy the <b>token</b> it gives you.</>,
    ],
    note: <><b>Keep it secret.</b> The token is your bot’s password. Never post it publicly or put it on GitHub.</>,
    actions: [{ label: "Open @BotFather ↗", href: LINKS.botFather }, { label: "Copy /newbot", copy: "/newbot" }],
  },
  {
    name: "ID", where: "getUpdates", time: "1 min", colors: ["#c2693f", "#8e4121"],
    title: "Get your chat ID",
    icon: <IdCard />,
    items: [
      <>Open your new bot, tap <b>Start</b>, and send “hi”.</>,
      <>Copy the link below, paste it in your browser, and put your token in place of <code>YOUR_TOKEN</code>.</>,
      <>Copy the number after <code>{'"chat":{"id":'}</code>.</>,
    ],
    code: LINKS.getUpdates,
    note: <>If the result is empty, message the bot again and refresh.</>,
    actions: [{ label: "Copy the link", copy: LINKS.getUpdates }],
  },
  {
    name: "Script", where: "script.google.com", time: "1 min", colors: ["#8a5cff", "#5a35c4"],
    title: "Create your Google script",
    icon: <FileScript />,
    items: [
      <>Go to <L href={LINKS.scripts}>script.google.com</L> signed in to the Gmail you want to forward.</>,
      <>Tap <b>New project</b> and delete the sample code.</>,
      <>Paste the script you copied.</>,
    ],
    actions: [{ label: "New Apps Script project ↗", href: LINKS.newScript }],
  },
  {
    name: "Setup", where: "your details", time: "1 min", colors: ["#2a9d8f", "#1b6b62"],
    title: "Add your details",
    icon: <Sliders />,
    items: [
      <>At the top, set <code>BOT_TOKEN</code> and <code>CHAT_ID</code>.</>,
      <>Open <b>Project Settings</b>, tick “Show appsscript.json”, and set <code>timeZone</code> to <L href={LINKS.timeZones}>your time zone</L> (for example <code>Africa/Lagos</code>).</>,
      <>Save the project.</>,
    ],
    actions: [{ label: "Find your time zone ↗", href: LINKS.timeZones }],
  },
  {
    name: "Test", where: "testSend", time: "2 min", colors: ["#e0a030", "#a8700f"],
    title: "Test it, then switch it on",
    icon: <CheckCircle />,
    items: [
      <>Choose <code>testSend</code> and press <b>Run</b>.</>,
      <>You’ll see an “unverified app” warning. That’s normal for your own script: <b>Advanced → Go to project → Allow</b>.</>,
      <>Check Telegram for the test message.</>,
      <>Run <code>setupTrigger</code> once. It now checks every minute, even with your phone off.</>,
    ],
    actions: [{ label: "Open my scripts ↗", href: LINKS.scripts }, { label: "Open Telegram ↗", href: LINKS.telegram }],
  },
  {
    name: "Try", where: "real email", time: "1 min", colors: ["#d8567a", "#9c2c4d"],
    title: "Try it for real",
    icon: <Mail />,
    items: [
      <>Email yourself from another account.</>,
      <>It shows up in Telegram within about a minute.</>,
      <>Swipe-reply to it to answer by email.</>,
      <>Send “Meeting tomorrow at 3pm” to test reminders.</>,
    ],
    actions: [{ label: "Write a test email ↗", href: LINKS.testEmail }],
  },
  {
    name: "Ring", where: "your phone", time: "1 min", colors: ["#5aa832", "#3c7a1e"],
    title: "Make reminders ring",
    icon: <Bell />,
    tabs: [
      { label: "Android", items: [
        <>Open your bot’s chat → tap its <b>name</b> → <b>Notifications</b> → <b>Customize</b>.</>,
        <>Pick a loud <b>Sound</b>, set <b>Importance: Urgent</b>, turn on <b>Vibrate</b>.</>,
      ] },
      { label: "iPhone", items: [
        <>Open your bot’s chat → tap its <b>name</b> → <b>Notifications</b>.</>,
        <>Tap <b>Sound</b> and pick a loud one.</>,
      ] },
    ],
    items: [
      <>Test: run <code>testMeetingCall</code>. The reminder rings in about a minute.</>,
      <>Want a phone call too? Tap <b>Start</b> in <L href="https://t.me/CallMeBot_txtbot">@CallMeBot_txtbot</L> and set <code>CALLMEBOT_USER</code>.</>,
    ],
    note: <>Silent mode and Do Not Disturb still mute it.</>,
    actions: [{ label: "Open @CallMeBot_txtbot ↗", href: "https://t.me/CallMeBot_txtbot" }],
  },
  {
    name: "Fast", where: "optional", time: "3 min", colors: ["#3f8fd2", "#24609a"],
    title: "Optional: make replies instant",
    icon: <Flash />,
    items: [
      <>In your Apps Script project, click the blue <b>Deploy</b> button (top right), then <b>New deployment</b>.</>,
      <>Click the gear icon next to <b>Select type</b> and choose <b>Web app</b>.</>,
      <>Set <b>Execute as</b> to <b>Me</b> and <b>Who has access</b> to <b>Anyone</b>. Click <b>Deploy</b>, then <b>Authorize access</b> and allow it.</>,
      <>Google now shows a <b>Web app URL</b> ending in <code>/exec</code>. Click <b>Copy</b>.</>,
      <>At the top of the script, find <code>WEBAPP_URL: "",</code> and paste the link between the quotes. Press <b>Ctrl+S</b> to save.</>,
      <>Choose <code>setupWebhook</code> next to <b>Run</b> and press <b>Run</b>. Telegram says <b>“⚡ Instant replies are on”</b>.</>,
      <>Test it: type <code>help</code> to your bot. It should answer in a second or two.</>,
    ],
    note: <><b>You can skip this card.</b> Without it everything still works, the bot just answers within about a minute. New emails always take up to a minute (Google’s limit). If you use this, then every time you paste a newer script: <b>Deploy → Manage deployments → pencil → Version: New version → Deploy</b>.</>,
    actions: [{ label: "Open my scripts ↗", href: LINKS.scripts }, { label: "Copy WEBAPP_URL line", copy: 'WEBAPP_URL: "",' }],
  },
];
