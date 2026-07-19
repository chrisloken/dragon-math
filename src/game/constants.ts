import type { RoundConfig, RoundStats, TableFactor } from './types'

/** Total flying dragons that appear in each round. */
export const DRAGONS_PER_ROUND_QUOTA = 30

/** Treasure (gems + gold) each egg needs to hatch. */
export const TREASURE_TO_HATCH = 30

/** After this many correct answers, a fact is presented less often. */
export const FACT_FREQUENCY_THRESHOLD = 2
/** Relative weight for well-practiced facts (vs 1 for others). */
export const FACT_REDUCED_WEIGHT = 0.25
/** When this many (or fewer) facts remain for an egg, boost those facts. */
export const EGG_NEAR_COMPLETE_REMAINING = 2
/** Weight multiplier for facts that finish an almost-complete egg. */
export const EGG_NEAR_COMPLETE_BOOST = 14

export const FACT_MIN = 1
export const FACT_MAX = 10

/** Concurrent dragons on screen (round 1). */
export const BASE_MAX_DRAGONS = 3
/**
 * Base flight speed (% width / second) for round 1.
 * Original 8 → −25% → 6 → another −25% → 4.5
 */
export const BASE_SPEED = 4.5
export const BASE_SPAWN_INTERVAL_MS = 1800

/** Extra concurrent dragons per round beyond round 1. */
export const CONCURRENT_DRAGONS_PER_ROUND = 1
export const SPEED_GROWTH = 1.12
export const SPAWN_INTERVAL_SHRINK = 0.92
export const MIN_SPAWN_INTERVAL_MS = 700

export const Y_LANE_MIN = 8
export const Y_LANE_MAX = 52

/** Food needed on a hatched pet to gain one level. */
export const FOOD_PER_LEVEL = 10

export const TABLE_FACTORS: TableFactor[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function getRoundConfig(round: number): RoundConfig {
  const r = Math.max(1, round)
  return {
    round: r,
    maxDragons: BASE_MAX_DRAGONS + (r - 1) * CONCURRENT_DRAGONS_PER_ROUND,
    baseSpeed: BASE_SPEED * Math.pow(SPEED_GROWTH, r - 1),
    spawnIntervalMs: Math.max(
      MIN_SPAWN_INTERVAL_MS,
      Math.round(BASE_SPAWN_INTERVAL_MS * Math.pow(SPAWN_INTERVAL_SHRINK, r - 1)),
    ),
    dragonsPerRound: DRAGONS_PER_ROUND_QUOTA,
  }
}

export function emptyRoundStats(): RoundStats {
  return { correct: 0, incorrect: 0, gems: 0, gold: 0, food: 0 }
}

export function factKey(a: number, b: number): string {
  return `${a}×${b}`
}
