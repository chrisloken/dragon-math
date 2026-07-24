import type { ReactNode } from 'react'
import type { Dragon, GameMode } from '../game'
import { DragonSprite } from './DragonSprite'
import { RainWeather } from './RainWeather'

export interface TeleportFx {
  id: string
  x: number
  yLane: number
  table: Dragon['table']
  direction: Dragon['direction']
  reward: Dragon['reward']
  factA: number
  factB: number
  answer: number
  speed: number
}

interface PlayfieldProps {
  dragons: Dragon[]
  teleportFx?: TeleportFx[]
  raining?: boolean
  mode?: GameMode
  children?: ReactNode
}

export function Playfield({
  dragons,
  teleportFx = [],
  raining = false,
  mode = 'multiplication',
  children,
}: PlayfieldProps) {
  return (
    <div className={`playfield${raining ? ' is-raining' : ''}`}>
      <div className="sky" aria-hidden="true" />
      <div className="hills" aria-hidden="true" />
      <div className="ground" aria-hidden="true" />
      {raining && <RainWeather />}
      <div className="dragon-layer">
        {dragons.map((d) => (
          <DragonSprite key={d.id} dragon={d} mode={mode} />
        ))}
        {teleportFx.map((fx) => (
          <DragonSprite
            key={`fx-${fx.id}`}
            dragon={fx}
            mode={mode}
            teleporting
          />
        ))}
      </div>
      {children}
    </div>
  )
}
