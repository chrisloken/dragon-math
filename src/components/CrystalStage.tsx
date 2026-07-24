import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  CRYSTAL_MELD_VFX_MS,
  CRYSTAL_SHARD_DURATION_MS,
  CRYSTAL_WIN_BURST_MS,
  CRYSTAL_WIN_FALL_MS,
  formatFact,
  modeSymbol,
  tableColorClass,
  type CrystalShard,
  type GameMode,
  type TableFactor,
} from '../game'
import { AnswerInput } from './AnswerInput'

interface CrystalStageProps {
  mode: GameMode
  table: TableFactor
  shards: CrystalShard[]
  outcome: 'pending' | 'won' | 'lost' | null
  onSubmit: (value: string) => void
  onMiss: () => void
  onShardDocked: (id: string) => void
  onFlourishComplete: () => void
}

/** Edge spawn positions as percentages of the stage field. */
const SPAWN_POINTS: { x: number; y: number }[] = [
  { x: 8, y: 12 },
  { x: 50, y: 8 },
  { x: 92, y: 12 },
  { x: 94, y: 38 },
  { x: 94, y: 62 },
  { x: 92, y: 88 },
  { x: 50, y: 92 },
  { x: 8, y: 88 },
  { x: 6, y: 62 },
  { x: 6, y: 38 },
]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function CrystalStage({
  mode,
  table,
  shards,
  outcome,
  onSubmit,
  onMiss,
  onShardDocked,
  onFlourishComplete,
}: CrystalStageProps) {
  const colorClass = tableColorClass(table)
  const symbol = modeSymbol(mode)
  const pieceTotal = shards.length
  const inputDisabled = outcome !== 'pending'
  const meldedCount = shards.filter(
    (s) => s.status === 'melded' || s.status === 'melding',
  ).length
  const fullyMeldedCount = shards.filter((s) => s.status === 'melded').length

  const fieldRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const shardElsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const shardsRef = useRef(shards)
  const outcomeRef = useRef(outcome)
  const progressRef = useRef<Record<string, number>>({})
  const meldTweenRef = useRef<Record<string, { from: number; startedAt: number }>>({})
  const claimedRef = useRef(new Set<string>())
  const dockedSentRef = useRef(new Set<string>())
  const missSentRef = useRef(false)
  const stageKeyRef = useRef<string | null>(null)
  const onMissRef = useRef(onMiss)
  const onDockedRef = useRef(onShardDocked)
  const onFlourishRef = useRef(onFlourishComplete)
  const [fallStyle, setFallStyle] = useState<CSSProperties | null>(null)
  const [winPhase, setWinPhase] = useState<'idle' | 'burst' | 'falling'>('idle')
  const fallingGemRef = useRef<HTMLDivElement>(null)

  shardsRef.current = shards
  outcomeRef.current = outcome
  onMissRef.current = onMiss
  onDockedRef.current = onShardDocked
  onFlourishRef.current = onFlourishComplete

  const setShardEl = (id: string, node: HTMLDivElement | null) => {
    if (node) shardElsRef.current.set(id, node)
    else shardElsRef.current.delete(id)
  }

  // Reset motion state only when a brand-new crystal stage starts
  useEffect(() => {
    const stageKey = `${table}:${shards.map((s) => s.id).join(',')}`
    if (stageKeyRef.current === stageKey) return
    stageKeyRef.current = stageKey

    const next: Record<string, number> = {}
    for (const s of shards) next[s.id] = 0
    progressRef.current = next
    meldTweenRef.current = {}
    claimedRef.current = new Set()
    dockedSentRef.current = new Set()
    missSentRef.current = false
  }, [table, shards])

  // Keep claimed + tweens in sync when parent marks shards as melding
  useEffect(() => {
    const now = performance.now()
    for (const s of shards) {
      if (s.status === 'melding' || s.status === 'melded') {
        claimedRef.current.add(s.id)
      }
      if (s.status === 'melding' && !meldTweenRef.current[s.id]) {
        meldTweenRef.current[s.id] = {
          from: progressRef.current[s.id] ?? 0,
          startedAt: now,
        }
      }
      if (s.status === 'melded') {
        progressRef.current[s.id] = 1
        dockedSentRef.current.add(s.id)
      }
    }
  }, [shards])

  // Smooth RAF motion — keep loop alive across shard status updates (refs only)
  useEffect(() => {
    if (outcome !== 'pending') return

    let frame = 0
    let last = performance.now()
    const durationSec = CRYSTAL_SHARD_DURATION_MS / 1000
    const meldMs = CRYSTAL_MELD_VFX_MS
    const CENTER = { x: 50, y: 46 }

    const placeShard = (shard: CrystalShard, progress: number) => {
      const el = shardElsRef.current.get(shard.id)
      if (!el) return

      const spawn = SPAWN_POINTS[shard.corner % SPAWN_POINTS.length]!
      const t = Math.min(1, Math.max(0, progress))
      const x = lerp(spawn.x, CENTER.x, t)
      const y = lerp(spawn.y, CENTER.y, t)
      const rot = lerp(
        (shard.corner * 360) / Math.max(pieceTotal, 1) - 40,
        (shard.corner * 360) / Math.max(pieceTotal, 1),
        t,
      )
      const scale = lerp(1.35, 0.62, t)

      el.style.left = `${x}%`
      el.style.top = `${y}%`
      el.style.setProperty('--shard-rot', `${rot}deg`)
      el.style.setProperty('--shard-scale', String(scale))
    }

    const ensureTween = (id: string, now: number) => {
      if (!meldTweenRef.current[id]) {
        meldTweenRef.current[id] = {
          from: progressRef.current[id] ?? 0,
          startedAt: now,
        }
      }
      return meldTweenRef.current[id]!
    }

    const completeDock = (id: string) => {
      if (dockedSentRef.current.has(id)) return
      dockedSentRef.current.add(id)
      progressRef.current[id] = 1
      onDockedRef.current(id)
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (outcomeRef.current === 'pending') {
        for (const shard of shardsRef.current) {
          if (shard.status === 'melded' || shard.status === 'missed') continue

          const claimed = claimedRef.current.has(shard.id)
          let progress = progressRef.current[shard.id] ?? 0

          if (shard.status === 'incoming' && !claimed) {
            progress = Math.min(1, progress + dt / durationSec)
            progressRef.current[shard.id] = progress
            placeShard(shard, progress)
            if (progress >= 1 && !missSentRef.current) {
              missSentRef.current = true
              onMissRef.current()
            }
          } else if (shard.status === 'melding' || claimed) {
            claimedRef.current.add(shard.id)
            const tween = ensureTween(shard.id, now)
            const t = Math.min(1, (now - tween.startedAt) / meldMs)
            progress = lerp(tween.from, 1, easeOutCubic(t))
            progressRef.current[shard.id] = progress
            placeShard(shard, progress)
            if (t >= 1) completeDock(shard.id)
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    // Place at spawn after layout, then start the loop
    frame = requestAnimationFrame((now) => {
      last = now
      for (const shard of shardsRef.current) {
        if (shard.status !== 'melded') {
          placeShard(shard, progressRef.current[shard.id] ?? 0)
        }
      }
      frame = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frame)
  }, [outcome, table])

  // Win flourish: burst, then gem falls into the treasure pile
  useEffect(() => {
    if (outcome !== 'won') {
      setWinPhase('idle')
      setFallStyle(null)
      return
    }

    setWinPhase('burst')
    const timers: number[] = []

    timers.push(
      window.setTimeout(() => {
        const core = coreRef.current
        const pile =
          document.querySelector('.treasure-pile') ??
          document.querySelector('.inventory-badge')
        if (!(core instanceof HTMLElement) || !(pile instanceof HTMLElement)) {
          onFlourishRef.current()
          return
        }

        const from = core.getBoundingClientRect()
        const to = pile.getBoundingClientRect()
        const fromX = from.left + from.width / 2
        const fromY = from.top + from.height / 2
        const toX = to.left + to.width / 2
        const toY = to.top + to.height * 0.45
        const midX = (fromX + toX) / 2
        const midY = Math.min(fromY, toY) - 90

        setFallStyle({
          transform: `translate(${fromX}px, ${fromY}px) scale(1.35) rotate(-12deg)`,
        })
        setWinPhase('falling')

        timers.push(
          window.setTimeout(() => {
            const gem = fallingGemRef.current
            if (!gem) {
              onFlourishRef.current()
              return
            }
            const anim = gem.animate(
              [
                {
                  transform: `translate(${fromX}px, ${fromY}px) scale(1.35) rotate(-12deg)`,
                  opacity: 1,
                  filter: 'brightness(1.45)',
                },
                {
                  transform: `translate(${midX}px, ${midY}px) scale(1.1) rotate(16deg)`,
                  opacity: 1,
                  filter: 'brightness(1.25)',
                  offset: 0.55,
                },
                {
                  transform: `translate(${toX}px, ${toY}px) scale(0.8) rotate(6deg)`,
                  opacity: 0.15,
                  filter: 'brightness(1)',
                },
              ],
              {
                duration: CRYSTAL_WIN_FALL_MS,
                easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                fill: 'forwards',
              },
            )
            anim.onfinish = () => onFlourishRef.current()
          }, 30),
        )
      }, CRYSTAL_WIN_BURST_MS),
    )

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [outcome])

  let statusText = `Assemble the ${symbol}${table} crystal — answer all ${pieceTotal} facts!`
  if (outcome === 'won' && winPhase === 'burst') {
    statusText = `${symbol}${table} crystal complete!`
  }
  if (outcome === 'won' && winPhase === 'falling') {
    statusText = `Treasure secured!`
  }
  if (outcome === 'lost') statusText = `The crystal shattered — try again after another round.`

  return (
    <div
      className={`crystal-stage ${colorClass}${outcome === 'won' ? ' crystal-stage--won' : ''}${outcome === 'lost' ? ' crystal-stage--lost' : ''}${winPhase === 'burst' ? ' crystal-stage--burst' : ''}${winPhase === 'falling' ? ' crystal-stage--falling' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crystal-stage-title"
    >
      <div className="crystal-stage-aura" aria-hidden="true" />
      <div className="crystal-stage-sparks" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="crystal-spark"
            style={{
              left: `${8 + ((i * 17) % 84)}%`,
              top: `${12 + ((i * 29) % 70)}%`,
              animationDelay: `${(i % 9) * 0.35}s`,
            }}
          />
        ))}
      </div>

      {winPhase === 'burst' && (
        <div className="crystal-win-burst" aria-hidden="true">
          <span className="crystal-win-ring crystal-win-ring--1" />
          <span className="crystal-win-ring crystal-win-ring--2" />
          <span className="crystal-win-ring crystal-win-ring--3" />
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              className="crystal-win-spark"
              style={{ ['--spark-i' as string]: String(i) }}
            />
          ))}
        </div>
      )}

      {winPhase === 'falling' &&
        fallStyle &&
        createPortal(
          <div
            ref={fallingGemRef}
            className={`crystal-falling-gem ${colorClass}`}
            style={fallStyle}
            aria-hidden="true"
          />,
          document.body,
        )}

      <div className="crystal-stage-header">
        <h2 id="crystal-stage-title" className="crystal-stage-title">
          Crystal Challenge · {symbol}
          {table}
        </h2>
        <p className="crystal-stage-status">{statusText}</p>
        <p className="crystal-stage-progress">
          {Math.max(meldedCount, fullyMeldedCount)} / {pieceTotal} pieces
        </p>
      </div>

      <div className="crystal-stage-field" ref={fieldRef}>
        <div
          ref={coreRef}
          className={`crystal-core ${colorClass}${fullyMeldedCount === pieceTotal ? ' crystal-core--complete' : ''}${winPhase === 'burst' ? ' crystal-core--win-burst' : ''}${winPhase === 'falling' ? ' crystal-core--departed' : ''}`}
          aria-hidden="true"
          style={{ ['--facet-count' as string]: String(Math.max(pieceTotal, 1)) }}
        >
          {shards.map((shard) => (
            <span
              key={`slot-${shard.id}`}
              className={`crystal-facet${shard.status === 'melded' ? ' is-filled' : ''}${shard.status === 'melding' ? ' is-awaiting' : ''}`}
              style={{ ['--facet-i' as string]: String(shard.corner) }}
            />
          ))}
          <span className="crystal-core-glow" />
        </div>

        {shards.map((shard) => {
          if (shard.status === 'melded') return null
          const spawn = SPAWN_POINTS[shard.corner % SPAWN_POINTS.length]!
          return (
            <div
              key={shard.id}
              ref={(node) => setShardEl(shard.id, node)}
              data-shard-id={shard.id}
              data-corner={shard.corner}
              className={`crystal-shard ${colorClass} crystal-shard--${shard.status}`}
              style={{
                ['--facet-i' as string]: String(shard.corner),
                left: `${spawn.x}%`,
                top: `${spawn.y}%`,
              }}
            >
              <span className="crystal-shard-piece" aria-hidden="true" />
              <span className="crystal-shard-label">
                {formatFact(mode, shard.a, shard.b)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="crystal-stage-input">
        <AnswerInput onSubmit={onSubmit} disabled={inputDisabled} />
      </div>
    </div>
  )
}
