import type { CSSProperties } from 'react'
import { PET_MAX_LEVEL, tableColorClass, type Pet } from '../game'
import { DragonPuppet } from './DragonPuppet'

interface OrbitingPetsProps {
  pets: Pet[]
  celebrating?: boolean
}

/** Visual stage for the puppet (caps feature unlocks). */
function coolnessForLevel(level: number): number {
  return Math.min(8, Math.max(0, level))
}

/**
 * Level-10 pets that have left their rack boxes and circle the treasure pile.
 */
export function OrbitingPets({ pets, celebrating = false }: OrbitingPetsProps) {
  const masters = pets
    .filter((p) => p.hatched && p.level >= PET_MAX_LEVEL)
    .sort((a, b) => a.table - b.table)

  if (masters.length === 0) return null

  return (
    <div
      className={`orbit-ring${celebrating ? ' orbit-ring--victory' : ''}`}
      aria-label="Mastered dragons circling the treasure"
    >
      {masters.map((pet, i) => {
        const cool = coolnessForLevel(pet.level)
        return (
          <div
            key={pet.table}
            className={`orbit-pet ${tableColorClass(pet.table)}`}
            style={
              {
                ['--orbit-i' as string]: String(i),
                ['--orbit-n' as string]: String(masters.length),
              } as CSSProperties
            }
          >
            <div
              className={`orbit-pet-body pet-dragon--lv${cool}`}
              aria-hidden="true"
            >
              <DragonPuppet coolness={cool} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
