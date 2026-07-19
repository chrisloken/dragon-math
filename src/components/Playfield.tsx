import type { ReactNode } from 'react'
import type { Dragon } from '../game'
import { DragonSprite } from './DragonSprite'

interface PlayfieldProps {
  dragons: Dragon[]
  children?: ReactNode
}

export function Playfield({ dragons, children }: PlayfieldProps) {
  return (
    <div className="playfield">
      <div className="sky" aria-hidden="true" />
      <div className="hills" aria-hidden="true" />
      <div className="ground" aria-hidden="true" />
      <div className="dragon-layer">
        {dragons.map((d) => (
          <DragonSprite key={d.id} dragon={d} />
        ))}
      </div>
      {children}
    </div>
  )
}
