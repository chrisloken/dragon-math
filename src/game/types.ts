export type Reward = 'gem' | 'gold' | 'food'

export type Direction = 'ltr' | 'rtl'

/** Which arithmetic the current run practices. */
export type GameMode = 'addition' | 'subtraction' | 'multiplication'

/**
 * Family id for eggs / pets / crystals.
 * Multiplication: 1–10. Addition & subtraction: 1–15.
 * Dragon colors cycle through 10 CSS classes.
 */
export type TableFactor = number

export interface Dragon {
  id: string
  factA: number
  factB: number
  answer: number
  reward: Reward
  direction: Direction
  /** Horizontal position as percentage of playfield width (0–100). */
  x: number
  /** Vertical lane as percentage of playfield height (roughly 8–55). */
  yLane: number
  /** Movement speed in percent of width per second. */
  speed: number
  /** Times-table color (matches factA / egg for that table). */
  table: TableFactor
}

export interface Inventory {
  gems: number
  gold: number
  food: number
  /** Times-table colors whose special crystal gem has been earned. */
  specialGems: TableFactor[]
}

export interface RoundConfig {
  round: number
  maxDragons: number
  /** Base speed in % width / second. */
  baseSpeed: number
  /** Milliseconds between spawn attempts. */
  spawnIntervalMs: number
  /** Total dragons that appear in this round. */
  dragonsPerRound: number
}

export interface RoundStats {
  correct: number
  incorrect: number
  gems: number
  gold: number
  food: number
}

/** Egg / pet tied to a times table (1–10). */
export interface Pet {
  table: TableFactor
  hatched: boolean
  /** Treasure applied toward hatching this egg (0–TREASURE_TO_HATCH). */
  treasure: number
  /** Level after hatching; each level adds +1 to rewards for that color. */
  level: number
  /** Food toward the next level (0 … foodToNextLevel(level)-1). */
  food: number
}

/** correctCounts["a×b" | "a+b" | "a−b"] = times answered correctly */
export type FactCorrectCounts = Record<string, number>

export type EndScreen =
  | { kind: 'summary'; round: number; stats: RoundStats }
  | { kind: 'crystal-select'; options: TableFactor[] }
  | { kind: 'crystal'; table: TableFactor }
  | { kind: 'victory' }
  | null

export type EggAward = { table: TableFactor } | null

/** Shard status during the crystal gem stage. */
export type CrystalShardStatus = 'incoming' | 'melding' | 'melded' | 'missed'

/**
 * One of the 10 table facts as a crystal shard converging on center.
 * `corner` is a spawn slot 0–9 around the screen edge.
 * `progress` goes 0 → 1 toward the center while status is `incoming`.
 */
export interface CrystalShard {
  id: string
  a: number
  b: number
  answer: number
  corner: number
  progress: number
  status: CrystalShardStatus
}
