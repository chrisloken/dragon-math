import type { CSSProperties } from 'react'

interface TreasurePileProps {
  gems: number
  gold: number
}

/** Deterministic jitter so pieces don't reshuffle on every render. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function TreasurePile({ gems, gold }: TreasurePileProps) {
  const items: { key: string; kind: 'gem' | 'gold'; seed: number }[] = []
  for (let i = 0; i < gems; i++) items.push({ key: `gem-${i}`, kind: 'gem', seed: i * 2 + 1 })
  for (let i = 0; i < gold; i++) items.push({ key: `gold-${i}`, kind: 'gold', seed: i * 2 + 2 })

  const total = items.length
  const maxVisible = 280
  const visible = items.slice(-maxVisible)

  const moundHeight = Math.min(1, 0.2 + total / 90)
  const pieceScale = Math.min(1.35, 0.85 + total / 200)

  return (
    <div
      className="treasure-pile"
      aria-live="polite"
      style={
        {
          ['--treasure-mound' as string]: String(moundHeight),
          ['--treasure-scale' as string]: String(pieceScale),
        } as CSSProperties
      }
    >
      <div className="treasure-stack">
        {visible.map((item, index) => {
          const j = jitter(item.seed)
          const j2 = jitter(item.seed + 17)
          const x = (index / Math.max(1, visible.length - 1)) * 100
          const centerBias = 1 - Math.abs(x - 50) / 50
          const row = Math.floor(index / Math.max(12, Math.ceil(visible.length / 8)))
          const bottomPct =
            (row * 7 + j * 6) * moundHeight * centerBias * 0.85 + j2 * 4 * moundHeight

          return (
            <span
              key={item.key}
              className={`treasure-piece ${item.kind}`}
              style={{
                left: `${Math.min(98, Math.max(1, x + (j - 0.5) * 4))}%`,
                bottom: `${Math.min(92, bottomPct)}%`,
                transform: `scale(${pieceScale}) rotate(${(j - 0.5) * 40}deg)`,
              }}
              aria-hidden="true"
            />
          )
        })}
      </div>
      <p className="treasure-count">
        {gems} gems · {gold} gold
      </p>
    </div>
  )
}
