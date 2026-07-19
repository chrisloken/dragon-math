import {
  EGG_NEAR_COMPLETE_BOOST,
  EGG_NEAR_COMPLETE_REMAINING,
  FACT_FREQUENCY_THRESHOLD,
  FACT_MAX,
  FACT_MIN,
  FACT_REDUCED_WEIGHT,
  factKey,
  TABLE_FACTORS,
} from './constants'
import type { FactCorrectCounts, Reward, TableFactor } from './types'

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Food only appears after at least one dragon has hatched. */
export function pickReward(allowFood: boolean): Reward {
  if (!allowFood) {
    return Math.random() < 0.5 ? 'gem' : 'gold'
  }
  const roll = Math.random()
  if (roll < 0.35) return 'food'
  if (roll < 0.7) return 'gem'
  return 'gold'
}

/** Second factors still needed to finish table N (N×b not yet correct). */
function remainingSeconds(
  table: number,
  correctCounts: FactCorrectCounts,
): number[] {
  const needed: number[] = []
  for (let b = FACT_MIN; b <= FACT_MAX; b++) {
    if ((correctCounts[factKey(table, b)] ?? 0) < 1) needed.push(b)
  }
  return needed
}

/** Boost when this fact is one of the last 1–2 needed for either factor's egg. */
function nearEggBoost(
  factA: number,
  factB: number,
  correctCounts: FactCorrectCounts,
): number {
  let boost = 1
  const remA = remainingSeconds(factA, correctCounts)
  if (
    remA.length > 0 &&
    remA.length <= EGG_NEAR_COMPLETE_REMAINING &&
    remA.includes(factB)
  ) {
    boost *= EGG_NEAR_COMPLETE_BOOST
  }
  if (factA !== factB) {
    const remB = remainingSeconds(factB, correctCounts)
    if (
      remB.length > 0 &&
      remB.length <= EGG_NEAR_COMPLETE_REMAINING &&
      remB.includes(factA)
    ) {
      boost *= EGG_NEAR_COMPLETE_BOOST
    }
  }
  return boost
}

/**
 * Weighted fact pick.
 * Table color (factA) is nearly even so all 10 dragon colors appear.
 * The other factor keeps a strong low-number bias that fades with practice.
 * Facts that finish an almost-complete egg (1–2 left) are strongly boosted.
 * After an egg is awarded, that table’s facts are hidden until all eggs unlock.
 */
export function randomFact(
  correctCounts: FactCorrectCounts = {},
  awardedTables: ReadonlySet<TableFactor> = new Set(),
): {
  factA: number
  factB: number
  answer: number
} {
  const eggsComplete = awardedTables.size >= TABLE_FACTORS.length
  const pool: { factA: number; factB: number; weight: number }[] = []
  for (let a = FACT_MIN; a <= FACT_MAX; a++) {
    for (let b = FACT_MIN; b <= FACT_MAX; b++) {
      // Hide awarded-table facts (N×…) until every egg is unlocked
      if (!eggsComplete && awardedTables.has(a as TableFactor)) {
        continue
      }
      const count = correctCounts[factKey(a, b)] ?? 0
      // Mild table preference only — keeps all colors visible
      const tableWeight = 1 + (11 - a) * 0.08
      // Strong low bias on the second factor
      const otherBias = (11 - b) * (11 - b)
      const practiced =
        count >= FACT_FREQUENCY_THRESHOLD ? FACT_REDUCED_WEIGHT : 1
      const familiarity = 1 / (1 + count)
      const eggBoost = nearEggBoost(a, b, correctCounts)
      pool.push({
        factA: a,
        factB: b,
        weight: tableWeight * otherBias * practiced * familiarity * eggBoost,
      })
    }
  }

  // Safety: if the pool is empty, fall back to any fact
  if (pool.length === 0) {
    return { factA: 1, factB: 1, answer: 1 }
  }

  const total = pool.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const item of pool) {
    roll -= item.weight
    if (roll <= 0) {
      return { factA: item.factA, factB: item.factB, answer: item.factA * item.factB }
    }
  }
  const last = pool[pool.length - 1]!
  return { factA: last.factA, factB: last.factB, answer: last.factA * last.factB }
}

export function asTableFactor(n: number): TableFactor {
  const clamped = Math.min(10, Math.max(1, Math.round(n))) as TableFactor
  return clamped
}

/** All 10 facts for table N are N×1 … N×10. */
export function tableFacts(table: TableFactor): { a: number; b: number }[] {
  return Array.from({ length: 10 }, (_, i) => ({ a: table, b: i + 1 }))
}

export function isTableMastered(
  table: TableFactor,
  correctCounts: FactCorrectCounts,
): boolean {
  return tableFacts(table).every(({ a, b }) => (correctCounts[factKey(a, b)] ?? 0) >= 1)
}

/** Newly mastered tables that do not yet have an egg. */
export function findNewEggAwards(
  correctCounts: FactCorrectCounts,
  ownedTables: Set<TableFactor>,
): TableFactor[] {
  return TABLE_FACTORS.filter(
    (t) => !ownedTables.has(t) && isTableMastered(t, correctCounts),
  )
}
