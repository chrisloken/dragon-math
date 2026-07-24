import { useCallback, useEffect, useRef, useState } from 'react'
import {
  advanceDragons,
  allCrystalShardsMelded,
  allEggsUnlocked,
  anyHatched,
  applyTreasureToEggs,
  bumpFactCounts,
  createCrystalShards,
  createDragon,
  createEgg,
  distributeFood,
  DRAGONS_PER_ROUND_QUOTA,
  emptyInventory,
  emptyRoundStats,
  findCrystalEligibleTables,
  findNewEggAwards,
  finishMeldCrystalShard,
  getRoundConfig,
  matchAnswer,
  meldCrystalShard,
  rewardAmount,
  addSpecialGem,
  isGameVictory,
  CRYSTAL_RESULT_PAUSE_MS,
  CRYSTAL_MELD_VFX_MS,
  LOOT_FALL_MAX_PIECES,
  RAIN_DURATION_MS,
  RAIN_FOOD_AMOUNT,
  RAIN_FOOD_DELAY_MS,
  RAIN_GEM_COST,
  TREASURE_TO_HATCH,
  type CrystalShard,
  type Dragon,
  type EndScreen,
  type FactCorrectCounts,
  type GameMode,
  type Inventory,
  type Pet,
  type RoundStats,
  type TableFactor,
} from '../game'
import { layoutTreasureSlot } from '../game/treasureLayout'

