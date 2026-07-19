import { FOOD_PER_LEVEL, TREASURE_TO_HATCH, tableColorClass, type Pet } from '../game'
import { DragonPuppet } from './DragonPuppet'

interface PetsRackProps {
  pets: Pet[]
}

export function PetsRack({ pets }: PetsRackProps) {
  if (pets.length === 0) return null

  return (
    <div className="pets-rack" aria-label="Your dragon eggs and pets">
      {pets.map((pet) => (
        <PetCard key={pet.table} pet={pet} />
      ))}
    </div>
  )
}

function PetCard({ pet }: { pet: Pet }) {
  if (!pet.hatched) {
    return (
      <div className={`pet-card ${tableColorClass(pet.table)}`}>
        <div
          className={`egg-sprite egg-sprite--nest ${tableColorClass(pet.table)}`}
          aria-hidden="true"
        />
        <p className="pet-label">×{pet.table} egg</p>
        <p className="pet-progress">
          {pet.treasure}/{TREASURE_TO_HATCH}
        </p>
      </div>
    )
  }

  const scale = Math.min(0.55 + pet.level * 0.12, 1.4)
  const cool = Math.min(pet.level, 5)
  const colorClass = tableColorClass(pet.table)

  return (
    <div className={`pet-card pet-card--hatched ${colorClass}`}>
      <div
        className={`pet-dragon pet-dragon--lv${cool} ${colorClass}`}
        style={{ transform: `scale(${scale})` }}
        aria-hidden="true"
      >
        <DragonPuppet coolness={cool} />
      </div>
      <p className="pet-label">
        ×{pet.table} · Lv {pet.level}
      </p>
      <p className="pet-progress">
        Food {pet.food}/{FOOD_PER_LEVEL}
      </p>
      <p className="pet-bonus">+{pet.level} loot</p>
    </div>
  )
}
