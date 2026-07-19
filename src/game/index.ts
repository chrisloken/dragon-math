export type {
  Reward,
  Direction,
  Dragon,
  Inventory,
  RoundConfig,
  RoundStats,
  Pet,
  TableFactor,
  FactCorrectCounts,
  EndScreen,
  EggAward,
} from './types'
export {
  getRoundConfig,
  DRAGONS_PER_ROUND_QUOTA,
  TREASURE_TO_HATCH,
  FOOD_PER_LEVEL,
  FACT_FREQUENCY_THRESHOLD,
  FACT_MAX,
  TABLE_FACTORS,
  emptyRoundStats,
  factKey,
  allEggsUnlocked,
} from './constants'
export { createDragon, advanceDragons } from './dragon'
export {
  emptyInventory,
  matchAnswer,
  accuracyPercent,
  bumpFactCounts,
  applyTreasureToEggs,
  distributeFood,
  createEgg,
  anyHatched,
} from './engine'
export {
  randomFact,
  pickReward,
  findNewEggAwards,
  isTableMastered,
  tableFacts,
} from './facts'

/** CSS color class suffix for table 1–10. */
export function tableColorClass(table: number): string {
  return `table-${table}`
}
