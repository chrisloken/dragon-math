import type { CSSProperties } from 'react'
import type { Dragon, Reward } from '../game'
import { tableColorClass } from '../game'

interface DragonSpriteProps {
  dragon: Dragon
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

export function DragonSprite({ dragon }: DragonSpriteProps) {
  const flip = dragon.direction === 'rtl'
  const style: CSSProperties = {
    left: `${dragon.x}%`,
    top: `${dragon.yLane}%`,
    transform: `translate(-50%, -50%) scaleX(${flip ? -1 : 1})`,
  }

  return (
    <div
      className={`dragon ${tableColorClass(dragon.table)}`}
      style={style}
      data-id={dragon.id}
      data-table={dragon.table}
    >
      <div className="dragon-body" aria-hidden="true">
        <svg viewBox="0 0 140 80" className="dragon-svg">
          <path
            className="dragon-wing-membrane"
            d="M58 40 L22 6 L42 32 L30 2 L54 34 L48 10 L62 36"
          />
          <path
            className="dragon-wing-bone"
            d="M62 38 L48 10 M62 38 L30 2 M62 38 L22 6"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            className="dragon-tail"
            d="M36 50 C18 44 8 40 2 58 C8 52 16 50 24 52 C28 53 32 52 36 50"
          />
          <path className="dragon-tail-tip" d="M2 58 L0 64 L6 60 Z" />
          <ellipse className="dragon-torso" cx="72" cy="50" rx="30" ry="11" />
          <ellipse className="dragon-head" cx="108" cy="38" rx="13" ry="10" />
          <polygon className="dragon-snout" points="118,38 132,40 118,46" />
          <polygon className="dragon-horn" points="100,30 102,14 108,30" />
          <polygon className="dragon-horn" points="108,28 112,12 118,28" />
          <circle className="dragon-eye" cx="114" cy="36" r="2.2" />
          <circle className="dragon-pupil" cx="114.5" cy="36" r="1" />
        </svg>
      </div>
      <div className="dragon-label" style={{ transform: `scaleX(${flip ? -1 : 1})` }}>
        <span className="dragon-fact">
          {dragon.factA} × {dragon.factB}
        </span>
        <RewardIcon reward={dragon.reward} />
      </div>
    </div>
  )
}
