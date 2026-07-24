import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LOOT_FALL_MS } from '../game'

export interface LootDrop {
  id: string
  kind: 'gem' | 'gold'
  /** Dragon position as % of the dragon layer. */
  x: number
  yLane: number
  /** Stagger start so multi-piece bursts fan out. */
  delayMs: number
  /** Exact pile landing spot (matches TreasurePile piece coords). */
  landLeft: number
  landBottom: number
  landRotate: number
}

interface LootFallProps {
  drops: LootDrop[]
  onDropComplete: (id: string) => void
}

interface LootFallPieceProps {
  drop: LootDrop
  onComplete: (id: string) => void
}

function LootFallPiece({ drop, onComplete }: LootFallPieceProps) {
  const elRef = useRef<HTMLSpanElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useLayoutEffect(() => {
    const el = elRef.current
    const layer =
      document.querySelector('.dragon-layer') ?? document.querySelector('.playfield')
    const pile = document.querySelector('.treasure-pile')

    if (!el || !(layer instanceof HTMLElement) || !(pile instanceof HTMLElement)) {
      onCompleteRef.current(drop.id)
      return
    }

    const layerRect = layer.getBoundingClientRect()
    const pileRect = pile.getBoundingClientRect()
    const fromX = layerRect.left + (drop.x / 100) * layerRect.width
    const fromY = layerRect.top + (drop.yLane / 100) * layerRect.height
    // Match .treasure-piece: left% + margin-centered, bottom% from pile bottom.
    const toX = pileRect.left + (drop.landLeft / 100) * pileRect.width
    const toY =
      pileRect.top + pileRect.height * (1 - drop.landBottom / 100) - 9
    const drift = (drop.kind === 'gem' ? -1 : 1) * (10 + (drop.delayMs % 20))
    const midX = fromX + (toX - fromX) * 0.42 + drift
    const midY = Math.min(fromY, toY) - (44 + (drop.delayMs % 28))
    const spin = drop.landRotate + (drop.kind === 'gem' ? 90 : 150)

    el.style.transform = `translate(${fromX}px, ${fromY}px) scale(1.15) rotate(${drop.landRotate - 20}deg)`
    el.style.opacity = '1'

    let anim: Animation | null = null
    const timer = window.setTimeout(() => {
      anim = el.animate(
        [
          {
            transform: `translate(${fromX}px, ${fromY}px) scale(1.2) rotate(${drop.landRotate - 20}deg)`,
            opacity: 1,
          },
          {
            transform: `translate(${midX}px, ${midY}px) scale(1.05) rotate(${spin * 0.5}deg)`,
            opacity: 1,
            offset: 0.55,
          },
          {
            transform: `translate(${toX}px, ${toY}px) scale(1) rotate(${drop.landRotate}deg)`,
            opacity: 1,
          },
        ],
        {
          duration: LOOT_FALL_MS,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
          fill: 'forwards',
        },
      )
      anim.onfinish = () => onCompleteRef.current(drop.id)
    }, drop.delayMs)

    return () => {
      window.clearTimeout(timer)
      anim?.cancel()
    }
  }, [drop])

  return (
    <span
      ref={elRef}
      className={`loot-fall-piece loot-fall-piece--${drop.kind}`}
    />
  )
}

/**
 * Gem/gold pieces that arc from a collected dragon into the treasure pile.
 */
export function LootFall({ drops, onDropComplete }: LootFallProps) {
  if (drops.length === 0) return null

  return createPortal(
    <div className="loot-fall-layer" aria-hidden="true">
      {drops.map((drop) => (
        <LootFallPiece key={drop.id} drop={drop} onComplete={onDropComplete} />
      ))}
    </div>,
    document.body,
  )
}
