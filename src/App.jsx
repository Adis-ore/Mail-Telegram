import { useCallback, useEffect, useState } from "react";
import { STEPS } from "./data";
import { scrollToY, startSmoothScroll } from "./lib/smoothScroll";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Setup from "./components/Setup";
import Faq from "./components/Faq";
import LatestVersion from "./components/LatestVersion";
import Footer from "./components/Footer";
import { UpdateToast } from "./components/ScriptViewer";
import TapRipple from "./components/TapRipple";
import "./index.css";
import "./site.css";

const STEP_KEY = "setupStep";
const savedStep = () => {
  try { const v = Number(localStorage.getItem(STEP_KEY)); return v >= 0 && v < STEPS.length ? v : 0; } catch { return 0; }
};

export default function App() {
  const [step, setStep] = useState(savedStep);

  useEffect(() => startSmoothScroll(), []);
  useEffect(() => {
    try { localStorage.setItem(STEP_KEY, String(step)); } catch { /* storage blocked */ }
  }, [step]);

  // Opens a setup step and scrolls the guide into view.
  const goToStep = useCallback((i) => {
    setStep(i);
    const el = document.getElementById("setup");
    if (el) scrollToY(window.scrollY + el.getBoundingClientRect().top - 80);
  }, []);
  const start = useCallback(() => goToStep(0), [goToStep]);

  return (
    <>
      <Nav />
      <main>
        <Hero onStart={start} />
        <HowItWorks />
        <Features />
        <Setup step={step} onStep={setStep} />
        <Faq />
        <LatestVersion />
      </main>
      <Footer />
      <TapRipple />
      <UpdateToast onOpen={() => goToStep(STEPS.findIndex((s) => s.showScript))} />
    </>
  );
}
