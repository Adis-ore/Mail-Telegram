import { Bell, Bot, CheckCircle, Copy, FileScript, Flash, IdCard, Mail, Sliders } from "./icons";
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
    name: "Bot", where: "@BotFather", time: "1 min", colors: ["#5b7cfa", "#3a4fc4"],
    title: "Create your Telegram bot",
    icon: <Bot />,
    items: [
      <>In Telegram, open <L href={LINKS.botFather}>@BotFather</L> and send <code>/newbot</code>.</>,
      <>Pick a name, then a username ending in <code>bot</code>.</>,
      <>BotFather replies with a <b>token</b> (it looks like <code>123456789:AAF…</code>). Copy it.</>,
    ],
    note: <><b>Keep it secret.</b> The token is your bot’s password. In the next step you paste it here, and it never leaves your browser except to talk to Telegram.</>,
    actions: [{ label: "Open @BotFather ↗", href: LINKS.botFather }, { label: "Copy /newbot", copy: "/newbot" }],
  },
  {
    name: "Connect", where: "this chat", time: "1 min", colors: ["#c2693f", "#8e4121"],
    title: "Connect your bot here", kind: "connect",
    icon: <IdCard />,
    items: [
      <>Paste your bot token in the message box below and send it.</>,
      <>Open your bot, tap <b>Start</b> and send “hi”.</>,
      <>Tap <b>I sent it</b>. I’ll find your chat ID and put everything into your script.</>,
    ],
    note: <>Your token goes straight from your browser to Telegram. It isn’t saved or sent anywhere else, so you’ll paste it again if you reload the page.</>,
  },
  {
    name: "Copy", where: "this chat", time: "1 min", colors: ["#2f8f5b", "#1d6440"],
    title: "Copy your ready-made script", kind: "script", showScript: true,
    icon: <Copy />,
    items: [
      <>Your bot token and chat ID are already filled in at the top.</>,
      <>Tap <b>Copy my script</b>. You’ll paste it into Google Apps Script next.</>,
    ],
    note: <>When the script is updated, your bot tells you and this page shows the new version.</>,
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
    name: "Setup", where: "Project Settings", time: "1 min", colors: ["#2a9d8f", "#1b6b62"],
    title: "Set your time zone",
    icon: <Sliders />,
    items: [
      <>In your Apps Script project, open <b>Project Settings</b> (the gear on the left).</>,
      <>Tick “Show appsscript.json”, open it, and set <code>timeZone</code> to <L href={LINKS.timeZones}>your time zone</L> (for example <code>Africa/Lagos</code>).</>,
      <>Save the project.</>,
    ],
    note: <>Skipped connecting your bot? Then also set <code>BOT_TOKEN</code> and <code>CHAT_ID</code> at the top of the script.</>,
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
      <>Want a phone call too? Tap <b>Start</b> in <L href="https://t.me/CallMeBot_txtbot">@CallMeBot_txtbot</L>. Your Telegram username is already in the script if you have one; if not, set <code>CALLMEBOT_USER</code>.</>,
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
