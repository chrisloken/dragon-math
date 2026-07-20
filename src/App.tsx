import { AnswerInput } from './components/AnswerInput'
import { EggToast } from './components/EggToast'
import { FactsGrid } from './components/FactsGrid'
import { PetsRack } from './components/PetsRack'
import { Playfield } from './components/Playfield'
import { RoundProgress } from './components/RoundProgress'
import { RoundSummaryModal } from './components/RoundSummaryModal'
import { StartScreen } from './components/StartScreen'
import { TreasurePile } from './components/TreasurePile'
import { useGame } from './hooks/useGame'
import './styles/theme.css'
import './styles/game.css'

function App() {
  const {
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
    gameStarted,
    startGame,
    submitAnswer,
    onSummaryContinue,
    dismissEggToast,
  } = useGame()

  const inputDisabled = !gameStarted || endScreen !== null || showFactsGrid

  return (
    <Playfield dragons={dragons} teleportFx={teleportFx}>
      {!gameStarted && <StartScreen onStart={startGame} />}
      <header className="hud-top">
        <h1 className="brand">Dragon Math Facts</h1>
        <div className="hud-top-right">
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

      <PetsRack pets={pets} />

      <TreasurePile gems={inventory.gems} gold={inventory.gold} />

      <div className="hud-bottom">
        <div className="answer-zone">
          <AnswerInput onSubmit={submitAnswer} disabled={inputDisabled} />
        </div>
        <RoundProgress spawned={spawnedCount} total={dragonsPerRound} />
      </div>

      {eggToast !== null && (
        <EggToast table={eggToast} onDismiss={dismissEggToast} />
      )}

      {showFactsGrid && (
        <FactsGrid factCounts={factCounts} onClose={() => setShowFactsGrid(false)} />
      )}

      {endScreen?.kind === 'summary' && (
        <RoundSummaryModal
          round={endScreen.round}
          stats={endScreen.stats}
          onContinue={onSummaryContinue}
        />
      )}
    </Playfield>
  )
}

export default App
