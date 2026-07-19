import { Y_LANE_MAX, Y_LANE_MIN } from './constants'
import { asTableFactor, pickReward, randomFact, randomInt } from './facts'
import type { Direction, Dragon, FactCorrectCounts, TableFactor } from './types'

let nextId = 1

export function createDragon(
  baseSpeed: number,
  occupiedLanes: number[],
  correctCounts: FactCorrectCounts = {},
  allowFood = false,
  awardedTables: ReadonlySet<TableFactor> = new Set(),
): Dragon {
  const { factA, factB, answer } = randomFact(correctCounts, awardedTables)
  const direction: Direction = Math.random() < 0.5 ? 'ltr' : 'rtl'
  const yLane = pickLane(occupiedLanes)
  const speedJitter = 0.85 + Math.random() * 0.3

  return {
    id: `dragon-${nextId++}`,
    factA,
    factB,
    answer,
    reward: pickReward(allowFood),
    direction,
    x: direction === 'ltr' ? -12 : 112,
    yLane,
    speed: baseSpeed * speedJitter,
    table: asTableFactor(factA),
  }
}

function pickLane(occupied: number[]): number {
  for (let attempt = 0; attempt < 12; attempt++) {
    const lane = randomInt(Y_LANE_MIN, Y_LANE_MAX)
    const tooClose = occupied.some((y) => Math.abs(y - lane) < 8)
    if (!tooClose) return lane
  }
  return randomInt(Y_LANE_MIN, Y_LANE_MAX)
}

export function advanceDragons(
  dragons: Dragon[],
  dtSeconds: number,
): { dragons: Dragon[]; escaped: number } {
  const moved = dragons.map((d) => {
    const delta = d.speed * dtSeconds
    const x = d.direction === 'ltr' ? d.x + delta : d.x - delta
    return { ...d, x }
  })
  const remaining = moved.filter((d) => d.x > -18 && d.x < 118)
  return {
    dragons: remaining,
    escaped: moved.length - remaining.length,
  }
}
