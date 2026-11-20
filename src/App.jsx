import { useCallback, useEffect, useState } from "react";
import { STEPS } from "./data";
import { scrollToY, startSmoothScroll } from "./lib/smoothScroll";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Setup from "./components/Setup";
import Faq from "./components/Faq";
import LatestVersion from "./components/LatestVersion";
import Footer from "./components/Footer";
import { UpdateToast } from "./components/ScriptViewer";
import TapRipple from "./components/TapRipple";
import "./index.css";
import "./site.css";

export default function App() {
  // asks the setup chat to show a step (n changes each time so the same step can be asked twice)
  const [focus, setFocus] = useState({ i: 0, n: 0 });

  useEffect(() => startSmoothScroll(), []);

  // Opens a setup step and scrolls the guide into view.
  const goToStep = useCallback((i) => {
    setFocus({ i, n: Date.now() });
    const el = document.getElementById("setup");
    if (el) scrollToY(window.scrollY + el.getBoundingClientRect().top);
  }, []);
  const start = useCallback(() => goToStep(-1), [goToStep]); // -1 = wherever they got to

  return (
    <>
      <Nav />
      <main>
        <Hero onStart={start} />
        <HowItWorks />
        <Setup focus={focus} />
        <Faq />
        <LatestVersion />
      </main>
      <Footer />
      <TapRipple />
      <UpdateToast onOpen={() => goToStep(STEPS.findIndex((s) => s.showScript))} />
    </>
  );
}
