import { RAIN_GEM_COST } from '../game'

interface RainButtonProps {
  gems: number
  canCast: boolean
  raining: boolean
  onCast: () => void
  disabled?: boolean
}

export function RainButton({
  gems,
  canCast,
  raining,
  onCast,
  disabled,
}: RainButtonProps) {
  const affordable = gems >= RAIN_GEM_COST
  const isDisabled = disabled || raining || !canCast || !affordable

  let hint = `Spend ${RAIN_GEM_COST} gems to rain food on your pets`
  if (!canCast) hint = 'Hatch a pet dragon to use rain'
  else if (!affordable) hint = `Need ${RAIN_GEM_COST} gems`
  else if (raining) hint = 'Raining…'

  return (
    <div className="rain-button-wrap">
      <button
        type="button"
        className="rain-button"
        onMouseDown={(e) => {
          // Prevent answer input from stealing focus before the click fires.
          e.preventDefault()
        }}
        onClick={onCast}
        disabled={isDisabled}
        title={hint}
        aria-label={hint}
      >
        <span className="rain-button-icon" aria-hidden="true" />
        <span className="rain-button-label">Rain</span>
        <span className="rain-button-cost">
          <span className="rain-button-gem" aria-hidden="true" />
          {RAIN_GEM_COST}
        </span>
      </button>
      {isDisabled && !disabled && !raining && (
        <p className="rain-button-hint">
          {!canCast ? 'Need a hatched pet' : !affordable ? `Need ${RAIN_GEM_COST} gems` : null}
        </p>
      )}
    </div>
  )
}
