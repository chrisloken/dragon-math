import { useEffect } from 'react'
import { tableColorClass, type TableFactor } from '../game'

interface EggToastProps {
  table: TableFactor
  onDismiss: () => void
}

export function EggToast({ table, onDismiss }: EggToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 2000)
    return () => window.clearTimeout(id)
  }, [table, onDismiss])

  return (
    <div className="egg-toast" role="status">
      <div className={`egg-sprite ${tableColorClass(table)}`} aria-hidden="true" />
      <div className="egg-toast-text">
        <strong>New egg!</strong>
        <span>You mastered the ×{table} facts</span>
      </div>
    </div>
  )
}
