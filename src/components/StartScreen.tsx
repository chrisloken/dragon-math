import { tableColorClass } from '../game'
import { DragonPuppet } from './DragonPuppet'

interface StartScreenProps {
  onStart: () => void
}

/** Decorative dragons that cruise across the title screen. */
const FLYERS = [
  { table: 3, top: '14%', duration: 26, delay: 0, rtl: false, scale: 0.85 },
  { table: 8, top: '28%', duration: 32, delay: 6, rtl: true, scale: 1.05 },
  { table: 5, top: '42%', duration: 24, delay: 2, rtl: false, scale: 0.95 },
  { table: 1, top: '52%', duration: 30, delay: 10, rtl: true, scale: 0.8 },
  { table: 7, top: '22%', duration: 28, delay: 14, rtl: false, scale: 1.1 },
] as const

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen" role="dialog" aria-modal="true" aria-labelledby="start-title">
      <div className="start-screen-dragons" aria-hidden="true">
        {FLYERS.map((f, i) => (
          <div
            key={i}
            className={`start-dragon ${tableColorClass(f.table)}${f.rtl ? ' start-dragon--rtl' : ''}`}
            style={{
              top: f.top,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              ['--start-scale' as string]: f.scale,
            }}
          >
            <div className="start-dragon-body">
              <DragonPuppet coolness={2} />
            </div>
          </div>
        ))}
      </div>

      <div className="start-screen-content">
        <h1 id="start-title" className="start-screen-title">
          Dragon Math
        </h1>
        <p className="start-screen-byline">Made by Miles and Chris Loken</p>
        <button type="button" className="start-screen-play modal-button" onClick={onStart}>
          Play
        </button>
      </div>
    </div>
  )
}
