import type { GameMode, RoundConfig, RoundStats, TableFactor } from './types'

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
/** Multiplication operand / family max (legacy default). */
export const FACT_MAX = 10
/** Addition & subtraction operand / family max. */
export const ADD_SUB_FACT_MAX = 15
/** How many CSS color classes cycle for families. */
export const COLOR_FAMILY_COUNT = 10

export const GAME_MODES: GameMode[] = ['addition', 'subtraction', 'multiplication']

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
/** Mild speed ramp — was 1.12 (12%/round); keep difficulty gentle. */
export const SPEED_GROWTH = 1.05
export const SPAWN_INTERVAL_SHRINK = 0.96
export const MIN_SPAWN_INTERVAL_MS = 900

export const Y_LANE_MIN = 8
export const Y_LANE_MAX = 52

/** Food needed to go from `level` → `level + 1`: 3 + current level. */
export function foodToNextLevel(level: number): number {
  return 3 + Math.max(0, level)
}

/** Gem cost and food yield for the rain spell. */
export const RAIN_GEM_COST = 20
export const RAIN_FOOD_AMOUNT = 8
/** Total rain VFX duration before food is applied and FX clears. */
export const RAIN_DURATION_MS = 2800
/** Delay before food is delivered (after clouds + rain channel). */
export const RAIN_FOOD_DELAY_MS = 1800

/** Pet must reach this level to unlock crystal challenges between rounds. */
export const CRYSTAL_MIN_LEVEL = 3
/** How long each shard takes to travel from the edge to the center. */
export const CRYSTAL_SHARD_DURATION_MS = 20700
/** Brief pause after a failed crystal stage before leaving. */
export const CRYSTAL_RESULT_PAUSE_MS = 1600
/** How long the rain-like meld channel VFX plays on a correct answer. */
export const CRYSTAL_MELD_VFX_MS = 900
/** Celebrate burst before the completed gem starts falling. */
export const CRYSTAL_WIN_BURST_MS = 850
/** Duration of the gem falling into the treasure pile. */
export const CRYSTAL_WIN_FALL_MS = 1100
/** How long loot pieces take to fall from a dragon into the treasure pile. */
export const LOOT_FALL_MS = 780
/** Cap how many flying pieces we spawn per dragon (amount may be higher). */
export const LOOT_FALL_MAX_PIECES = 6
/** Pet level at which they leave the rack and join the victory orbit. */
export const PET_MAX_LEVEL = 10

/** Multiplication families (legacy export name). */
export const TABLE_FACTORS: TableFactor[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function operandMax(mode: GameMode): number {
  return mode === 'multiplication' ? FACT_MAX : ADD_SUB_FACT_MAX
}

export function familiesForMode(mode: GameMode): TableFactor[] {
  const max = operandMax(mode)
  return Array.from({ length: max }, (_, i) => i + 1)
}

export function allEggsUnlocked(awardedCount: number, mode: GameMode = 'multiplication'): boolean {
  return awardedCount >= familiesForMode(mode).length
}

export function modeSymbol(mode: GameMode): string {
  if (mode === 'addition') return '+'
  if (mode === 'subtraction') return '−'
  return '×'
}

export function modeLabel(mode: GameMode): string {
  if (mode === 'addition') return 'Addition'
  if (mode === 'subtraction') return 'Subtraction'
  return 'Multiplication'
}

/** Map any family id onto one of the 10 dragon color classes. */
export function colorFamily(family: number): number {
  return ((Math.max(1, family) - 1) % COLOR_FAMILY_COUNT) + 1
}

export function getRoundConfig(
  round: number,
  eggsUnlocked = false,
): RoundConfig {
  // Hold difficulty at round-1 until every times-table egg is awarded.
  const r = eggsUnlocked ? Math.max(1, round) : 1
  return {
    round: Math.max(1, round),
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

export function factKey(mode: GameMode, a: number, b: number): string {
  return `${a}${modeSymbol(mode)}${b}`
}
