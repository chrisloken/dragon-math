import { useEffect } from 'react'
import { tableColorClass, type TableFactor } from '../game'

interface EggToastProps {
  table: TableFactor
  symbol?: string
  onDismiss: () => void
}

export function EggToast({ table, symbol = '×', onDismiss }: EggToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 2000)
    return () => window.clearTimeout(id)
  }, [table, onDismiss])

  return (
    <div className="egg-toast" role="status">
      <div className={`egg-sprite ${tableColorClass(table)}`} aria-hidden="true" />
      <div className="egg-toast-text">
        <strong>New egg!</strong>
        <span>
          You mastered the {symbol}
          {table} facts
        </span>
      </div>
    </div>
  )
}
