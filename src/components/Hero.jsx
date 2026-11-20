import { useRef } from "react";
import { ArrowRight } from "../icons";
import HeroDemo, { SCENES, TOTAL, useTimeline } from "./HeroDemo";

/**
 * Headline, the live demo, and the same story told in four short lines.
 * The line that matches what the demo is showing lights up, so people read along;
 * clicking a line jumps the demo there.
 */
export default function Hero({ onStart }) {
  const ref = useRef(null);
  const belowRef = useRef(null);
  const { state, scene, seek } = useTimeline(ref);

  return (
    <header className="hx" id="top" ref={ref}>
      <div className="hx-in">
        <h1 className="hx-h">Read and answer your Gmail <em>from Telegram.</em></h1>

        <HeroDemo state={state} belowRef={belowRef} />

        <div className="story-wrap" ref={belowRef}>
        <ol className="story" aria-label="What happens, step by step">
          {SCENES.map((sc, i) => (
            <li key={sc.title} className={i === scene ? "on" : i < scene ? "done" : ""}>
              <button
                type="button"
                onClick={() => seek(i)}
                aria-current={i === scene ? "step" : undefined}
                style={{ "--dur": `${(SCENES[i + 1]?.t ?? TOTAL) - sc.t}ms` }}
              >
                <span className="st-n" key={i === scene ? "on" : "off"}><i>{i + 1}</i></span>
                <span className="st-t">
                  <b>{sc.title}</b>
                  <span className="st-x"><span>{sc.text}</span></span>
                </span>
                <span className="st-s">{sc.short}</span>
              </button>
            </li>
          ))}
        </ol>
        {/* phones: only the current step's words, under the row of numbers */}
        <p className="story-cap" key={scene}><b>{SCENES[scene].title}</b>{SCENES[scene].text}</p>
        </div>

        <div className="hx-go">
          <button type="button" className="btn big" onClick={onStart}>
            Set it up free <ArrowRight />
          </button>
          <span className="hx-meta">About 10 minutes · No server · Runs in your own Google account</span>
        </div>
      </div>
    </header>
  );
}
