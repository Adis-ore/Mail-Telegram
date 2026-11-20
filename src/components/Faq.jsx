import { Plus } from "../icons";
import { LINKEDIN_URL, X_URL } from "../data";

const QA = [
  ["Is it really free?",
    "Yes. Google Apps Script and Telegram bots are free, and there’s nothing to host or subscribe to."],
  ["Can anyone else read my emails?",
    "No. The script runs inside your own Google account and only sends to your own bot. There’s no server in the middle. Just keep your bot token private."],
  ["Does my phone or laptop need to stay on?",
    "No. Google runs the script every minute in the cloud, whether your devices are on or off."],
  ["How fast do emails arrive?",
    "Within about a minute. Replies and commands can be instant if you do the optional last setup card."],
  ["Does it work on iPhone and Android?",
    "Yes, and on Telegram for desktop and the web too. Anywhere Telegram runs."],
  ["I don’t code. Can I still set it up?",
    "Yes. It’s copy and paste: 10 short cards, about 10 minutes. Each card has buttons for the links and text you need."],
  ["Can I turn off the phone calls?",
    <>Yes. Set <code>CALL_ENABLED</code> to <code>false</code> at the top of the script. You’ll still get reminder messages.</>],
  ["How do I stop it?",
    <>In your Apps Script project, open <b>Triggers</b> (the clock icon) and delete the trigger. Nothing runs after that.</>],
  ["How do I update it?",
    "The bot messages you when there’s a new version. Copy the new script and paste it over the old one. Your settings are kept if you ran saveSettings once."],
];

export default function Faq() {
  return (
    <section className="sec faq" id="faq">
      <div className="sec-h">
        <h2>Good <em>questions.</em></h2>
        <p>
          Still stuck? Message me on <a href={X_URL} target="_blank" rel="noopener noreferrer">X</a> or{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
        </p>
      </div>
      <div className="faq-l">
        {QA.map(([q, a]) => (
          <details key={q}>
            <summary>{q}<Plus aria-hidden="true" /></summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
