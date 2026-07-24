import {
  EGG_NEAR_COMPLETE_BOOST,
  EGG_NEAR_COMPLETE_REMAINING,
  FACT_FREQUENCY_THRESHOLD,
  FACT_MIN,
  FACT_REDUCED_WEIGHT,
  factKey,
  familiesForMode,
  modeSymbol,
  operandMax,
} from './constants'
import type { FactCorrectCounts, GameMode, Reward, TableFactor } from './types'

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

export function computeAnswer(mode: GameMode, a: number, b: number): number {
  if (mode === 'addition') return a + b
  if (mode === 'subtraction') return a - b
  return a * b
}

/**
 * All practice facts that belong to family N for this mode.
 * Mul: N×1…N×10. Add: N+1…N+15. Sub: N−1…N−N (N−b for b=1…N).
 */
export function familyFacts(
  mode: GameMode,
  family: TableFactor,
): { a: number; b: number }[] {
  const max = operandMax(mode)
  if (mode === 'subtraction') {
    const facts: { a: number; b: number }[] = []
    for (let b = FACT_MIN; b <= Math.min(family, max); b++) {
      facts.push({ a: family, b })
    }
    return facts
  }
  return Array.from({ length: max }, (_, i) => ({ a: family, b: i + 1 }))
}

/** @deprecated Prefer familyFacts(mode, table). */
export function tableFacts(table: TableFactor): { a: number; b: number }[] {
  return familyFacts('multiplication', table)
}

/** Second partners still needed to finish family N. */
function remainingPartners(
  mode: GameMode,
  family: number,
  correctCounts: FactCorrectCounts,
): number[] {
  return familyFacts(mode, family)
    .filter(({ a, b }) => (correctCounts[factKey(mode, a, b)] ?? 0) < 1)
    .map(({ b }) => b)
}

/** Boost when this fact is one of the last 1–2 needed for either family's egg. */
function nearEggBoost(
  mode: GameMode,
  factA: number,
  factB: number,
  correctCounts: FactCorrectCounts,
): number {
  let boost = 1
  const remA = remainingPartners(mode, factA, correctCounts)
  if (
    remA.length > 0 &&
    remA.length <= EGG_NEAR_COMPLETE_REMAINING &&
    remA.includes(factB)
  ) {
    boost *= EGG_NEAR_COMPLETE_BOOST
  }
  if (mode !== 'subtraction' && factA !== factB) {
    const remB = remainingPartners(mode, factB, correctCounts)
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

function pushFact(
  pool: { factA: number; factB: number; weight: number }[],
  mode: GameMode,
  a: number,
  b: number,
  correctCounts: FactCorrectCounts,
  max: number,
) {
  const count = correctCounts[factKey(mode, a, b)] ?? 0
  const tableWeight = 1 + (max + 1 - a) * 0.08
  const otherBias = (max + 1 - b) * (max + 1 - b)
  const practiced = count >= FACT_FREQUENCY_THRESHOLD ? FACT_REDUCED_WEIGHT : 1
  const familiarity = 1 / (1 + count)
  const eggBoost = nearEggBoost(mode, a, b, correctCounts)
  pool.push({
    factA: a,
    factB: b,
    weight: tableWeight * otherBias * practiced * familiarity * eggBoost,
  })
}

/**
 * Weighted fact pick for the active mode.
 * Family color (factA) stays fairly even; partner keeps a low-number bias.
 */
export function randomFact(
  mode: GameMode,
  correctCounts: FactCorrectCounts = {},
  awardedTables: ReadonlySet<TableFactor> = new Set(),
): {
  factA: number
  factB: number
  answer: number
} {
  const max = operandMax(mode)
  const eggsComplete = awardedTables.size >= familiesForMode(mode).length
  const pool: { factA: number; factB: number; weight: number }[] = []

  for (let a = FACT_MIN; a <= max; a++) {
    if (!eggsComplete && awardedTables.has(a)) continue
    if (mode === 'subtraction') {
      for (let b = FACT_MIN; b <= a; b++) {
        pushFact(pool, mode, a, b, correctCounts, max)
      }
    } else {
      for (let b = FACT_MIN; b <= max; b++) {
        pushFact(pool, mode, a, b, correctCounts, max)
      }
    }
  }

  if (pool.length === 0) {
    return { factA: 1, factB: 1, answer: computeAnswer(mode, 1, 1) }
  }

  const total = pool.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const item of pool) {
    roll -= item.weight
    if (roll <= 0) {
      return {
        factA: item.factA,
        factB: item.factB,
        answer: computeAnswer(mode, item.factA, item.factB),
      }
    }
  }
  const last = pool[pool.length - 1]!
  return {
    factA: last.factA,
    factB: last.factB,
    answer: computeAnswer(mode, last.factA, last.factB),
  }
}

export function asTableFactor(n: number, mode: GameMode = 'multiplication'): TableFactor {
  const max = operandMax(mode)
  return Math.min(max, Math.max(1, Math.round(n)))
}

export function isTableMastered(
  mode: GameMode,
  table: TableFactor,
  correctCounts: FactCorrectCounts,
): boolean {
  return familyFacts(mode, table).every(
    ({ a, b }) => (correctCounts[factKey(mode, a, b)] ?? 0) >= 1,
  )
}

/** Newly mastered families that do not yet have an egg. */
export function findNewEggAwards(
  mode: GameMode,
  correctCounts: FactCorrectCounts,
  ownedTables: Set<TableFactor>,
): TableFactor[] {
  return familiesForMode(mode).filter(
    (t) => !ownedTables.has(t) && isTableMastered(mode, t, correctCounts),
  )
}

export function formatFact(mode: GameMode, a: number, b: number): string {
  return `${a}${modeSymbol(mode)}${b}`
}
