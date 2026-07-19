import { TREASURE_TO_HATCH, factKey, foodToNextLevel } from './constants'
import type { Dragon, FactCorrectCounts, Inventory, Pet, TableFactor } from './types'

export function emptyInventory(): Inventory {
  return { gems: 0, gold: 0, food: 0 }
}

export interface MatchResult {
  dragons: Dragon[]
  inventory: Inventory
  collectedIds: string[]
  loot: { gems: number; gold: number; food: number }
  /** Treasure (gems+gold) gained this submit — for egg progress. */
  treasureGained: number
  /** Food units to distribute across hatched pets. */
  foodGained: number
  /** Fact keys answered on this submit. */
  factKeys: string[]
}

function rewardAmount(table: TableFactor, pets: Pet[]): number {
  const pet = pets.find((p) => p.table === table && p.hatched)
  if (!pet) return 1
  return 1 + pet.level
}

export function matchAnswer(
  dragons: Dragon[],
  inventory: Inventory,
  answer: number,
  pets: Pet[],
): MatchResult {
  const hits = dragons.filter((d) => d.answer === answer)
  if (hits.length === 0) {
    return {
      dragons,
      inventory,
      collectedIds: [],
      loot: { gems: 0, gold: 0, food: 0 },
      treasureGained: 0,
      foodGained: 0,
      factKeys: [],
    }
  }

  const loot = { gems: 0, gold: 0, food: 0 }
  const nextInventory = { ...inventory }
  const factKeys: string[] = []

  for (const d of hits) {
    factKeys.push(factKey(d.factA, d.factB))
    const amount = rewardAmount(d.table, pets)

    if (d.reward === 'gem') {
      nextInventory.gems += amount
      loot.gems += amount
    } else if (d.reward === 'gold') {
      nextInventory.gold += amount
      loot.gold += amount
    } else {
      nextInventory.food += amount
      loot.food += amount
    }
  }

  const hitIds = new Set(hits.map((d) => d.id))
  const remaining = dragons.filter((d) => !hitIds.has(d.id))

  return {
    dragons: remaining,
    inventory: nextInventory,
    collectedIds: hits.map((d) => d.id),
    loot,
    treasureGained: loot.gems + loot.gold,
    foodGained: loot.food,
    factKeys,
  }
}

export function accuracyPercent(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

export function bumpFactCounts(
  counts: FactCorrectCounts,
  keys: string[],
): FactCorrectCounts {
  const next = { ...counts }
  for (const key of keys) {
    for (const k of commutativeFactKeys(key)) {
      next[k] = (next[k] ?? 0) + 1
    }
  }
  return next
}

/** A×B and B×A are the same fact for mastery / practice tracking. */
function commutativeFactKeys(key: string): string[] {
  const match = /^(\d+)×(\d+)$/.exec(key)
  if (!match) return [key]
  const a = Number(match[1])
  const b = Number(match[2])
  if (a === b) return [factKey(a, b)]
  return [factKey(a, b), factKey(b, a)]
}

/** Apply treasure to unhatched eggs in award order (FIFO). */
export function applyTreasureToEggs(pets: Pet[], treasureGained: number): Pet[] {
  if (treasureGained <= 0 || pets.length === 0) return pets

  let remaining = treasureGained
  return pets.map((pet) => {
    if (pet.hatched || remaining <= 0) return pet
    const room = TREASURE_TO_HATCH - pet.treasure
    const add = Math.min(room, remaining)
    remaining -= add
    const treasure = pet.treasure + add
    if (treasure >= TREASURE_TO_HATCH) {
      return {
        ...pet,
        treasure: TREASURE_TO_HATCH,
        hatched: true,
        level: 0,
        food: 0,
      }
    }
    return { ...pet, treasure }
  })
}

/**
 * Distribute food across hatched dragons (always feed the hungriest first).
 * Food to level up is 3 + current level.
 */
export function distributeFood(pets: Pet[], foodAmount: number): Pet[] {
  if (foodAmount <= 0) return pets
  const hatchedIndices = pets
    .map((p, i) => (p.hatched ? i : -1))
    .filter((i) => i >= 0)
  if (hatchedIndices.length === 0) return pets

  const next = pets.map((p) => ({ ...p }))
  let remaining = foodAmount

  while (remaining > 0) {
    let best = hatchedIndices[0]!
    for (const i of hatchedIndices) {
      const a = next[i]!
      const b = next[best]!
      // Hungriest: lowest level, then least food toward the next level
      if (
        a.level < b.level ||
        (a.level === b.level && a.food < b.food) ||
        (a.level === b.level && a.food === b.food && a.table < b.table)
      ) {
        best = i
      }
    }

    const pet = next[best]!
    const needed = foodToNextLevel(pet.level)
    let food = pet.food + 1
    let level = pet.level
    if (food >= needed) {
      food = 0
      level += 1
    }
    next[best] = { ...pet, food, level }
    remaining -= 1
  }

  return next
}

export function createEgg(table: TableFactor): Pet {
  return { table, hatched: false, treasure: 0, level: 0, food: 0 }
}

export function anyHatched(pets: Pet[]): boolean {
  return pets.some((p) => p.hatched)
}
