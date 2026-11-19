import { useCallback, useEffect, useRef } from "react";
import { STEPS } from "./data";
import { scrollToTrack, stepFraction } from "./lib/motion";
import { startSmoothScroll } from "./lib/smoothScroll";
import Hero from "./components/Hero";
import StepDeck from "./components/StepDeck";
import Footer from "./components/Footer";
import Features from "./components/Features";
import { UpdateToast } from "./components/ScriptViewer";
import "./index.css";

export default function App() {
  const trackRef = useRef(null);

  useEffect(() => startSmoothScroll(), []);

  // Any card (hero orbit or deck) scrolls the deck to its step.
  const goToStep = useCallback((i) => {
    if (trackRef.current) scrollToTrack(trackRef.current, stepFraction(i, STEPS.length));
  }, []);

  return (
    <>
      <Hero onSelectStep={goToStep} />
      <StepDeck trackRef={trackRef} onSelectStep={goToStep} />
      <Features />
      <Footer />
      <UpdateToast onOpen={() => goToStep(STEPS.findIndex((s) => s.showScript))} />
    </>
  );
}
