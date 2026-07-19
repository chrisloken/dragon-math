import { FOOD_PER_LEVEL, TREASURE_TO_HATCH, tableColorClass, type Pet } from '../game'

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
        <svg viewBox="0 0 140 80" className="pet-dragon-svg">
          {cool >= 2 && (
            <path
              className="pet-aura"
              d="M70 8 Q90 20 100 40 Q90 55 70 58 Q50 55 40 40 Q50 20 70 8"
              fill="none"
              strokeOpacity="0.35"
              strokeWidth="3"
            />
          )}
          <path className="pet-wing" d="M52 38 L28 8 L48 28 L40 4 L58 30" opacity="0.9" />
          {cool >= 3 && (
            <path className="pet-wing" d="M54 42 L34 18 L50 34" opacity="0.55" />
          )}
          <path className="pet-tail" d="M28 48 C12 42 4 52 2 62 C10 56 18 54 28 52" />
          <ellipse className="pet-torso" cx="68" cy="48" rx="28" ry="12" />
          <ellipse className="pet-head" cx="102" cy="36" rx="14" ry="11" />
          <polygon className="pet-horn" points="94,28 96,14 102,28" />
          <polygon className="pet-horn" points="102,26 106,12 112,26" />
          {cool >= 1 && <polygon className="pet-horn" points="108,24 114,8 118,26" />}
          {cool >= 4 && (
            <>
              <polygon className="pet-horn" points="88,34 84,22 92,32" />
              <circle cx="64" cy="44" r="2" fill="#fbbf24" />
              <circle cx="74" cy="42" r="1.6" fill="#fbbf24" />
            </>
          )}
          <circle cx="108" cy="34" r="2.2" fill="#fff8e7" />
          {cool >= 5 && (
            <path d="M116 30 L122 26 L118 34" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
          )}
        </svg>
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
