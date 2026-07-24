import {
  foodToNextLevel,
  modeSymbol,
  PET_MAX_LEVEL,
  TREASURE_TO_HATCH,
  tableColorClass,
  type GameMode,
  type Pet,
} from '../game'
import { DragonPuppet } from './DragonPuppet'

interface PetsRackProps {
  pets: Pet[]
  mode?: GameMode
  raining?: boolean
}

/** Visual stage for the puppet (caps feature unlocks). */
function coolnessForLevel(level: number): number {
  return Math.min(8, Math.max(0, level))
}

/** Pet display scale — hatchling small, grows clearly each level. */
function scaleForLevel(level: number): number {
  return Math.min(0.7 + level * 0.18, 2.15)
}

export function PetsRack({
  pets,
  mode = 'multiplication',
  raining = false,
}: PetsRackProps) {
  if (pets.length === 0) return null

  const ordered = [...pets].sort((a, b) => a.table - b.table)
  const symbol = modeSymbol(mode)

  return (
    <div
      className={`pets-rack${raining ? ' pets-rack--raining' : ''}`}
      aria-label="Your dragon eggs and pets"
    >
      {ordered.map((pet) => (
        <PetCard key={pet.table} pet={pet} symbol={symbol} />
      ))}
    </div>
  )
}

function PetCard({ pet, symbol }: { pet: Pet; symbol: string }) {
  if (!pet.hatched) {
    return (
      <div className={`pet-card ${tableColorClass(pet.table)}`}>
        <div
          className={`egg-sprite egg-sprite--nest ${tableColorClass(pet.table)}`}
          aria-hidden="true"
        />
        <p className="pet-label">
          {symbol}
          {pet.table} egg
        </p>
        <p className="pet-progress">
          {pet.treasure}/{TREASURE_TO_HATCH}
        </p>
      </div>
    )
  }

  // Masters leave their box to circle the treasure pile.
  if (pet.level >= PET_MAX_LEVEL) {
    return (
      <div
        className={`pet-card pet-card--departed ${tableColorClass(pet.table)}`}
        title={`${symbol}${pet.table} mastered`}
      >
        <div className="pet-empty-nest" aria-hidden="true" />
        <p className="pet-label">
          {symbol}
          {pet.table}
        </p>
        <p className="pet-progress">Mastered</p>
      </div>
    )
  }

  const cool = coolnessForLevel(pet.level)
  const scale = scaleForLevel(pet.level)
  const colorClass = tableColorClass(pet.table)

  return (
    <div className={`pet-card pet-card--hatched pet-card--lv${cool} ${colorClass}`}>
      <div
        className={`pet-dragon pet-dragon--lv${cool} ${colorClass}`}
        style={{ transform: `scale(${scale})` }}
        aria-hidden="true"
      >
        <DragonPuppet coolness={cool} />
      </div>
      <p className="pet-label">
        {symbol}
        {pet.table} · Lv {pet.level}
      </p>
      <p className="pet-progress">
        Food {pet.food}/{foodToNextLevel(pet.level)}
      </p>
      <p className="pet-bonus">+{pet.level} loot</p>
    </div>
  )
}