export function useGame() {
  const [mode, setMode] = useState<GameMode>('multiplication')
  const [round, setRound] = useState(1)
  const [dragons, setDragons] = useState<Dragon[]>([])
  const [inventory, setInventory] = useState<Inventory>(emptyInventory)
  const [paused, setPaused] = useState(true)
  const [userPaused, setUserPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [spawnedCount, setSpawnedCount] = useState(0)
  const [roundStats, setRoundStats] = useState<RoundStats>(emptyRoundStats)
  const [endScreen, setEndScreen] = useState<EndScreen>(null)
  const [beatenRound, setBeatenRound] = useState<number | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [factCounts, setFactCounts] = useState<FactCorrectCounts>({})
  const [eggToast, setEggToast] = useState<TableFactor | null>(null)
  const [showFactsGrid, setShowFactsGrid] = useState(false)
  const [teleportFx, setTeleportFx] = useState<
    {
      id: string
      x: number
      yLane: number
      table: Dragon['table']
      direction: Dragon['direction']
      reward: Dragon['reward']
      factA: number
      factB: number
      answer: number
      speed: number
    }[]
  >([])
  const [lootDrops, setLootDrops] = useState<
    {
      id: string
      kind: 'gem' | 'gold'
      x: number
      yLane: number
      delayMs: number
      landLeft: number
      landBottom: number
      landRotate: number
      /** Extra same-kind pieces to place (no flight) when this drop lands. */
      bonusCount: number
    }[]
  >([])
  const [pilePieces, setPilePieces] = useState<
    {
      id: string
      kind: 'gem' | 'gold'
      left: number
      bottom: number
      rotate: number
    }[]
  >([])
  const lootSeqRef = useRef(0)
  const pileSlotRef = useRef(0)
  const pendingLootRef = useRef(
    new Map<
      string,
      {
        kind: 'gem' | 'gold'
        left: number
        bottom: number
        rotate: number
        bonusLayouts: { left: number; bottom: number; rotate: number }[]
      }
    >(),
  )
  const [raining, setRaining] = useState(false)
  const [crystalShards, setCrystalShards] = useState<CrystalShard[]>([])
  const [crystalOutcome, setCrystalOutcome] = useState<'pending' | 'won' | 'lost' | null>(
    null,
  )

  const dragonsRef = useRef(dragons)
  const inventoryRef = useRef(inventory)
  const modeRef = useRef(mode)
  const pausedRef = useRef(paused)
  const roundRef = useRef(round)
  const spawnedRef = useRef(spawnedCount)
  const roundStatsRef = useRef(roundStats)
  const factCountsRef = useRef(factCounts)
  const petsRef = useRef(pets)
  const endingRoundRef = useRef(false)
  const rainingRef = useRef(false)
  const rainTimersRef = useRef<number[]>([])
  const crystalShardsRef = useRef<CrystalShard[]>([])
  const crystalTableRef = useRef<TableFactor | null>(null)
  const crystalOutcomeRef = useRef<'pending' | 'won' | 'lost' | null>(null)
  const crystalResultTimerRef = useRef<number | null>(null)
  const beatenRoundRef = useRef<number | null>(null)

  useEffect(() => {
    dragonsRef.current = dragons
  }, [dragons])
  useEffect(() => {
    inventoryRef.current = inventory
  }, [inventory])
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    pausedRef.current = paused || userPaused
  }, [paused, userPaused])
  useEffect(() => {
    roundRef.current = round
  }, [round])
  useEffect(() => {
    spawnedRef.current = spawnedCount
  }, [spawnedCount])
  useEffect(() => {
    roundStatsRef.current = roundStats
  }, [roundStats])
  useEffect(() => {
    factCountsRef.current = factCounts
  }, [factCounts])
  useEffect(() => {
    petsRef.current = pets
  }, [pets])
  useEffect(() => {
    crystalShardsRef.current = crystalShards
  }, [crystalShards])
  useEffect(() => {
    crystalOutcomeRef.current = crystalOutcome
  }, [crystalOutcome])
  useEffect(() => {
    beatenRoundRef.current = beatenRound
  }, [beatenRound])

  useEffect(() => {
    return () => {
      rainTimersRef.current.forEach((id) => window.clearTimeout(id))
      rainTimersRef.current = []
      if (crystalResultTimerRef.current !== null) {
        window.clearTimeout(crystalResultTimerRef.current)
      }
    }
  }, [])

  const finishRound = useCallback((stats: RoundStats) => {
    if (endingRoundRef.current) return
    endingRoundRef.current = true
    setPaused(true)

    setBeatenRound(roundRef.current)
    setEndScreen({ kind: 'summary', round: roundRef.current, stats })
  }, [])

  const checkRoundComplete = useCallback(
    (nextDragons: Dragon[], spawned: number, stats: RoundStats) => {
      if (
        spawned >= DRAGONS_PER_ROUND_QUOTA &&
        nextDragons.length === 0 &&
        !endingRoundRef.current
      ) {
        finishRound(stats)
      }
    },
    [finishRound],
  )

  const beginNextRound = useCallback(() => {
    if (isGameVictory(modeRef.current, petsRef.current, inventoryRef.current.specialGems)) {
      setPaused(true)
      setDragons([])
      setTeleportFx([])
      setEndScreen({ kind: 'victory' })
      return
    }
    endingRoundRef.current = false
    const next = (beatenRoundRef.current ?? roundRef.current) + 1
    setRound(next)
    setRoundStats(emptyRoundStats())
    roundStatsRef.current = emptyRoundStats()
    setSpawnedCount(0)
    spawnedRef.current = 0
    setDragons([])
    setTeleportFx([])
    setEndScreen(null)
    setBeatenRound(null)
    beatenRoundRef.current = null
    setCrystalShards([])
    crystalShardsRef.current = []
    setCrystalOutcome(null)
    crystalOutcomeRef.current = null
    crystalTableRef.current = null
    setPaused(false)
  }, [])

  const tryEnterVictory = useCallback((petsNext: Pet[], gems: TableFactor[]) => {
    if (!isGameVictory(modeRef.current, petsNext, gems)) return false
    setPaused(true)
    setDragons([])
    setTeleportFx([])
    setEndScreen({ kind: 'victory' })
    return true
  }, [])

  const startCrystalStage = useCallback((table: TableFactor) => {
    const shards = createCrystalShards(modeRef.current, table)
    crystalTableRef.current = table
    setCrystalShards(shards)
    crystalShardsRef.current = shards
    setCrystalOutcome('pending')
    crystalOutcomeRef.current = 'pending'
    setEndScreen({ kind: 'crystal', table })
    setPaused(true)
  }, [])

  const resolveCrystalStage = useCallback(
    (won: boolean) => {
      if (crystalOutcomeRef.current !== 'pending') return
      crystalOutcomeRef.current = won ? 'won' : 'lost'
      setCrystalOutcome(won ? 'won' : 'lost')

      // Wins wait for CrystalStage flourish (burst + fall) before advancing.
      if (won) return

      if (crystalResultTimerRef.current !== null) {
        window.clearTimeout(crystalResultTimerRef.current)
      }
      crystalResultTimerRef.current = window.setTimeout(() => {
        crystalResultTimerRef.current = null
        beginNextRound()
      }, CRYSTAL_RESULT_PAUSE_MS)
    },
    [beginNextRound],
  )

  const onCrystalFlourishComplete = useCallback(() => {
    let gems = inventoryRef.current.specialGems
    if (crystalTableRef.current !== null) {
      const table = crystalTableRef.current
      gems = addSpecialGem(inventoryRef.current.specialGems, table)
      setInventory((prev) => {
        const next = {
          ...prev,
          specialGems: gems,
        }
        inventoryRef.current = next
        return next
      })
    }
    // Brief beat so the gem can pop into the pile, then continue or victory.
    if (crystalResultTimerRef.current !== null) {
      window.clearTimeout(crystalResultTimerRef.current)
    }
    crystalResultTimerRef.current = window.setTimeout(() => {
      crystalResultTimerRef.current = null
      if (tryEnterVictory(petsRef.current, gems)) return
      beginNextRound()
    }, 450)
  }, [beginNextRound, tryEnterVictory])

  const onSummaryContinue = useCallback(() => {
    if (tryEnterVictory(petsRef.current, inventoryRef.current.specialGems)) return
    const options = findCrystalEligibleTables(
      petsRef.current,
      inventoryRef.current.specialGems,
    )
    if (options.length > 0) {
      setEndScreen({ kind: 'crystal-select', options })
      return
    }
    beginNextRound()
  }, [beginNextRound, tryEnterVictory])

  const onCrystalSelect = useCallback(
    (table: TableFactor) => {
      startCrystalStage(table)
    },
    [startCrystalStage],
  )

  const onCrystalSkip = useCallback(() => {
    beginNextRound()
  }, [beginNextRound])

  // Main dragon flight loop
  useEffect(() => {
    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (!pausedRef.current) {
        setDragons((prev) => {
          const { dragons: next } = advanceDragons(prev, dt)
          if (next.length !== prev.length) {
            queueMicrotask(() => {
              checkRoundComplete(next, spawnedRef.current, roundStatsRef.current)
            })
          }
          return next
        })
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [checkRoundComplete])

  // Spawning — count outside setState updaters (StrictMode-safe)
  useEffect(() => {
    if (paused || userPaused) return

    const eggsUnlocked = allEggsUnlocked(petsRef.current.length, modeRef.current)
    const awardedTables = new Set(petsRef.current.map((p) => p.table))
    const config = getRoundConfig(round, eggsUnlocked)
    let cancelled = false

    const spawnOne = () => {
      if (cancelled || pausedRef.current) return
      if (spawnedRef.current >= config.dragonsPerRound) return
      if (dragonsRef.current.length >= config.maxDragons) return

      const allowFood = anyHatched(petsRef.current)
      const tables = new Set(petsRef.current.map((p) => p.table))
      const dragon = createDragon(
        modeRef.current,
        config.baseSpeed,
        dragonsRef.current.map((d) => d.yLane),
        factCountsRef.current,
        allowFood,
        tables,
      )

      spawnedRef.current += 1
      setSpawnedCount(spawnedRef.current)
      setDragons((prev) => [...prev, dragon])
    }

    if (spawnedRef.current === 0 && dragonsRef.current.length === 0) {
      const count = Math.min(2, config.maxDragons, config.dragonsPerRound)
      const allowFood = anyHatched(petsRef.current)
      const seeded: Dragon[] = []
      for (let i = 0; i < count; i++) {
        seeded.push(
          createDragon(
            modeRef.current,
            config.baseSpeed,
            seeded.map((d) => d.yLane),
            factCountsRef.current,
            allowFood,
            awardedTables,
          ),
        )
      }
      spawnedRef.current = count
      setSpawnedCount(count)
      setDragons(seeded)
    }

    const spawnId = window.setInterval(spawnOne, config.spawnIntervalMs)
    return () => {
      cancelled = true
      clearInterval(spawnId)
    }
  }, [round, paused, userPaused, mode])

  const submitAnswer = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return
      const answer = Number.parseInt(trimmed, 10)
      if (Number.isNaN(answer)) return

      // Debug: 88888 → full victory state (all pets lv10 + all gems)
      if (answer === 88888 && endScreen?.kind !== 'crystal') {
        const masters: Pet[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((table) => ({
          table: table as TableFactor,
          hatched: true,
          treasure: TREASURE_TO_HATCH,
          level: 10,
          food: 0,
        }))
        setPets(masters)
        petsRef.current = masters
        setInventory((prev) => {
          const next = {
            ...prev,
            specialGems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as TableFactor[],
          }
          inventoryRef.current = next
          return next
        })
        setPaused(true)
        setDragons([])
        setTeleportFx([])
        setEndScreen({ kind: 'victory' })
        return
      }

      // Debug: 99999 → hatched ×1 pet at level 3 + jump into crystal stage
      if (answer === 99999 && endScreen?.kind !== 'crystal') {
        const debugPet: Pet = {
          table: 1,
          hatched: true,
          treasure: TREASURE_TO_HATCH,
          level: 3,
          food: 0,
        }
        setPets((prev) => {
          const without = prev.filter((p) => p.table !== 1)
          const next = [...without, debugPet]
          petsRef.current = next
          return next
        })
        setInventory((prev) => {
          const next = {
            ...prev,
            specialGems: prev.specialGems.filter((t) => t !== 1),
          }
          inventoryRef.current = next
          return next
        })
        setPaused(true)
        setDragons([])
        setTeleportFx([])
        startCrystalStage(1)
        return
      }

      // Crystal stage answers
      if (
        endScreen?.kind === 'crystal' &&
        crystalOutcomeRef.current === 'pending'
      ) {
        const { shards, meldedId } = meldCrystalShard(
          crystalShardsRef.current,
          answer,
        )
        if (!meldedId) return

        // Update ref first so the animation loop never treats this as a miss.
        crystalShardsRef.current = shards
        setCrystalShards(shards)

        // Backup: always finish the meld even if the dock callback is missed.
        window.setTimeout(() => {
          if (crystalOutcomeRef.current !== 'pending') return
          setCrystalShards((prev) => {
            const current = prev.find((s) => s.id === meldedId)
            if (!current || current.status === 'melded') return prev
            const next = finishMeldCrystalShard(prev, meldedId)
            crystalShardsRef.current = next
            if (allCrystalShardsMelded(next)) {
              queueMicrotask(() => resolveCrystalStage(true))
            }
            return next
          })
        }, CRYSTAL_MELD_VFX_MS + 150)
        return
      }

      const result = matchAnswer(
        modeRef.current,
        dragonsRef.current,
        inventoryRef.current,
        answer,
        petsRef.current,
      )

      if (result.collectedIds.length > 0) {
        const hitSet = new Set(result.collectedIds)
        const hits = dragonsRef.current.filter((d) => hitSet.has(d.id))
        const fx = hits.map((d) => ({ ...d }))
        setTeleportFx((prev) => [...prev, ...fx])
        window.setTimeout(() => {
          setTeleportFx((prev) => prev.filter((f) => !hitSet.has(f.id)))
        }, 480)

        if (result.loot.gems > 0 || result.loot.gold > 0) {
          const drops: {
            id: string
            kind: 'gem' | 'gold'
            x: number
            yLane: number
            delayMs: number
            landLeft: number
            landBottom: number
            landRotate: number
            bonusCount: number
          }[] = []

          for (const d of hits) {
            if (d.reward !== 'gem' && d.reward !== 'gold') continue
            const amount = rewardAmount(d.table, petsRef.current)
            const visuals = Math.min(amount, LOOT_FALL_MAX_PIECES)
            for (let i = 0; i < visuals; i++) {
              lootSeqRef.current += 1
              const id = `loot-${lootSeqRef.current}`
              const fan = i - (visuals - 1) / 2
              const layout = layoutTreasureSlot(pileSlotRef.current)
              pileSlotRef.current += 1
              const bonusCount = i === visuals - 1 ? amount - visuals : 0
              const bonusLayouts: { left: number; bottom: number; rotate: number }[] =
                []
              for (let b = 0; b < bonusCount; b++) {
                bonusLayouts.push(layoutTreasureSlot(pileSlotRef.current))
                pileSlotRef.current += 1
              }

              const drop = {
                id,
                kind: d.reward as 'gem' | 'gold',
                x: d.x + fan * 2.2,
                yLane: d.yLane + fan * 0.6,
                delayMs: i * 55,
                landLeft: layout.left,
                landBottom: layout.bottom,
                landRotate: layout.rotate,
                bonusCount,
              }
              drops.push(drop)
              pendingLootRef.current.set(id, {
                kind: drop.kind,
                left: layout.left,
                bottom: layout.bottom,
                rotate: layout.rotate,
                bonusLayouts,
              })
            }
          }

          if (drops.length > 0) {
            setLootDrops((prev) => [...prev, ...drops])
          }
        }
      }

      setDragons(result.dragons)
      setInventory(result.inventory)

      if (result.treasureGained > 0 || result.foodGained > 0) {
        setPets((prev) => {
          let next = prev
          if (result.treasureGained > 0) {
            next = applyTreasureToEggs(next, result.treasureGained)
          }
          if (result.foodGained > 0) {
            next = distributeFood(next, result.foodGained)
          }
          petsRef.current = next
          queueMicrotask(() => {
            tryEnterVictory(next, inventoryRef.current.specialGems)
          })
          return next
        })
      }

      if (result.factKeys.length > 0) {
        setFactCounts((prev) => {
          const next = bumpFactCounts(prev, result.factKeys)
          factCountsRef.current = next

          const owned = new Set(petsRef.current.map((p) => p.table))
          const awards = findNewEggAwards(modeRef.current, next, owned)
          if (awards.length > 0) {
            setPets((petsPrev) => {
              const have = new Set(petsPrev.map((p) => p.table))
              const added = awards.filter((t) => !have.has(t)).map(createEgg)
              if (added.length > 0) {
                setEggToast(added[0]!.table)
                return [...petsPrev, ...added]
              }
              return petsPrev
            })
          }
          return next
        })
      }

      setRoundStats((prev) => {
        const next: RoundStats =
          result.collectedIds.length === 0
            ? { ...prev, incorrect: prev.incorrect + 1 }
            : {
                ...prev,
                correct: prev.correct + result.collectedIds.length,
                gems: prev.gems + result.loot.gems,
                gold: prev.gold + result.loot.gold,
                food: prev.food + result.loot.food,
              }
        roundStatsRef.current = next
        queueMicrotask(() => {
          checkRoundComplete(result.dragons, spawnedRef.current, next)
        })
        return next
      })
    },
    [checkRoundComplete, endScreen, resolveCrystalStage, startCrystalStage, tryEnterVictory],
  )

  const onCrystalMiss = useCallback(() => {
    resolveCrystalStage(false)
  }, [resolveCrystalStage])

  const onCrystalShardDocked = useCallback(
    (id: string) => {
      if (crystalOutcomeRef.current !== 'pending') return
      setCrystalShards((prev) => {
        const current = prev.find((s) => s.id === id)
        if (!current || current.status === 'melded') return prev
        const next = finishMeldCrystalShard(prev, id)
        crystalShardsRef.current = next
        if (allCrystalShardsMelded(next)) {
          queueMicrotask(() => resolveCrystalStage(true))
        }
        return next
      })
    },
    [resolveCrystalStage],
  )

  const onLootDropComplete = useCallback((id: string) => {
    const pending = pendingLootRef.current.get(id)
    pendingLootRef.current.delete(id)
    setLootDrops((prev) => prev.filter((d) => d.id !== id))
    if (!pending) return

    const additions: {
      id: string
      kind: 'gem' | 'gold'
      left: number
      bottom: number
      rotate: number
    }[] = [
      {
        id: `${id}-piece`,
        kind: pending.kind,
        left: pending.left,
        bottom: pending.bottom,
        rotate: pending.rotate,
      },
    ]
    pending.bonusLayouts.forEach((layout) => {
      lootSeqRef.current += 1
      additions.push({
        id: `${id}-bonus-${lootSeqRef.current}`,
        kind: pending.kind,
        left: layout.left,
        bottom: layout.bottom,
        rotate: layout.rotate,
      })
    })
    setPilePieces((prev) => [...prev, ...additions])
  }, [])

  const dismissEggToast = useCallback(() => setEggToast(null), [])

  const pauseGame = useCallback(() => {
    if (!gameStarted) return
    setUserPaused(true)
  }, [gameStarted])

  const resumeGame = useCallback(() => {
    setUserPaused(false)
  }, [])

  const startGame = useCallback((nextMode: GameMode) => {
    setMode(nextMode)
    modeRef.current = nextMode
    setRound(1)
    setRoundStats(emptyRoundStats())
    roundStatsRef.current = emptyRoundStats()
    setSpawnedCount(0)
    spawnedRef.current = 0
    setDragons([])
    setTeleportFx([])
    setInventory(emptyInventory())
    inventoryRef.current = emptyInventory()
    setPets([])
    petsRef.current = []
    setFactCounts({})
    factCountsRef.current = {}
    setPilePieces([])
    pileSlotRef.current = 0
    setLootDrops([])
    setEndScreen(null)
    setBeatenRound(null)
    beatenRoundRef.current = null
    endingRoundRef.current = false
    setCrystalShards([])
    crystalShardsRef.current = []
    setCrystalOutcome(null)
    crystalOutcomeRef.current = null
    crystalTableRef.current = null
    setUserPaused(false)
    setGameStarted(true)
    setPaused(false)
  }, [])

  const castRain = useCallback(() => {
    if (rainingRef.current) return false
    if (inventoryRef.current.gems < RAIN_GEM_COST) return false
    if (!anyHatched(petsRef.current)) return false

    rainingRef.current = true
    setRaining(true)
    setInventory((prev) => ({ ...prev, gems: prev.gems - RAIN_GEM_COST }))
    setPilePieces((prev) => {
      let remaining = RAIN_GEM_COST
      const next = [...prev]
      for (let i = next.length - 1; i >= 0 && remaining > 0; i--) {
        if (next[i]!.kind === 'gem') {
          next.splice(i, 1)
          remaining -= 1
        }
      }
      return next
    })

    const foodTimer = window.setTimeout(() => {
      setPets((prev) => {
        const next = distributeFood(prev, RAIN_FOOD_AMOUNT)
        petsRef.current = next
        queueMicrotask(() => {
          tryEnterVictory(next, inventoryRef.current.specialGems)
        })
        return next
      })
    }, RAIN_FOOD_DELAY_MS)

    const clearTimer = window.setTimeout(() => {
      rainingRef.current = false
      setRaining(false)
      rainTimersRef.current = []
    }, RAIN_DURATION_MS)

    rainTimersRef.current = [foodTimer, clearTimer]
    return true
  }, [tryEnterVictory])

  return {
    mode,
    round,
    dragons,
    inventory,
    spawnedCount,
    dragonsPerRound: DRAGONS_PER_ROUND_QUOTA,
    endScreen,
    pets,
    factCounts,
    eggToast,
    showFactsGrid,
    setShowFactsGrid,
    teleportFx,
    lootDrops,
    pilePieces,
    raining,
    crystalShards,
    crystalOutcome,
    gameStarted,
    userPaused,
    pauseGame,
    resumeGame,
    startGame,
    castRain,
    submitAnswer,
    onSummaryContinue,
    onCrystalSelect,
    onCrystalSkip,
    onCrystalMiss,
    onCrystalShardDocked,
    onCrystalFlourishComplete,
    onLootDropComplete,
    dismissEggToast,
  }
}
