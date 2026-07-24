interface PauseOverlayProps {
  onResume: () => void
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div className="modal-backdrop pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="modal-card">
        <h2 id="pause-title">Paused</h2>
        <p>Dragons are waiting. Take a breath!</p>
        <button type="button" className="modal-button" onClick={onResume} autoFocus>
          Resume
        </button>
      </div>
    </div>
  )
}
