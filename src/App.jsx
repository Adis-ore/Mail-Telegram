import { useCallback, useEffect, useRef } from "react";
import { STEPS } from "./data";
import { scrollToTrack, stepFraction } from "./lib/motion";
import { startSmoothScroll } from "./lib/smoothScroll";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import StepDeck from "./components/StepDeck";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import { UpdateToast } from "./components/ScriptViewer";
import "./index.css";
import "./site.css";

export default function App() {
  const trackRef = useRef(null);

  useEffect(() => startSmoothScroll(), []);

  // Scrolls the setup deck to a step's card.
  const goToStep = useCallback((i) => {
    if (trackRef.current) scrollToTrack(trackRef.current, stepFraction(i, STEPS.length));
  }, []);
  const start = useCallback(() => goToStep(0), [goToStep]);

  return (
    <>
      <Nav onStart={start} />
      <main>
        <Hero onStart={start} />
        <HowItWorks />
        <Features />
        <StepDeck trackRef={trackRef} onSelectStep={goToStep} />
        <Faq />
      </main>
      <Footer />
      <UpdateToast onOpen={() => goToStep(STEPS.findIndex((s) => s.showScript))} />
    </>
  );
}
