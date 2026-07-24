import { useLayoutEffect, useRef, useState } from 'react'

interface PetTarget {
  id: string
  x: number
  y: number
}

interface Puddle {
  id: string
  x: number
  width: number
}

/**
 * Storm clouds + rain, then ground puddles whose water channels
 * up into each hatched pet dragon.
 */
export function RainWeather() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1, h: 1 })
  const [targets, setTargets] = useState<PetTarget[]>([])
  const [puddles, setPuddles] = useState<Puddle[]>([])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const playfield = root.closest('.playfield')
    if (!(playfield instanceof HTMLElement)) return

    const measure = () => {
      const pf = playfield.getBoundingClientRect()
      const w = pf.width
      const h = pf.height
      setSize({ w, h })

      const cards = playfield.querySelectorAll('.pet-card--hatched')
      const nextTargets = Array.from(cards).map((el, i) => {
        const r = el.getBoundingClientRect()
        return {
          id: `target-${i}`,
          x: r.left + r.width / 2 - pf.left,
          y: r.top + r.height * 0.28 - pf.top,
        }
      })
      setTargets(nextTargets)

      // Puddles along the ground, denser near hatched pets.
      const nextPuddles: Puddle[] = []
      if (nextTargets.length === 0) {
        for (let i = 0; i < 6; i++) {
          nextPuddles.push({
            id: `puddle-${i}`,
            x: w * (0.1 + i * 0.15),
            width: 28 + (i % 3) * 10,
          })
        }
      } else {
        nextTargets.forEach((t, i) => {
          nextPuddles.push({
            id: `puddle-pet-${i}`,
            x: t.x,
            width: 42,
          })
          nextPuddles.push({
            id: `puddle-side-${i}`,
            x: Math.min(w - 24, Math.max(24, t.x + (i % 2 === 0 ? -48 : 48))),
            width: 28,
          })
        })
        // Extra ambient puddles between pets
        for (let i = 0; i < Math.min(4, nextTargets.length + 1); i++) {
          nextPuddles.push({
            id: `puddle-ambient-${i}`,
            x: w * (0.12 + i * 0.22),
            width: 22 + (i % 2) * 8,
          })
        }
      }
      setPuddles(nextPuddles)
    }

    measure()
    const t = window.setTimeout(measure, 40)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Ground surface sits just above the dark ground band (~14% from bottom).
  const groundY = size.h * 0.855

  return (
    <div ref={rootRef} className="rain-weather" aria-hidden="true">
      <div className="rain-clouds">
        <span className="rain-cloud rain-cloud-1" />
        <span className="rain-cloud rain-cloud-2" />
        <span className="rain-cloud rain-cloud-3" />
        <span className="rain-cloud rain-cloud-4" />
        <span className="rain-cloud rain-cloud-5" />
      </div>

      <div className="rain-sheet">
        {Array.from({ length: 48 }, (_, i) => (
          <span
            key={i}
            className="rain-drop"
            style={{
              left: `${(i * 2.1 + (i % 5) * 0.7) % 100}%`,
              animationDelay: `${(i % 12) * 0.08}s`,
              animationDuration: `${0.55 + (i % 7) * 0.05}s`,
            }}
          />
        ))}
      </div>

      <div className="rain-ground">
        {puddles.map((p, i) => (
          <span
            key={p.id}
            className="rain-puddle"
            style={{
              left: p.x,
              top: groundY,
              width: p.width,
              animationDelay: `${0.85 + (i % 5) * 0.06}s`,
            }}
          />
        ))}
      </div>

      <svg
        className="rain-channel-svg"
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
      >
        <defs>
          <linearGradient id="rain-stream-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(120, 210, 255, 0.95)" />
            <stop offset="55%" stopColor="rgba(160, 230, 255, 0.85)" />
            <stop offset="100%" stopColor="rgba(94, 234, 212, 0.95)" />
          </linearGradient>
        </defs>
        {targets.map((t, i) => {
          // Start at a nearby puddle on the ground, run along the ground, then climb to the pet.
          const startX =
            t.x + (i % 2 === 0 ? -36 : 36) * (1 + (i % 3) * 0.15)
          const midX = (startX + t.x) / 2
          const climbY = (groundY + t.y) / 2
          const d = [
            `M ${startX} ${groundY}`,
            `C ${startX} ${groundY - 8}, ${midX} ${groundY - 4}, ${t.x} ${groundY - 12}`,
            `C ${t.x} ${climbY}, ${t.x} ${t.y + 18}, ${t.x} ${t.y}`,
          ].join(' ')

          return (
            <g key={t.id} className="rain-channel-group">
              <path
                className="rain-channel-path"
                d={d}
                pathLength={1}
                style={{ animationDelay: `${1.15 + i * 0.1}s` }}
              />
              <circle className="rain-channel-bead" r={4.5} opacity={0}>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.1;0.85;1"
                  dur="0.95s"
                  begin={`${1.2 + i * 0.1}s`}
                  fill="freeze"
                />
                <animateMotion
                  path={d}
                  dur="0.95s"
                  begin={`${1.2 + i * 0.1}s`}
                  fill="freeze"
                />
              </circle>
              <circle className="rain-channel-bead rain-channel-bead--lag" r={3.2} opacity={0}>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.1;0.85;1"
                  dur="0.95s"
                  begin={`${1.38 + i * 0.1}s`}
                  fill="freeze"
                />
                <animateMotion
                  path={d}
                  dur="0.95s"
                  begin={`${1.38 + i * 0.1}s`}
                  fill="freeze"
                />
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
