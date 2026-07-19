import { accuracyPercent, DRAGONS_PER_ROUND_QUOTA, type RoundStats } from '../game'

interface RoundSummaryModalProps {
  round: number
  stats: RoundStats
  onContinue: () => void
}

export function RoundSummaryModal({ round, stats, onContinue }: RoundSummaryModalProps) {
  const percent = accuracyPercent(stats.correct, DRAGONS_PER_ROUND_QUOTA)

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="round-summary-title">
      <div className="modal-card modal-card--wide">
        <h2 id="round-summary-title">You've beaten Round {round}!</h2>
        <ul className="summary-stats">
          <li>
            <span className="summary-label">Facts answered</span>
            <span className="summary-value">
              {stats.correct} / {DRAGONS_PER_ROUND_QUOTA} ({percent}%)
            </span>
          </li>
          <li>
            <span className="summary-label">Incorrect tries</span>
            <span className="summary-value">{stats.incorrect}</span>
          </li>
          <li>
            <span className="summary-label">Gems collected</span>
            <span className="summary-value summary-gem">{stats.gems}</span>
          </li>
          <li>
            <span className="summary-label">Gold collected</span>
            <span className="summary-value summary-gold">{stats.gold}</span>
          </li>
          <li>
            <span className="summary-label">Food collected</span>
            <span className="summary-value summary-food">{stats.food}</span>
          </li>
        </ul>
        <button type="button" className="modal-button" onClick={onContinue} autoFocus>
          Start Round {round + 1}
        </button>
      </div>
    </div>
  )
}
