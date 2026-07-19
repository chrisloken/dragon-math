import { FACT_MAX, factKey, type FactCorrectCounts } from '../game'

interface FactsGridProps {
  factCounts: FactCorrectCounts
  onClose: () => void
}

export function FactsGrid({ factCounts, onClose }: FactsGridProps) {
  const mastered = Object.values(factCounts).filter((n) => n >= 1).length

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="facts-grid-title">
      <div className="modal-card modal-card--grid">
        <div className="facts-grid-header">
          <h2 id="facts-grid-title">Math facts</h2>
          <p className="facts-grid-progress">
            {mastered} / 100 answered correctly
          </p>
          <button type="button" className="modal-button modal-button--small" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="facts-grid-wrap">
          <div className="facts-grid" role="grid" aria-label="Multiplication facts 1 through 10">
            <div className="facts-grid-corner" aria-hidden="true" />
            {Array.from({ length: FACT_MAX }, (_, i) => (
              <div key={`col-${i + 1}`} className="facts-grid-axis" aria-hidden="true">
                {i + 1}
              </div>
            ))}
            {Array.from({ length: FACT_MAX }, (_, row) => {
              const a = row + 1
              return (
                <div key={`row-${a}`} className="facts-grid-row-contents">
                  <div className="facts-grid-axis" aria-hidden="true">
                    {a}
                  </div>
                  {Array.from({ length: FACT_MAX }, (_, col) => {
                    const b = col + 1
                    const count = factCounts[factKey(a, b)] ?? 0
                    const done = count >= 1
                    return (
                      <div
                        key={factKey(a, b)}
                        role="gridcell"
                        className={`facts-cell ${done ? 'facts-cell--done' : ''} ${count >= 3 ? 'facts-cell--hot' : ''}`}
                        title={`${a} × ${b} = ${a * b} · correct ${count}×`}
                        aria-label={`${a} times ${b}, answered correctly ${count} times`}
                      >
                        <span className="facts-cell-fact">
                          {a}×{b}
                        </span>
                        <span className="facts-cell-count">{count}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
