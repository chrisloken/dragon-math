import {
  computeAnswer,
  factKey,
  formatFact,
  modeLabel,
  modeSymbol,
  operandMax,
  type FactCorrectCounts,
  type GameMode,
} from '../game'

interface FactsGridProps {
  mode: GameMode
  factCounts: FactCorrectCounts
  onClose: () => void
}

export function FactsGrid({ mode, factCounts, onClose }: FactsGridProps) {
  const max = operandMax(mode)
  const symbol = modeSymbol(mode)
  const totalFacts =
    mode === 'subtraction' ? (max * (max + 1)) / 2 : max * max
  const mastered = Object.values(factCounts).filter((n) => n >= 1).length

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="facts-grid-title">
      <div className={`modal-card modal-card--grid${max > 10 ? ' modal-card--grid-wide' : ''}`}>
        <div className="facts-grid-header">
          <h2 id="facts-grid-title">{modeLabel(mode)} facts</h2>
          <p className="facts-grid-progress">
            {mastered} / {totalFacts} answered correctly
          </p>
          <button type="button" className="modal-button modal-button--small" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="facts-grid-wrap">
          <div
            className={`facts-grid${max > 10 ? ' facts-grid--wide' : ''}`}
            role="grid"
            aria-label={`${modeLabel(mode)} facts 1 through ${max}`}
            style={{ ['--fact-max' as string]: String(max) }}
          >
            <div className="facts-grid-corner" aria-hidden="true" />
            {Array.from({ length: max }, (_, i) => (
              <div key={`col-${i + 1}`} className="facts-grid-axis" aria-hidden="true">
                {i + 1}
              </div>
            ))}
            {Array.from({ length: max }, (_, row) => {
              const a = row + 1
              return (
                <div key={`row-${a}`} className="facts-grid-row-contents">
                  <div className="facts-grid-axis" aria-hidden="true">
                    {a}
                  </div>
                  {Array.from({ length: max }, (_, col) => {
                    const b = col + 1
                    if (mode === 'subtraction' && a < b) {
                      return (
                        <div
                          key={`empty-${a}-${b}`}
                          className="facts-cell facts-cell--empty"
                          aria-hidden="true"
                        />
                      )
                    }
                    const key = factKey(mode, a, b)
                    const count = factCounts[key] ?? 0
                    const done = count >= 1
                    const answer = computeAnswer(mode, a, b)
                    return (
                      <div
                        key={key}
                        role="gridcell"
                        className={`facts-cell ${done ? 'facts-cell--done' : ''} ${count >= 3 ? 'facts-cell--hot' : ''}`}
                        title={`${formatFact(mode, a, b)} = ${answer} · correct ${count}×`}
                        aria-label={`${a} ${symbol} ${b}, answered correctly ${count} times`}
                      >
                        <span className="facts-cell-fact">
                          {a}
                          {symbol}
                          {b}
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
