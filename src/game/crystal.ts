import { computeAnswer, familyFacts } from './facts'
import type { CrystalShard, GameMode, Pet, TableFactor } from './types'
import {
  CRYSTAL_MIN_LEVEL,
  PET_MAX_LEVEL,
  familiesForMode,
} from './constants'

let shardSeq = 0

/** Build converging shards for a family crystal stage in the active mode. */
export function createCrystalShards(
  mode: GameMode,
  table: TableFactor,
): CrystalShard[] {
  return familyFacts(mode, table).map((fact, corner) => {
    shardSeq += 1
    return {
      id: `shard-${table}-${fact.b}-${shardSeq}`,
      a: fact.a,
      b: fact.b,
      answer: computeAnswer(mode, fact.a, fact.b),
      corner,
      progress: 0,
      status: 'incoming' as const,
    }
  })
}

/**
 * Hatched pets at least CRYSTAL_MIN_LEVEL whose special gem is not yet owned.
 * Shown on the between-round crystal picker (player may attempt one).
 */
export function findCrystalEligibleTables(
  pets: Pet[],
  ownedSpecialGems: TableFactor[],
): TableFactor[] {
  const owned = new Set(ownedSpecialGems)
  const eligible: TableFactor[] = []

  for (const pet of pets) {
    if (!pet.hatched) continue
    if (pet.level < CRYSTAL_MIN_LEVEL) continue
    if (owned.has(pet.table)) continue
    eligible.push(pet.table)
  }

  return eligible.sort((a, b) => a - b)
}

/** Snapshot hatched pet levels keyed by table. */
export function snapshotPetLevels(pets: Pet[]): Partial<Record<TableFactor, number>> {
  const snap: Partial<Record<TableFactor, number>> = {}
  for (const pet of pets) {
    if (pet.hatched) snap[pet.table] = pet.level
  }
  return snap
}

/**
 * Advance incoming shards by dt seconds over `durationMs`.
 * Returns updated shards and whether any unanswered shard reached the center.
 */
export function advanceCrystalShards(
  shards: CrystalShard[],
  dt: number,
  durationMs: number,
): { shards: CrystalShard[]; missed: boolean } {
  const durationSec = durationMs / 1000
  let missed = false
  const next = shards.map((s) => {
    if (s.status !== 'incoming') return s
    const progress = Math.min(1, s.progress + dt / durationSec)
    if (progress >= 1) {
      missed = true
      return { ...s, progress: 1, status: 'missed' as const }
    }
    return { ...s, progress }
  })
  return { shards: next, missed }
}

/** Mark the first incoming shard with this answer as melding (keeps current progress for VFX). */
export function meldCrystalShard(
  shards: CrystalShard[],
  answer: number,
): { shards: CrystalShard[]; meldedId: string | null } {
  const hit = shards.find((s) => s.status === 'incoming' && s.answer === answer)
  if (!hit) return { shards, meldedId: null }
  return {
    shards: shards.map((s) =>
      s.id === hit.id ? { ...s, status: 'melding' as const } : s,
    ),
    meldedId: hit.id,
  }
}

export function finishMeldCrystalShard(
  shards: CrystalShard[],
  id: string,
): CrystalShard[] {
  return shards.map((s) => (s.id === id ? { ...s, status: 'melded' as const } : s))
}

export function allCrystalShardsMelded(shards: CrystalShard[]): boolean {
  return shards.length > 0 && shards.every((s) => s.status === 'melded')
}

export function ownsSpecialGem(specialGems: TableFactor[], table: TableFactor): boolean {
  return specialGems.includes(table)
}

export function addSpecialGem(
  specialGems: TableFactor[],
  table: TableFactor,
): TableFactor[] {
  if (specialGems.includes(table)) return specialGems
  return [...specialGems, table].sort((a, b) => a - b)
}

/** True when every family has a level-10 pet and its crystal gem. */
export function isGameVictory(
  mode: GameMode,
  pets: Pet[],
  ownedSpecialGems: TableFactor[],
): boolean {
  const families = familiesForMode(mode)
  if (ownedSpecialGems.length < families.length) return false
  const owned = new Set(ownedSpecialGems)
  for (const table of families) {
    if (!owned.has(table)) return false
    const pet = pets.find((p) => p.table === table && p.hatched)
    if (!pet || pet.level < PET_MAX_LEVEL) return false
  }
  return true
}
