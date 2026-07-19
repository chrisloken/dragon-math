import type { CSSProperties } from 'react'
import type { Dragon, Reward } from '../game'
import { tableColorClass } from '../game'
import { DragonPuppet } from './DragonPuppet'

interface DragonSpriteProps {
  dragon: Dragon
  teleporting?: boolean
}

function RewardIcon({ reward }: { reward: Reward }) {
  if (reward === 'gem') {
    return (
      <svg className="reward-icon gem" viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="12,2 22,9 18,22 6,22 2,9" fill="currentColor" />
      </svg>
    )
  }
  if (reward === 'gold') {
    return (
      <svg className="reward-icon gold" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="currentColor" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#7a5200">
          $
        </text>
      </svg>
    )
  }
  return (
    <svg className="reward-icon food" viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="14" rx="8" ry="6" fill="currentColor" />
      <circle cx="9" cy="12" r="1.2" fill="#3d2a12" />
      <circle cx="13" cy="11" r="1" fill="#3d2a12" />
      <circle cx="15" cy="14" r="1.1" fill="#3d2a12" />
    </svg>
  )
}

export function DragonSprite({ dragon, teleporting = false }: DragonSpriteProps) {
  const flip = dragon.direction === 'rtl'
  const style: CSSProperties = {
    left: `${dragon.x}%`,
    top: `${dragon.yLane}%`,
    transform: `translate(-50%, -50%) scaleX(${flip ? -1 : 1})`,
  }

  return (
    <div
      className={`dragon ${tableColorClass(dragon.table)}${teleporting ? ' dragon--teleport' : ''}`}
      style={style}
      data-id={dragon.id}
      data-table={dragon.table}
    >
      <div className="dragon-body" aria-hidden="true">
        <DragonPuppet />
        {teleporting && (
          <div className="teleport-burst" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={`teleport-spark teleport-spark--${i}`} />
            ))}
          </div>
        )}
      </div>
      {!teleporting && (
        <div className="dragon-label" style={{ transform: `scaleX(${flip ? -1 : 1})` }}>
          <span className="dragon-fact">
            {dragon.factA} × {dragon.factB}
          </span>
          <RewardIcon reward={dragon.reward} />
        </div>
      )}
    </div>
  )
}
