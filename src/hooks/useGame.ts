import { useCallback, useEffect, useRef, useState } from 'react'
import {
  advanceDragons,
  allEggsUnlocked,
  anyHatched,
  applyTreasureToEggs,
  bumpFactCounts,
  createDragon,
  createEgg,
  distributeFood,
  DRAGONS_PER_ROUND_QUOTA,
  emptyInventory,
  emptyRoundStats,
  findNewEggAwards,
  getRoundConfig,
  matchAnswer,
  type Dragon,
  type EndScreen,
  type FactCorrectCounts,
  type Inventory,
  type Pet,
  type RoundStats,
  type TableFactor,
} from '../game'

export function useGame() {
  const [round, setRound] = useState(1)
  const [dragons, setDragons] = useState<Dragon[]>([])
  const [inventory, setInventory] = useState<Inventory>(emptyInventory)
  const [paused, setPaused] = useState(false)
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

  const dragonsRef = useRef(dragons)
  const inventoryRef = useRef(inventory)
  const pausedRef = useRef(paused)
  const roundRef = useRef(round)
  const spawnedRef = useRef(spawnedCount)
  const roundStatsRef = useRef(roundStats)
  const factCountsRef = useRef(factCounts)
  const petsRef = useRef(pets)
  const endingRoundRef = useRef(false)

  useEffect(() => {
    dragonsRef.current = dragons
  }, [dragons])
  useEffect(() => {
    inventoryRef.current = inventory
  }, [inventory])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])
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
    if (paused) return

    const eggsUnlocked = allEggsUnlocked(petsRef.current.length)
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
        config.baseSpeed,
        dragonsRef.current.map((d) => d.yLane),
        factCountsRef.current,
        allowFood,
        tables,
      )

      // Increment outside the setState updater so StrictMode double-invoke
      // cannot count the same spawn twice.
      spawnedRef.current += 1
      setSpawnedCount(spawnedRef.current)
      setDragons((prev) => [...prev, dragon])
    }

    // Seed initial dragons once per round
    if (spawnedRef.current === 0 && dragonsRef.current.length === 0) {
      const count = Math.min(2, config.maxDragons, config.dragonsPerRound)
      const allowFood = anyHatched(petsRef.current)
      const seeded: Dragon[] = []
      for (let i = 0; i < count; i++) {
        seeded.push(
          createDragon(
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
  }, [round, paused])

  const submitAnswer = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return
      const answer = Number.parseInt(trimmed, 10)
      if (Number.isNaN(answer)) return

      const result = matchAnswer(
        dragonsRef.current,
        inventoryRef.current,
        answer,
        petsRef.current,
      )

      if (result.collectedIds.length > 0) {
        const hitSet = new Set(result.collectedIds)
        const fx = dragonsRef.current
          .filter((d) => hitSet.has(d.id))
          .map((d) => ({ ...d }))
        setTeleportFx((prev) => [...prev, ...fx])
        window.setTimeout(() => {
          setTeleportFx((prev) => prev.filter((f) => !hitSet.has(f.id)))
        }, 480)
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
          return next
        })
      }

      if (result.factKeys.length > 0) {
        setFactCounts((prev) => {
          const next = bumpFactCounts(prev, result.factKeys)
          factCountsRef.current = next

          const owned = new Set(petsRef.current.map((p) => p.table))
          const awards = findNewEggAwards(next, owned)
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
    [checkRoundComplete],
  )

  const onSummaryContinue = useCallback(() => {
    endingRoundRef.current = false
    const next = (beatenRound ?? round) + 1
    setRound(next)
    setRoundStats(emptyRoundStats())
    roundStatsRef.current = emptyRoundStats()
    setSpawnedCount(0)
    spawnedRef.current = 0
    setDragons([])
    setTeleportFx([])
    setEndScreen(null)
    setBeatenRound(null)
    setPaused(false)
  }, [beatenRound, round])

  const dismissEggToast = useCallback(() => setEggToast(null), [])

  return {
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
    submitAnswer,
    onSummaryContinue,
    dismissEggToast,
  }
}
