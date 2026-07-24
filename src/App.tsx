import { AnswerInput } from './components/AnswerInput'
import { CrystalSelectModal } from './components/CrystalSelectModal'
import { CrystalStage } from './components/CrystalStage'
import { EggToast } from './components/EggToast'
import { FactsGrid } from './components/FactsGrid'
import { InventoryBadge } from './components/InventoryBadge'
import { LootFall } from './components/LootFall'
import { OrbitingPets } from './components/OrbitingPets'
import { PetsRack } from './components/PetsRack'
import { Playfield } from './components/Playfield'
import { RainButton } from './components/RainButton'
import { RoundProgress } from './components/RoundProgress'
import { RoundSummaryModal } from './components/RoundSummaryModal'
import { StartScreen } from './components/StartScreen'
import { TreasurePile } from './components/TreasurePile'
import { VictoryBanner } from './components/VictoryBanner'
import { anyHatched, modeLabel, modeSymbol } from './game'
import { useGame } from './hooks/useGame'
import './styles/theme.css'
import './styles/game.css'

function App() {
  const {
    mode,
    round,
    dragons,
    inventory,
    spawnedCount,
    dragonsPerRound,
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
  } = useGame()

  const inCrystal = endScreen?.kind === 'crystal'
  const celebrating = endScreen?.kind === 'victory'
  const inputDisabled = !gameStarted || endScreen !== null || showFactsGrid
  const rainDisabled = inputDisabled
  const symbol = modeSymbol(mode)

  return (
    <Playfield dragons={dragons} teleportFx={teleportFx} raining={raining} mode={mode}>
      {!gameStarted && <StartScreen onStart={startGame} />}
      {gameStarted && (
        <>
          <header className="hud-top">
            <h1 className="brand">Dragon Math Facts</h1>
            <div className="hud-top-right">
              <p className="mode-badge" title={modeLabel(mode)}>
                {modeLabel(mode)}
              </p>
              <button
                type="button"
                className="facts-button"
                onClick={() => setShowFactsGrid(true)}
              >
                Facts
              </button>
              <p className="round-badge">Round {round}</p>
            </div>
          </header>

          <PetsRack pets={pets} mode={mode} raining={raining} />

          <div className="hud-bottom">
            <InventoryBadge
              gems={inventory.gems}
              gold={inventory.gold}
              specialGems={inventory.specialGems}
            />
            <div className={`answer-zone${celebrating ? ' answer-zone--victory' : ''}`}>
              <OrbitingPets pets={pets} celebrating={celebrating} />
              <TreasurePile
                pieces={pilePieces}
                specialGems={inventory.specialGems}
                celebrating={celebrating}
              />
              {!celebrating && (
                <div className="answer-row">
                  <AnswerInput onSubmit={submitAnswer} disabled={inputDisabled} />
                  <RainButton
                    gems={inventory.gems}
                    canCast={anyHatched(pets)}
                    raining={raining}
                    onCast={castRain}
                    disabled={rainDisabled}
                  />
                </div>
              )}
            </div>
            {!celebrating && (
              <RoundProgress spawned={spawnedCount} total={dragonsPerRound} />
            )}
          </div>
        </>
      )}

      <LootFall drops={lootDrops} onDropComplete={onLootDropComplete} />

      {eggToast !== null && (
        <EggToast table={eggToast} symbol={symbol} onDismiss={dismissEggToast} />
      )}

      {showFactsGrid && (
        <FactsGrid
          mode={mode}
          factCounts={factCounts}
          onClose={() => setShowFactsGrid(false)}
        />
      )}

      {endScreen?.kind === 'summary' && (
        <RoundSummaryModal
          round={endScreen.round}
          stats={endScreen.stats}
          onContinue={onSummaryContinue}
        />
      )}

      {endScreen?.kind === 'crystal-select' && (
        <CrystalSelectModal
          mode={mode}
          options={endScreen.options}
          pets={pets}
          onSelect={onCrystalSelect}
          onSkip={onCrystalSkip}
        />
      )}

      {inCrystal && endScreen.kind === 'crystal' && (
        <CrystalStage
          mode={mode}
          table={endScreen.table}
          shards={crystalShards}
          outcome={crystalOutcome}
          onSubmit={submitAnswer}
          onMiss={onCrystalMiss}
          onShardDocked={onCrystalShardDocked}
          onFlourishComplete={onCrystalFlourishComplete}
        />
      )}

      {celebrating && <VictoryBanner />}
    </Playfield>
  )
}

export default App
