export type {
  Reward,
  Direction,
  Dragon,
  Inventory,
  RoundConfig,
  RoundStats,
  Pet,
  TableFactor,
  GameMode,
  FactCorrectCounts,
  EndScreen,
  EggAward,
  CrystalShard,
  CrystalShardStatus,
} from './types'
export {
  getRoundConfig,
  DRAGONS_PER_ROUND_QUOTA,
  TREASURE_TO_HATCH,
  foodToNextLevel,
  FACT_FREQUENCY_THRESHOLD,
  FACT_MAX,
  ADD_SUB_FACT_MAX,
  TABLE_FACTORS,
  GAME_MODES,
  RAIN_GEM_COST,
  RAIN_FOOD_AMOUNT,
  RAIN_DURATION_MS,
  RAIN_FOOD_DELAY_MS,
  CRYSTAL_MIN_LEVEL,
  CRYSTAL_SHARD_DURATION_MS,
  CRYSTAL_RESULT_PAUSE_MS,
  CRYSTAL_MELD_VFX_MS,
  CRYSTAL_WIN_BURST_MS,
  CRYSTAL_WIN_FALL_MS,
  LOOT_FALL_MS,
  LOOT_FALL_MAX_PIECES,
  PET_MAX_LEVEL,
  emptyRoundStats,
  factKey,
  allEggsUnlocked,
  familiesForMode,
  operandMax,
  modeSymbol,
  modeLabel,
  colorFamily,
} from './constants'
export { createDragon, advanceDragons } from './dragon'
export {
  emptyInventory,
  matchAnswer,
  rewardAmount,
  accuracyPercent,
  bumpFactCounts,
  applyTreasureToEggs,
  distributeFood,
  createEgg,
  anyHatched,
} from './engine'
export {
  createCrystalShards,
  findCrystalEligibleTables,
  snapshotPetLevels,
  advanceCrystalShards,
  meldCrystalShard,
  finishMeldCrystalShard,
  allCrystalShardsMelded,
  ownsSpecialGem,
  addSpecialGem,
  isGameVictory,
} from './crystal'
export {
  randomFact,
  pickReward,
  findNewEggAwards,
  isTableMastered,
  tableFacts,
  familyFacts,
  computeAnswer,
  formatFact,
} from './facts'

import { colorFamily } from './constants'

/** CSS color class — families above 10 cycle the 10 dragon palettes. */
export function tableColorClass(table: number): string {
  return `table-${colorFamily(table)}`
}
