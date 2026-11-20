import HeroDemo from "./HeroDemo";

/** Says what the product is in one line, then shows it working. */
export default function Hero() {
  return (
    <header className="hx" id="top">
      <div className="hx-in">
        <div className="hx-copy">
          <h1>Read and answer your Gmail <em>from Telegram.</em></h1>
        </div>
        <HeroDemo />
      </div>
    </header>
  );
}
