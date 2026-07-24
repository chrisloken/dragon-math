import type { TableFactor } from '../game'
import { tableColorClass } from '../game'

interface InventoryBadgeProps {
  gems: number
  gold: number
  specialGems?: TableFactor[]
}

export function InventoryBadge({
  gems,
  gold,
  specialGems = [],
}: InventoryBadgeProps) {
  return (
    <div className="inventory-badge" aria-live="polite">
      <p className="inventory-row">
        <span className="inventory-icon gem" aria-hidden="true" />
        <span className="inventory-label">Gems</span>
        <span className="inventory-value">{gems}</span>
      </p>
      <p className="inventory-row">
        <span className="inventory-icon gold" aria-hidden="true" />
        <span className="inventory-label">Gold</span>
        <span className="inventory-value">{gold}</span>
      </p>
      {specialGems.length > 0 && (
        <div className="special-gems" aria-label="Crystal gems collected">
          {specialGems.map((table) => (
            <span
              key={table}
              className={`special-gem ${tableColorClass(table)}`}
              title={`×${table} crystal`}
              aria-label={`×${table} crystal gem`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
