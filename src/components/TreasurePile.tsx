import { tableColorClass, type TableFactor } from '../game'

export interface PilePiece {
  id: string
  kind: 'gem' | 'gold'
  /** Position inside the pile, percent (left / bottom). Frozen at spawn. */
  left: number
  bottom: number
  rotate: number
}

interface TreasurePileProps {
  pieces: PilePiece[]
  specialGems?: TableFactor[]
  celebrating?: boolean
}

/** Deterministic jitter for special-gem placement only. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function TreasurePile({
  pieces = [],
  specialGems = [],
  celebrating = false,
}: TreasurePileProps) {
  const total = pieces.length + specialGems.length * 8
  const moundHeight = Math.min(1, 0.25 + total / 100)
  const maxVisible = 280
  const visible = pieces.length > maxVisible ? pieces.slice(-maxVisible) : pieces

  return (
    <div
      className={`treasure-pile${celebrating ? ' treasure-pile--victory' : ''}`}
      aria-live="polite"
    >
      {celebrating && (
        <div className="treasure-victory-fx" aria-hidden="true">
          <span className="treasure-victory-halo treasure-victory-halo--1" />
          <span className="treasure-victory-halo treasure-victory-halo--2" />
          <span className="treasure-victory-halo treasure-victory-halo--3" />
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="treasure-victory-ray"
              style={{ ['--ray-i' as string]: String(i) }}
            />
          ))}
        </div>
      )}
      <div className="treasure-stack">
        {visible.map((item) => (
          <span
            key={item.id}
            className={`treasure-piece ${item.kind}`}
            style={{
              left: `${item.left}%`,
              bottom: `${item.bottom}%`,
              transform: `rotate(${item.rotate}deg)`,
            }}
            aria-hidden="true"
          />
        ))}

        {specialGems.map((table, i) => {
          const j = jitter(table * 97 + i * 13)
          const j2 = jitter(table * 53 + i * 19)
          const n = Math.max(1, specialGems.length)
          // Nest crystals into the mound: low, centered, slight fan.
          const spread =
            n === 1 ? 50 + (j - 0.5) * 8 : 32 + (i / (n - 1)) * 36 + (j - 0.5) * 5
          const bottom = 8 + j2 * 10 + Math.min(18, moundHeight * 14)
          return (
            <span
              key={`special-${table}`}
              className={`treasure-piece treasure-special ${tableColorClass(table)}`}
              style={{
                left: `${Math.min(88, Math.max(12, spread))}%`,
                bottom: `${Math.min(42, bottom)}%`,
                transform: `rotate(${(j - 0.5) * 22}deg)`,
              }}
              title={`×${table} crystal`}
              aria-label={`×${table} crystal gem`}
            />
          )
        })}
      </div>
    </div>
  )
}
