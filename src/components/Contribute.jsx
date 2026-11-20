import { Bug, GitFork, Github, Idea, Merge, PullRequest, Star } from "../icons";
import { GITHUB_URL } from "../data";
import { useReveal } from "../lib/useReveal";

const ISSUES = GITHUB_URL + "issues/new/choose";
const GUIDE = GITHUB_URL + "blob/main/CONTRIBUTING.md";

// How a change gets in: nothing reaches users until it is reviewed, tested and merged.
const FLOW = [
  { icon: <GitFork />, title: "Fork", text: "Copy the project to your GitHub." },
  { icon: <PullRequest />, title: "Pull request", text: "Make your change and send it back." },
  { icon: <Bug />, title: "Checked", text: "It’s built, tested with a test bot and reviewed." },
  { icon: <Merge />, title: "Merged", text: "It ships to everyone with the next update." },
];

/** "Build it with me": ways to help and how a change gets merged. */
export default function Contribute() {
  const ref = useReveal(0.15);
  return (
    <section className="sec contrib" id="contribute" ref={ref}>
      <div className="sec-h">
        <h2>Build it <em>with me.</em></h2>
        <p>Mail to Telegram is free and open source. Fix a bug, add a feature, or just tell me what would make it better.</p>
      </div>

      <div className="ct-ways">
        <a className="ct-way rv" href={ISSUES} target="_blank" rel="noopener noreferrer" style={{ "--d": "0ms" }}>
          <span className="ct-i red"><Bug /></span>
          <b>Report a bug</b>
          <span>Something not working? Tell me what happened.</span>
        </a>
        <a className="ct-way rv" href={ISSUES} target="_blank" rel="noopener noreferrer" style={{ "--d": "90ms" }}>
          <span className="ct-i amber"><Idea /></span>
          <b>Suggest a feature</b>
          <span>An idea that would help you or others.</span>
        </a>
        <a className="ct-way rv" href={GUIDE} target="_blank" rel="noopener noreferrer" style={{ "--d": "180ms" }}>
          <span className="ct-i blue"><PullRequest /></span>
          <b>Send a change</b>
          <span>Read the short guide, then open a pull request.</span>
        </a>
        <a className="ct-way rv" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ "--d": "270ms" }}>
          <span className="ct-i violet"><Star /></span>
          <b>Star the project</b>
          <span>It helps more people find it.</span>
        </a>
      </div>

      <div className="ct-flow rv" style={{ "--d": "200ms" }}>
        <span className="ct-k">How a change gets in</span>
        <ol>
          {FLOW.map((f, i) => (
            <li key={f.title}>
              <span className="ct-fi">{f.icon}<em>{i + 1}</em></span>
              <b>{f.title}</b>
              <span>{f.text}</span>
            </li>
          ))}
        </ol>
        <a className="btn" href={GUIDE} target="_blank" rel="noopener noreferrer"><Github /> Contributing guide</a>
      </div>
    </section>
  );
}
