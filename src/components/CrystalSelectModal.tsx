import {
  CRYSTAL_MIN_LEVEL,
  modeSymbol,
  tableColorClass,
  type GameMode,
  type Pet,
  type TableFactor,
} from '../game'

interface CrystalSelectModalProps {
  mode: GameMode
  options: TableFactor[]
  pets: Pet[]
  onSelect: (table: TableFactor) => void
  onSkip: () => void
}

/**
 * Between-round picker: attempt one crystal stage (pet level ≥ 3, gem not owned).
 */
export function CrystalSelectModal({
  mode,
  options,
  pets,
  onSelect,
  onSkip,
}: CrystalSelectModalProps) {
  const symbol = modeSymbol(mode)
  const levelFor = (table: TableFactor) =>
    pets.find((p) => p.table === table && p.hatched)?.level ?? CRYSTAL_MIN_LEVEL

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crystal-select-title"
    >
      <div className="modal-card modal-card--wide crystal-select-card">
        <h2 id="crystal-select-title">Crystal Challenge</h2>
        <p className="crystal-select-lead">
          Pick one gem to attempt. You can try another after the next round.
        </p>

        <ul className="crystal-select-list">
          {options.map((table) => (
            <li key={table}>
              <button
                type="button"
                className={`crystal-select-option ${tableColorClass(table)}`}
                onClick={() => onSelect(table)}
              >
                <span className="crystal-select-gem" aria-hidden="true" />
                <span className="crystal-select-copy">
                  <span className="crystal-select-name">
                    {symbol}
                    {table} crystal
                  </span>
                  <span className="crystal-select-meta">Pet level {levelFor(table)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="modal-button modal-button--ghost" onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
