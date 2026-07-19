interface RoundProgressProps {
  spawned: number
  total: number
}

export function RoundProgress({ spawned, total }: RoundProgressProps) {
  return (
    <div className="round-progress" aria-live="polite">
      <span className="round-progress-label">Dragons</span>
      <span className="round-progress-value">
        {spawned}&nbsp;/&nbsp;{total}
      </span>
    </div>
  )
}
