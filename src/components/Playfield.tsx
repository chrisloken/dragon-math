import type { ReactNode } from 'react'
import type { Dragon } from '../game'
import { DragonSprite } from './DragonSprite'

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
  children?: ReactNode
}

export function Playfield({ dragons, teleportFx = [], children }: PlayfieldProps) {
  return (
    <div className="playfield">
      <div className="sky" aria-hidden="true" />
      <div className="hills" aria-hidden="true" />
      <div className="ground" aria-hidden="true" />
      <div className="dragon-layer">
        {dragons.map((d) => (
          <DragonSprite key={d.id} dragon={d} />
        ))}
        {teleportFx.map((fx) => (
          <DragonSprite
            key={`fx-${fx.id}`}
            dragon={fx}
            teleporting
          />
        ))}
      </div>
      {children}
    </div>
  )
}
