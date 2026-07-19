export type Reward = 'gem' | 'gold' | 'food'

export type Direction = 'ltr' | 'rtl'

/** Times-table factor 1–10; each has its own egg color and dragon color. */
export type TableFactor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

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
  /** Food toward the next level (0 … FOOD_PER_LEVEL-1). */
  food: number
}

/** correctCounts["a×b"] = times answered correctly */
export type FactCorrectCounts = Record<string, number>

export type EndScreen = { kind: 'summary'; round: number; stats: RoundStats } | null

export type EggAward = { table: TableFactor } | null
