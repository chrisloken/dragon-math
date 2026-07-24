/**
 * Full-game victory banner shown when every table gem is owned
 * and every pet dragon is level 10.
 */
export function VictoryBanner() {
  return (
    <div
      className="victory-banner"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="victory-banner-glow" aria-hidden="true" />
      <div className="victory-banner-card">
        <h2 id="victory-title" className="victory-title">
          Congratulations!
        </h2>
        <p className="victory-message">
          You&apos;ve mastered the dragons and your multiplication tables!
        </p>
      </div>
    </div>
  )
}
